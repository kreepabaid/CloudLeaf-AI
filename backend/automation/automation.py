"""
CloudLeaf Automation Engine
============================
Simulated and Real AWS EC2 optimization actions.

Default mode is SIMULATED (no real AWS calls are made). Real AWS calls only occur
if CLOUDLEAF_SIMULATE=false is explicitly set in the environment.

Supported actions:
  - stop_instance   — stop an idle instance
  - resize_instance — right-size an over-provisioned instance (stop -> modify type)
  - no_action       — explicitly do nothing (for rejected insights)
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

# Module-level constant controlling simulation vs real AWS actions.
# Defaults to True unless CLOUDLEAF_SIMULATE is explicitly set to "false".
SIMULATE: bool = os.getenv("CLOUDLEAF_SIMULATE", "true").lower() == "true"


def stop_instance(instance_id: str, ec2_client: Any = None) -> dict[str, Any]:
    """Stop an EC2 instance.

    Args:
        instance_id: The AWS instance ID to stop.
        ec2_client:  Optional boto3 EC2 client for real AWS operations.

    Returns:
        A structured result dict.
    """
    if SIMULATE:
        message = f"EC2 instance {instance_id} has been stopped (simulated)."
        return {
            "success": True,
            "status": "success",
            "action": "stop",
            "instance_id": instance_id,
            "message": message,
            "detail": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Real AWS call when SIMULATE is False
    if ec2_client is None:
        import boto3
        region = os.getenv("AWS_REGION", "ap-south-1")
        ec2_client = boto3.client("ec2", region_name=region)

    response = ec2_client.stop_instances(InstanceIds=[instance_id])
    message = f"EC2 instance {instance_id} has been stopped."
    return {
        "success": True,
        "status": "success",
        "action": "stop",
        "instance_id": instance_id,
        "message": message,
        "detail": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "aws_response": response,
    }


def resize_instance(
    instance_id: str, target_type: str, ec2_client: Any = None
) -> dict[str, Any]:
    """Resize an EC2 instance to a target type (stop -> modify instance type).

    Args:
        instance_id: The AWS instance ID to resize.
        target_type: The target instance type (e.g. "t3.medium").
        ec2_client:  Optional boto3 EC2 client for real AWS operations.

    Returns:
        A structured result dict.
    """
    if SIMULATE:
        message = f"Instance {instance_id} resized to {target_type} and left stopped (simulated)."
        return {
            "success": True,
            "status": "success",
            "action": "resize",
            "instance_id": instance_id,
            "new_type": target_type,
            "target_type": target_type,
            "message": message,
            "detail": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Real AWS flow when SIMULATE is False
    if ec2_client is None:
        import boto3
        region = os.getenv("AWS_REGION", "ap-south-1")
        ec2_client = boto3.client("ec2", region_name=region)

    # 1. Stop instance
    ec2_client.stop_instances(InstanceIds=[instance_id])

    # 2. Wait until instance is fully stopped
    waiter = ec2_client.get_waiter("instance_stopped")
    waiter.wait(InstanceIds=[instance_id])

    # 3. Modify instance attribute to change type
    ec2_client.modify_instance_attribute(
        InstanceId=instance_id,
        InstanceType={"Value": target_type},
    )

    message = f"Instance {instance_id} resized to {target_type} and left stopped."
    return {
        "success": True,
        "status": "success",
        "action": "resize",
        "instance_id": instance_id,
        "new_type": target_type,
        "target_type": target_type,
        "message": message,
        "detail": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def no_action(instance_id: str) -> dict[str, Any]:
    """Explicitly skip any action on an instance.

    Args:
        instance_id: The AWS instance ID.

    Returns:
        A structured result dict.
    """
    message = f"No action taken on {instance_id}."
    return {
        "success": True,
        "status": "success",
        "action": "no_action",
        "instance_id": instance_id,
        "message": message,
        "detail": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
