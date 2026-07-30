"""
CloudLeaf Insights Route
========================
Pipeline route for discovering, validating, and automatically optimizing cloud waste.
"""

from fastapi import APIRouter
from backend.services.cloudwatch import list_all_instances, get_instance_metrics
from backend.services.waste_detector import build_insight
from backend.ai.validator import validate_insight
from backend.automation.automation import stop_instance, resize_instance

router = APIRouter()


@router.get("/insights")
def get_insights():
    """Execute the full monitoring -> waste detection -> AI validation -> automation pipeline."""
    instances = list_all_instances()
    processed_insights = []

    for instance in instances:
        metrics = get_instance_metrics(instance["instance_id"])
        insight = build_insight(instance, metrics)

        # Skip healthy instances or instances with no metric data
        if insight is None:
            continue

        validation = validate_insight(insight)
        decision = validation.get("decision")

        automation_result = None

        if decision == "auto_approve":
            insight_type = insight.get("type", "")
            if insight_type in ("idle", "no-network"):
                automation_result = stop_instance(insight["instance_id"])
            elif insight_type == "over-provisioned":
                target_type = insight.get("target_instance_type") or "t3.micro"
                automation_result = resize_instance(insight["instance_id"], target_type)
        elif decision == "needs_approval":
            validation["message"] = "Queued for manual approval"
            automation_result = None
        elif decision == "rejected":
            automation_result = None

        processed_insights.append({
            "insight": insight,
            "validation": validation,
            "automation_result": automation_result,
        })

    return {
        "insights": processed_insights,
        "count": len(processed_insights),
    }
