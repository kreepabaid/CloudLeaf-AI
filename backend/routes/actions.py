import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from backend.ai.validator import validate_insight
from backend.automation.automation import stop_instance, resize_instance

router = APIRouter()

# Temporary data source (easy to replace with a database/API later)
DATA_FILE = Path("tests/sample_insights.json")


def load_insights():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


@router.post("/actions/{insight_id}/approve")
def approve_action(insight_id: str, force_approve: bool = False):
    insights = load_insights()

    insight = next(
        (item for item in insights if item["insight_id"] == insight_id),
        None,
    )

    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")

    validation = validate_insight(insight)
    decision = validation.get("decision")

    if decision == "auto_approve" or force_approve:
        automation_result = None

        if insight["type"] == "idle":
            automation_result = stop_instance(insight["instance_id"])

        elif insight["type"] == "over_provisioned":
            automation_result = resize_instance(
                insight["instance_id"],
                "t2.nano",
            )

        return {
            "validation": validation,
            "automation_result": automation_result,
        }

    return {
        "validation": validation
    }


@router.post("/actions/{insight_id}/dismiss")
def dismiss_action(insight_id: str):
    print(f"Insight {insight_id} dismissed.")

    return {
        "status": "dismissed"
    }