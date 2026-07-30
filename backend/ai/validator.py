"""
CloudLeaf AI Validator
======================
Rule-based validation engine that evaluates optimization insights
and decides whether to auto-approve, require manual approval, or reject.

Rules (evaluated in priority order):
  1. REJECT if the workload is tagged as critical.
  2. NEEDS_APPROVAL if the environment is production.
  3. REJECT if average CPU over 7 days exceeds 70%.
  4. AUTO_APPROVE otherwise.
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------------
# Decision constants
# ---------------------------------------------------------------------------
DECISION_AUTO_APPROVE = "auto_approve"
DECISION_NEEDS_APPROVAL = "needs_approval"
DECISION_REJECTED = "rejected"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_insight(insight: dict[str, Any]) -> dict[str, str]:
    """Evaluate a single insight and return a validation decision.

    Args:
        insight: A dictionary conforming to the insight.schema.json contract.

    Returns:
        A dict with two keys:
          - "decision": one of auto_approve | needs_approval | rejected
          - "reason":   human-readable explanation
    """
    tags = insight.get("tags", {})
    metric_summary = insight.get("metric_summary", {})
    cpu_avg = metric_summary.get("cpu_avg", 0)

    # Rule 1 — Critical workloads are never auto-actioned
    if tags.get("critical", False):
        return _decision(
            DECISION_REJECTED,
            "Instance is tagged as critical — automated action is blocked."
        )

    # Rule 2 — Production workloads require human sign-off
    if tags.get("env") == "prod":
        return _decision(
            DECISION_NEEDS_APPROVAL,
            "Instance is in production — manual approval required."
        )

    # Rule 3 — Instances with meaningful load should not be stopped
    if cpu_avg > 70:
        return _decision(
            DECISION_REJECTED,
            f"Average CPU ({cpu_avg}%) is above the 70% threshold — "
            "instance is actively used."
        )

    # Rule 4 — Safe to proceed automatically
    return _decision(
        DECISION_AUTO_APPROVE,
        "Insight passes all safety checks — auto-approved."
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _decision(decision: str, reason: str) -> dict[str, str]:
    """Build a standardised decision payload."""
    return {"decision": decision, "reason": reason}
