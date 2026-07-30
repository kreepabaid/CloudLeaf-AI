"""
CloudLeaf Actions Route
=======================
Endpoints for approving or dismissing specific optimization insights.
"""

import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.ai.validator import validate_insight
from backend.automation.automation import stop_instance, resize_instance, no_action
from backend.routes.insights import get_insights

router = APIRouter()
logger = logging.getLogger(__name__)


class ApproveRequest(BaseModel):
    force_approve: bool = False


@router.post("/actions/{insight_id}/approve")
def approve_action(
    insight_id: str,
    payload: Optional[ApproveRequest] = None,
) -> dict[str, Any]:
    """Approve an insight and execute automation action if permitted or forced."""
    force_approve = payload.force_approve if payload else False

    insights_response = get_insights()
    insights_list = insights_response.get("insights", [])

    matched_item = None
    for item in insights_list:
        insight = item.get("insight", {})
        if insight.get("id") == insight_id:
            matched_item = item
            break

    if matched_item is None:
        raise HTTPException(
            status_code=404,
            detail=f"Insight with id '{insight_id}' not found.",
        )

    target_insight = matched_item["insight"]
    validation = validate_insight(target_insight)
    decision = validation.get("decision")
    reason = validation.get("reason", "")

    def _run_automation(ins: dict[str, Any]) -> dict[str, Any]:
        ins_type = ins.get("type", "")
        ins_id = ins.get("instance_id", "")
        if ins_type in ("idle", "no-network"):
            return stop_instance(ins_id)
        if ins_type == "over-provisioned":
            target_type = ins.get("target_instance_type") or "t3.micro"
            return resize_instance(ins_id, target_type)
        return no_action(ins_id)

    if decision == "auto_approve":
        automation_result = _run_automation(target_insight)
        return {
            "decision": decision,
            "reason": reason,
            "automation_result": automation_result,
        }

    if decision == "needs_approval":
        if force_approve:
            automation_result = _run_automation(target_insight)
            return {
                "decision": decision,
                "reason": reason,
                "automation_result": automation_result,
            }
        return {
            "decision": decision,
            "reason": reason,
            "message": "Approval flow not yet wired to a live action — pass force_approve: true to confirm.",
        }

    # decision == "rejected"
    return {
        "decision": decision,
        "reason": reason,
        "automation_result": None,
    }


@router.post("/actions/{insight_id}/dismiss")
def dismiss_action(insight_id: str) -> dict[str, Any]:
    """Dismiss an insight by logging the dismissal."""
    logger.info(f"Insight '{insight_id}' has been dismissed.")
    print(f"Insight '{insight_id}' has been dismissed.")
    return {
        "status": "dismissed",
        "insight_id": insight_id,
    }
