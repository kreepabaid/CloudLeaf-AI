"""
CloudLeaf Waste Detector Service
================================
Evaluates resource metrics against optimization thresholds and builds insight objects.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any


def build_insight(instance: dict[str, Any], metrics: dict[str, Any]) -> dict[str, Any] | None:
    """Build an insight dictionary conforming to contracts/insight.schema.json.

    Args:
        instance: Dict containing instance_id, region, tags, etc.
        metrics:  Dict containing instance_id and cpu_avg_7d.

    Returns:
        An insight dictionary if waste is detected, or None otherwise.
    """
    cpu_avg = metrics.get("cpu_avg_7d")

    # If metrics are unavailable, cannot evaluate waste
    if cpu_avg is None:
        return None

    cpu_avg_float = float(cpu_avg)
    import hashlib
    instance_id = instance.get("instance_id", metrics.get("instance_id", ""))
    insight_id = hashlib.md5(instance_id.encode()).hexdigest()[:8]
    region = instance.get("region", "us-east-1")
    tags = instance.get("tags", {"env": "dev", "critical": False})

    # Rule 1: Idle instance (< 15% CPU)
    if cpu_avg_float < 15.0:
        return {
            "id": insight_id,
            "type": "idle",
            "instance_id": instance_id,
            "region": region,
            "tags": tags,
            "cpu_avg_7d": cpu_avg_float,
            "recommendation": "Stop instance",
            "target_instance_type": None,
            "confidence": 90,
            "estimated_savings_usd": 25.0,
        }

    # Rule 2: Over-provisioned instance (15% <= CPU < 40%)
    if 15.0 <= cpu_avg_float < 40.0:
        return {
            "id": insight_id,
            "type": "over-provisioned",
            "instance_id": instance_id,
            "region": region,
            "tags": tags,
            "cpu_avg_7d": cpu_avg_float,
            "recommendation": "Downsize instance to a smaller type",
            "target_instance_type": "t3.micro",
            "confidence": 75,
            "estimated_savings_usd": 12.0,
        }

    # Otherwise healthy workload, no waste detected
    return None
