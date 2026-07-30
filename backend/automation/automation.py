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

def _get_ec2_client():
    return boto3.client(
        "ec2",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

ec2 = boto3.client(
    "ec2",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def stop_instance(instance_id: str, ec2_client=None) -> dict[str, Any]:
    """Stop a real EC2 instance."""
    if ec2_client is None:
        ec2_client = _get_ec2_client()
    try:
        response = ec2_client.stop_instances(
            InstanceIds=[instance_id]
        )

        state = response["StoppingInstances"][0]["CurrentState"]["Name"]

        return {
            "success": True,
            "message": f"EC2 instance {instance_id} is now {state}.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    except ClientError as e:
        return {
            "success": False,
            "message": str(e),
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

def resize_instance(instance_id: str, target_type: str, ec2_client=None) -> dict[str, Any]:
    """
    Resize an EC2 instance.

    The instance is stopped, waited on until fully stopped,
    resized, and intentionally left stopped.
    Restarting is a separate manual step.
    """

    if ec2_client is None:
        ec2_client = _get_ec2_client()

    try:
        # Step 1: Stop the instance
        ec2_client.stop_instances(InstanceIds=[instance_id])

        # Step 2: Wait until it is stopped
        waiter = ec2_client.get_waiter("instance_stopped")
        waiter.wait(InstanceIds=[instance_id])

        # Step 3: Change instance type
        ec2_client.modify_instance_attribute(
            InstanceId=instance_id,
            InstanceType={"Value": target_type},
        )

        # NOTE:
        # We intentionally DO NOT restart the instance here.
        # Restarting is a separate manual approval step.

        return {
            "success": True,
            "message": f"Instance {instance_id} resized to {target_type} and left stopped.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    except ClientError as e:
        return {
            "success": False,
            "message": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


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
