"""
CloudLeaf Raw Metrics Route
===========================
Returns un-filtered instance metadata merged with 7-day CPU utilization metrics.
"""

from fastapi import APIRouter
from backend.services.cloudwatch import list_all_instances, get_instance_metrics

router = APIRouter()


@router.get("/metrics")
def get_metrics():
    """Fetch raw instance metrics for dashboard visualization."""
    instances = list_all_instances()
    raw_metrics = []

    for instance in instances:
        m = get_instance_metrics(instance["instance_id"])
        merged = {**instance, **m}
        raw_metrics.append(merged)

    return {
        "metrics": raw_metrics,
        "count": len(raw_metrics),
    }
