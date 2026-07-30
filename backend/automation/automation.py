"""
CloudLeaf Automation Engine
============================
Simulated AWS optimization actions for the hackathon demo.
No real AWS calls are made — every action returns a structured
JSON response describing what *would* happen.

Supported actions:
  - stop_instance   — terminate an idle instance
  - resize_instance — right-size an over-provisioned instance
  - no_action       — explicitly do nothing (for rejected insights)
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def stop_instance(instance_id: str) -> dict[str, Any]:
    """Simulate stopping / terminating an EC2 instance.

    Args:
        instance_id: The AWS instance ID to stop.

    Returns:
        A structured result dict.
    """
    return _build_result(
        action="stop",
        instance_id=instance_id,
        detail=f"Instance {instance_id} has been stopped (simulated)."
    )


def resize_instance(instance_id: str, new_type: str) -> dict[str, Any]:
    """Simulate resizing an EC2 instance to a smaller type.

    Args:
        instance_id: The AWS instance ID to resize.
        new_type:    The target instance type (e.g. "t3.medium").

    Returns:
        A structured result dict.
    """
    return _build_result(
        action="resize",
        instance_id=instance_id,
        detail=f"Instance {instance_id} resized to {new_type} (simulated).",
        new_type=new_type
    )


def no_action(instance_id: str) -> dict[str, Any]:
    """Explicitly skip any action on an instance.

    Args:
        instance_id: The AWS instance ID.

    Returns:
        A structured result dict.
    """
    return _build_result(
        action="no_action",
        instance_id=instance_id,
        detail=f"No action taken on {instance_id}."
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_result(
    action: str,
    instance_id: str,
    detail: str,
    new_type: str | None = None
) -> dict[str, Any]:
    """Construct a standardised automation result payload."""
    result: dict[str, Any] = {
        "status": "success",
        "action": action,
        "instance_id": instance_id,
        "detail": detail,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if new_type is not None:
        result["new_type"] = new_type
    return result
