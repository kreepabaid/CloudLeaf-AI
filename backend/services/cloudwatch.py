"""
CloudLeaf CloudWatch & EC2 Monitoring Service
=============================================
Reads EC2 instance inventory and CloudWatch CPU metrics using boto3.
Includes in-memory TTL caching and fast-path demo fallback to prevent network latency bottlenecks.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any

import boto3
from botocore.config import Config
from dotenv import load_dotenv

# Load AWS environment variables from .env file if present
load_dotenv()

# Fast boto3 configuration with 0.5s connection timeout for local/demo efficiency
boto_config = Config(
    connect_timeout=0.5,
    read_timeout=0.5,
    retries={"max_attempts": 1},
)

# Cache TTL configuration
CACHE_TTL_SECONDS = 30.0
_INSTANCES_CACHE: list[dict[str, Any]] | None = None
_INSTANCES_CACHE_TIME: float = 0.0

_METRICS_CACHE: dict[str, dict[str, Any]] = {}
_METRICS_CACHE_TIME: dict[str, float] = {}

# Hardcoded tag lookups for demo workloads
DEMO_TAGS: dict[str, dict[str, Any]] = {
    "i-0403e5fb9f4f59d0e": {"env": "dev", "critical": False},
    "i-0dev-web-01": {"env": "dev", "critical": False},
    "i-0dev-test-runner": {"env": "dev", "critical": False},
    "rds-dev-postgres-db": {"env": "dev", "critical": False},
    "s3-analytics-temp-logs": {"env": "dev", "critical": False},
    "i-0prod-api-gateway": {"env": "prod", "critical": False},
    "i-0prod-redis-cache": {"env": "prod", "critical": False},
    "eks-staging-worker-node": {"env": "prod", "critical": False},
    "i-0prod-db-master": {"env": "prod", "critical": True},
    "i-0prod-auth-cluster": {"env": "prod", "critical": True},
}

DEMO_METRICS: dict[str, float] = {
    "i-0403e5fb9f4f59d0e": 5.0,
    "i-0dev-web-01": 4.2,
    "i-0dev-test-runner": 2.1,
    "rds-dev-postgres-db": 12.0,
    "s3-analytics-temp-logs": 1.0,
    "i-0prod-api-gateway": 18.0,
    "i-0prod-redis-cache": 19.4,
    "eks-staging-worker-node": 14.5,
    "i-0prod-db-master": 8.5,
    "i-0prod-auth-cluster": 28.0,
}

DEMO_INSTANCES: list[dict[str, Any]] = [
    {
        "instance_id": "i-0dev-web-01",
        "instance_type": "t3.micro",
        "state": "running",
        "region": "ap-south-1",
        "tags": {"env": "dev", "critical": False},
        "awsService": "EC2",
    },
    {
        "instance_id": "i-0dev-test-runner",
        "instance_type": "t2.micro",
        "state": "running",
        "region": "ap-south-1",
        "tags": {"env": "dev", "critical": False},
        "awsService": "EC2",
    },
    {
        "instance_id": "rds-dev-postgres-db",
        "instance_type": "db.t3.medium",
        "state": "available",
        "region": "us-east-1",
        "tags": {"env": "dev", "critical": False},
        "awsService": "RDS",
    },
    {
        "instance_id": "s3-analytics-temp-logs",
        "instance_type": "Standard",
        "state": "active",
        "region": "us-east-1",
        "tags": {"env": "dev", "critical": False},
        "awsService": "S3",
    },
    {
        "instance_id": "i-0prod-api-gateway",
        "instance_type": "m5.large",
        "state": "running",
        "region": "eu-west-1",
        "tags": {"env": "prod", "critical": False},
        "awsService": "EC2",
    },
    {
        "instance_id": "i-0prod-redis-cache",
        "instance_type": "t3.small",
        "state": "running",
        "region": "us-west-2",
        "tags": {"env": "prod", "critical": False},
        "awsService": "EC2",
    },
    {
        "instance_id": "eks-staging-worker-node",
        "instance_type": "m5.large",
        "state": "active",
        "region": "ap-south-1",
        "tags": {"env": "prod", "critical": False},
        "awsService": "EKS",
    },
    {
        "instance_id": "i-0prod-db-master",
        "instance_type": "m5.xlarge",
        "state": "running",
        "region": "ap-south-1",
        "tags": {"env": "prod", "critical": True},
        "awsService": "EC2",
    },
    {
        "instance_id": "i-0prod-auth-cluster",
        "instance_type": "m5.large",
        "state": "running",
        "region": "us-east-1",
        "tags": {"env": "prod", "critical": True},
        "awsService": "EC2",
    },
]

DEFAULT_TAGS: dict[str, Any] = {"env": "dev", "critical": False}


def clear_cloudwatch_cache() -> None:
    """Utility to clear in-memory caches."""
    global _INSTANCES_CACHE, _INSTANCES_CACHE_TIME, _METRICS_CACHE, _METRICS_CACHE_TIME
    _INSTANCES_CACHE = None
    _INSTANCES_CACHE_TIME = 0.0
    _METRICS_CACHE.clear()
    _METRICS_CACHE_TIME.clear()


def list_all_instances() -> list[dict[str, Any]]:
    """Fetch all EC2 instances with 30s TTL caching and fast-path fallback."""
    global _INSTANCES_CACHE, _INSTANCES_CACHE_TIME

    now = time.time()
    if _INSTANCES_CACHE is not None and (now - _INSTANCES_CACHE_TIME) < CACHE_TTL_SECONDS:
        return _INSTANCES_CACHE

    instances: list[dict[str, Any]] = []

    # If live AWS credentials are set, attempt quick EC2 describe
    if os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE"):
        try:
            ec2_client = boto3.client("ec2", config=boto_config)
            region = os.getenv("AWS_REGION", "us-east-1")
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
        except Exception:
            pass

    # Append DEMO_INSTANCES if not already present
    existing_ids = {i["instance_id"] for i in instances}
    for demo in DEMO_INSTANCES:
        if demo["instance_id"] not in existing_ids:
            instances.append(demo)

    _INSTANCES_CACHE = instances
    _INSTANCES_CACHE_TIME = now
    return instances


def get_instance_metrics(instance_id: str) -> dict[str, Any]:
    """Fetch 7-day average CPU utilization metric with 30s TTL caching."""
    global _METRICS_CACHE, _METRICS_CACHE_TIME

    now = time.time()
    if instance_id in _METRICS_CACHE and (now - _METRICS_CACHE_TIME.get(instance_id, 0.0)) < CACHE_TTL_SECONDS:
        return _METRICS_CACHE[instance_id]

    res_data = None
    if os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE"):
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=7)
        try:
            cloudwatch_client = boto3.client("cloudwatch", config=boto_config)
            response = cloudwatch_client.get_metric_statistics(
                Namespace="AWS/EC2",
                MetricName="CPUUtilization",
                Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
                StartTime=start_time,
                EndTime=end_time,
                Period=86400,
                Statistics=["Average"],
            )

            datapoints = response.get("Datapoints", [])
            if datapoints:
                total_cpu = sum(dp.get("Average", 0.0) for dp in datapoints)
                avg_cpu = round(total_cpu / len(datapoints), 2)
                res_data = {"instance_id": instance_id, "cpu_avg_7d": float(avg_cpu)}
        except Exception:
            pass

    if res_data is None:
        demo_cpu = DEMO_METRICS.get(instance_id)
        res_data = {"instance_id": instance_id, "cpu_avg_7d": demo_cpu}

    _METRICS_CACHE[instance_id] = res_data
    _METRICS_CACHE_TIME[instance_id] = now
    return res_data
