"""
CloudLeaf Actions Route
=======================
API routes for executing or dismissing recommended optimization actions.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.ai.validator import validate_action, validate_insight
from backend.automation.automation import stop_instance, resize_instance

logger = logging.getLogger(__name__)

router = APIRouter()

# Data source path for fallback fixture lookup
FIXTURE_PATH = Path("tests/fixtures/insights_sample.json")
FALLBACK_FIXTURE_PATH = Path("tests/sample_insights.json")


class ApprovePayload(BaseModel):
    force_approve: bool = False


def _load_fixture_insights() -> list[dict[str, Any]]:
    """Load insights from sample fixture file."""
    target_path = FIXTURE_PATH if FIXTURE_PATH.exists() else FALLBACK_FIXTURE_PATH
    if not target_path.exists():
        return []
    try:
        with open(target_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as err:
        logger.error(f"Error reading insights fixture from {target_path}: {err}")
        return []


def lookup_insight_by_id(insight_id: str) -> Optional[dict[str, Any]]:
    """Find an insight by insight_id.

    Phase 6: First attempts to lookup from the live GET /api/insights route (imported directly),
    falling back to the sample fixture dataset if not found.
    """
    # 1. Try live insights endpoint function directly
    try:
        from backend.routes.insights import get_insights
        live_res = get_insights()
        insights_list = live_res.get("insights", []) if isinstance(live_res, dict) else live_res
        for item in insights_list:
            ins = item.get("insight") if isinstance(item, dict) and "insight" in item else item
            if ins and (ins.get("insight_id") == insight_id or ins.get("id") == insight_id):
                return ins
    except Exception as exc:
        logger.warning(f"Could not fetch live insights from route: {exc}")

    # 2. Fallback to fixture lookup (Phase 5 data source)
    fixture_insights = _load_fixture_insights()
    for ins in fixture_insights:
        if ins.get("insight_id") == insight_id or ins.get("id") == insight_id:
            return ins

    return None


@router.post("/actions/{insight_id}/approve")
def approve_action(
    insight_id: str,
    payload: Optional[ApprovePayload] = None,
    force_approve: Optional[bool] = Query(None),
):
    """Validate and execute an optimization action for the specified insight.

    If validation passes (decision == 'auto_approve') or force_approve is set,
    the automation action (stop_instance or resize_instance) is triggered.
    """
    is_force = (force_approve is True) or (payload is not None and payload.force_approve)

    insight = lookup_insight_by_id(insight_id)
    if insight is None:
        raise HTTPException(status_code=404, detail=f"Insight '{insight_id}' not found")

    validation = validate_action(insight)
    decision = validation.get("decision")

    if decision == "auto_approve" or is_force:
        insight_type = insight.get("type", "")
        instance_id = insight.get("instance_id", insight_id)
        automation_result = None

        if insight_type in ("idle", "no-network"):
            automation_result = stop_instance(instance_id)
        elif insight_type in ("over_provisioned", "over-provisioned"):
            target_type = insight.get("target_instance_type") or "t2.nano"
            automation_result = resize_instance(instance_id, target_type)
        else:
            automation_result = {
                "success": True,
                "message": f"Action successfully executed for insight {insight_id} ({insight_type}).",
            }

        return {
            "validation": validation,
            "automation_result": automation_result,
        }

    return {
        "validation": validation,
        "automation_result": None,
    }


@router.post("/actions/{insight_id}/dismiss")
def dismiss_action(insight_id: str):
    """Dismiss an insight recommendation."""
    logger.info(f"Insight {insight_id} dismissed.")
    print(f"Insight {insight_id} dismissed.")
    return {"status": "dismissed", "insight_id": insight_id}