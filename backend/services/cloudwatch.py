"""
CloudLeaf CloudWatch & EC2 Monitoring Service
=============================================
Reads EC2 instance inventory and CloudWatch CPU metrics using boto3.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load AWS environment variables from .env file if present
load_dotenv()

# Client instances
ec2_client = boto3.client("ec2")
cloudwatch_client = boto3.client("cloudwatch")

# Hardcoded tag lookups for demo workloads
DEMO_TAGS: dict[str, dict[str, Any]] = {
    "i-0403e5fb9f4f59d0e": {"env": "dev", "critical": False},
}
DEFAULT_TAGS: dict[str, Any] = {"env": "dev", "critical": False}


def list_all_instances() -> list[dict[str, Any]]:
    """Fetch all EC2 instances from the configured region.

    Returns:
        A list of dictionaries containing instance_id, instance_type,
        state, region, and tags.
    """
    region = ec2_client.meta.region_name or "us-east-1"
    instances: list[dict[str, Any]] = []

    try:
        response = ec2_client.describe_instances()
        for reservation in response.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                inst_id = inst.get("InstanceId", "")
                tags = DEMO_TAGS.get(inst_id, DEFAULT_TAGS)
                state = inst.get("State", {}).get("Name", "unknown")

                instances.append({
                    "instance_id": inst_id,
                    "instance_type": inst.get("InstanceType", "unknown"),
                    "state": state,
                    "region": region,
                    "tags": tags,
                })
    except ClientError as exc:
        print(f"Error describing EC2 instances: {exc}")

    return instances


def get_instance_metrics(instance_id: str) -> dict[str, Any]:
    """Fetch 7-day average CPU utilization metric from CloudWatch for a given instance.

    Args:
        instance_id: The EC2 instance ID.

    Returns:
        Dict containing "instance_id" and "cpu_avg_7d" (float or None).
    """
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=7)

    try:
        response = cloudwatch_client.get_metric_statistics(
            Namespace="AWS/EC2",
            MetricName="CPUUtilization",
            Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=86400,  # 1 day in seconds
            Statistics=["Average"],
        )

        datapoints = response.get("Datapoints", [])
        if not datapoints:
            return {"instance_id": instance_id, "cpu_avg_7d": None}

        total_cpu = sum(dp.get("Average", 0.0) for dp in datapoints)
        avg_cpu = round(total_cpu / len(datapoints), 2)
        return {"instance_id": instance_id, "cpu_avg_7d": float(avg_cpu)}

    except ClientError as exc:
        print(f"CloudWatch ClientError for instance {instance_id}: {exc}")
        return {"instance_id": instance_id, "cpu_avg_7d": None}
    except Exception as exc:
        print(f"Unexpected error fetching metrics for instance {instance_id}: {exc}")
        return {"instance_id": instance_id, "cpu_avg_7d": None}
