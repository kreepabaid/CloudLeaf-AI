"""
CloudLeaf Insights Route
========================
Pipeline route for discovering, validating, and automatically optimizing cloud waste.
"""

from datetime import date
from fastapi import APIRouter
from backend.services.cloudwatch import list_all_instances, get_instance_metrics
from backend.services.waste_detector import build_insight
from backend.ai.validator import validate_insight
from backend.automation.automation import stop_instance, resize_instance
from backend.carbon import estimate_carbon_kg
from backend.storage import append_snapshot

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

        inst_type = instance.get("instance_type", "t3.micro")
        region = insight.get("region") or instance.get("region", "us-east-1")
        insight_type = insight.get("type", "")

        if insight_type in ("idle", "no-network"):
            co2_saved = estimate_carbon_kg(inst_type, region, 720.0)
        elif insight_type == "over-provisioned":
            target_type = insight.get("target_instance_type") or "t3.micro"
            full_co2 = estimate_carbon_kg(inst_type, region, 720.0)
            target_co2 = estimate_carbon_kg(target_type, region, 720.0)
            co2_saved = max(0.0, full_co2 - target_co2)
            if co2_saved == 0.0:
                co2_saved = full_co2 * 0.5
        else:
            co2_saved = 0.0

        insight["estimated_savings_co2_kg"] = round(co2_saved, 2)

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

    total_savings_usd = sum(
        item["insight"].get("estimated_savings_usd", 0.0)
        for item in processed_insights
        if item.get("automation_result") and item["automation_result"].get("success") is True
    )
    total_savings_co2_kg = sum(
        item["insight"].get("estimated_savings_co2_kg", 0.0)
        for item in processed_insights
        if item.get("automation_result") and item["automation_result"].get("success") is True
    )
    auto_approved_count = sum(
        1 for item in processed_insights
        if item.get("validation", {}).get("decision") == "auto_approve"
    )
    awaiting_approval_count = sum(
        1 for item in processed_insights
        if item.get("validation", {}).get("decision") == "needs_approval"
    )

    snapshot = {
        "date": date.today().isoformat(),
        "total_savings_usd": round(total_savings_usd, 2),
        "total_savings_co2_kg": round(total_savings_co2_kg, 2),
        "auto_approved_count": auto_approved_count,
        "awaiting_approval_count": awaiting_approval_count,
        "resources_audited": len(instances),
    }

    append_snapshot(snapshot)

    return {
        "insights": processed_insights,
        "count": len(processed_insights),
    }

