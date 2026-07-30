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
import os

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
INSTANCE_ID = os.getenv("EC2_INSTANCE_ID")

ec2 = boto3.client(
    "ec2",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def stop_instance(instance_id: str) -> dict[str, Any]:
    """Stop a real EC2 instance."""

    try:
        response = ec2.stop_instances(
            InstanceIds=[instance_id]
        )

        state = response["StoppingInstances"][0]["CurrentState"]["Name"]

        return _build_result(
            action="stop",
            instance_id=instance_id,
            detail=f"EC2 instance {instance_id} is now {state}."
        )

    except ClientError as e:
        return {
            "status": "error",
            "action": "stop",
            "instance_id": instance_id,
            "detail": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

def start_instance(instance_id: str) -> dict[str, Any]:
    """Start a real EC2 instance."""

    try:
        response = ec2.start_instances(
            InstanceIds=[instance_id]
        )

        state = response["StartingInstances"][0]["CurrentState"]["Name"]

        return _build_result(
            action="start",
            instance_id=instance_id,
            detail=f"EC2 instance {instance_id} is now {state}."
        )

    except ClientError as e:
        return {
            "status": "error",
            "action": "start",
            "instance_id": instance_id,
            "detail": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

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
