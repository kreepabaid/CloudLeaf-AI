"""
CloudLeaf Lambda Handler
========================
AWS Lambda-compatible entry point that orchestrates the full
insight → validate → automate pipeline.

Flow:
  1. Receive an insight JSON (from API Gateway, SQS, etc.)
  2. Run it through the AI validator
  3. If auto-approved, execute the appropriate automation action
  4. Return a structured JSON response
"""

from __future__ import annotations

import json
import sys
import os
from typing import Any

# ---------------------------------------------------------------------------
# Ensure the project root is on sys.path so imports work both
# inside Lambda and when running locally / in tests.
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from backend.ai.validator import (
    validate_insight,
    DECISION_AUTO_APPROVE,
    DECISION_NEEDS_APPROVAL,
)
from backend.automation.automation import stop_instance, resize_instance, no_action


# ---------------------------------------------------------------------------
# Lambda entry point
# ---------------------------------------------------------------------------

def handler(event: dict[str, Any], context: Any = None) -> dict[str, Any]:
    """AWS Lambda handler.

    Args:
        event:   The insight JSON payload (or a dict with a "body" key
                 containing a JSON string, as API Gateway would send).
        context: Lambda context object (unused, kept for compatibility).

    Returns:
        A JSON-serialisable dict with statusCode and body.
    """
    try:
        insight = _parse_event(event)
        validation = validate_insight(insight)
        decision = validation["decision"]

        # --- Auto-approved → run the automation --------------------------
        if decision == DECISION_AUTO_APPROVE:
            automation_result = _execute_action(insight)
            return _response(200, {
                "validation": validation,
                "automation": automation_result,
            })

        # --- Needs manual approval → queue for human review --------------
        if decision == DECISION_NEEDS_APPROVAL:
            return _response(202, {
                "validation": validation,
                "automation": None,
                "message": "Queued for manual approval.",
            })

        # --- Rejected → no action taken ----------------------------------
        automation_result = no_action(insight["instance_id"])
        return _response(200, {
            "validation": validation,
            "automation": automation_result,
        })

    except (KeyError, json.JSONDecodeError, TypeError) as exc:
        return _response(400, {"error": f"Bad request: {exc}"})
    except Exception as exc:  # pragma: no cover — safety net
        return _response(500, {"error": f"Internal error: {exc}"})


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_event(event: dict[str, Any]) -> dict[str, Any]:
    """Normalise the incoming event into an insight dict.

    Handles both raw dicts and API-Gateway-style events where the
    insight is JSON-encoded inside event["body"].
    """
    if "body" in event and isinstance(event["body"], str):
        return json.loads(event["body"])
    return event


def _execute_action(insight: dict[str, Any]) -> dict[str, Any]:
    """Pick and run the correct automation action for an insight."""
    insight_type = insight.get("type", "")
    instance_id = insight["instance_id"]

    if insight_type == "idle" or insight_type == "no-network":
        return stop_instance(instance_id)

    if insight_type == "over-provisioned":
        target_type = insight.get("target_instance_type", "t3.medium")
        return resize_instance(instance_id, target_type)

    # Fallback — unknown type, do nothing
    return no_action(instance_id)


def _response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    """Build a Lambda / API-Gateway compatible response."""
    return {
        "statusCode": status_code,
        "body": json.dumps(body, default=str),
    }
