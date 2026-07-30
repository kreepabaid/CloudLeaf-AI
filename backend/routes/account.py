"""
CloudLeaf AWS Account & Settings Route
======================================
Retrieves real AWS account identity, role ARN, connection status, and monitored regions.
"""

from __future__ import annotations

import os
from typing import Any
from fastapi import APIRouter
from backend.routes.metrics import get_metrics

router = APIRouter()

CURRENT_VERSION = "v1.4.2-enterprise"


@router.get("/account")
def get_account_details() -> dict[str, Any]:
    """Retrieve AWS account identity, IAM role ARN, connection status, and monitored regions."""
    iam_role_arn = os.getenv(
        "AWS_IAM_ROLE_ARN",
        "arn:aws:iam::849201938210:role/CloudLeafAuditRole",
    )

    account_id = "849201938210"
    status = "Connected"

    try:
        import boto3
        region = os.getenv("AWS_REGION", "ap-south-1")
        sts_client = boto3.client("sts", region_name=region)
        identity = sts_client.get_caller_identity()
        account_id = identity.get("Account", account_id)
        status = "Connected"
    except Exception as exc:
        print(f"Error fetching AWS caller identity: {exc}")
        status = "Disconnected"

    metrics_res = get_metrics()
    metrics_list = metrics_res.get("metrics", [])
    distinct_regions = sorted(
        list({m.get("region") for m in metrics_list if m.get("region")})
    )
    if not distinct_regions:
        distinct_regions = ["us-east-1"]

    return {
        "accountId": account_id,
        "iamRoleArn": iam_role_arn,
        "status": status,
        "regionsMonitored": distinct_regions,
        "collectorVersion": CURRENT_VERSION,
    }
