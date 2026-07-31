"""
CloudLeaf AI Reasoning Engine
=============================
Generates dynamic explanation text for cloud resource optimization insights
using Anthropic Claude API or AWS Bedrock Claude, with standard fallback template.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

# Timeout in seconds for AI API calls
DEFAULT_TIMEOUT = 5.0


def _get_fallback_reasoning(insight: dict[str, Any]) -> str:
    """Build the standard fallback template string when AI is unavailable or fails."""
    cpu_avg = insight.get("cpu_avg_7d")
    if cpu_avg is None:
        cpu_avg = insight.get("metric_summary", {}).get("cpu_avg", 0)

    recommendation = insight.get("recommendation")
    if not recommendation:
        insight_type = insight.get("type", "")
        if insight_type == "idle":
            recommendation = "Stop instance"
        elif insight_type in ("over_provisioned", "over-provisioned"):
            recommendation = "Downsize instance"
        else:
            recommendation = "optimization"

    rec_clean = str(recommendation).rstrip(".")
    return f"CloudWatch metrics show CPU avg of {cpu_avg}%. Recommending {rec_clean}."


def generate_reasoning(insight: dict[str, Any]) -> str:
    """Generate dynamic reasoning explanation for an optimization insight using LLM.

    Checks for BEDROCK_ENABLED env var to choose between AWS Bedrock Claude runtime
    and direct Anthropic API. Falls back to default template on timeout or error.

    Args:
        insight: Insight dictionary containing instance details and metrics.

    Returns:
        1-2 sentence explanation string.
    """
    fallback = _get_fallback_reasoning(insight)

    # Extract instance data for prompt
    cpu_avg = insight.get("cpu_avg_7d")
    if cpu_avg is None:
        cpu_avg = insight.get("metric_summary", {}).get("cpu_avg", 0)

    instance_id = insight.get("instance_id", insight.get("id", "unknown"))
    insight_type = insight.get("type", "unknown")
    tags = insight.get("tags", {})
    recommendation = insight.get("recommendation", "N/A")
    estimated_savings = insight.get("estimated_savings_usd", 0)

    prompt = (
        "You are a Senior AWS Cloud Sustainability Engineer. "
        f"Given this instance data: {{instance_id: '{instance_id}', cpu_avg_7d: {cpu_avg}, "
        f"type: '{insight_type}', tags: {json.dumps(tags)}, recommendation: '{recommendation}', "
        f"estimated_savings_usd: {estimated_savings}}}, write a 1-2 sentence explanation "
        "of why this optimization is recommended, its safety, and its impact. "
        "Be concise and specific to the numbers given."
    )

    bedrock_enabled = os.getenv("BEDROCK_ENABLED", "false").lower() in ("true", "1", "yes")

    if bedrock_enabled:
        return _call_bedrock_claude(prompt, fallback)
    else:
        return _call_anthropic_claude(prompt, fallback)


def _call_anthropic_claude(prompt: str, fallback: str) -> str:
    """Invoke Claude via direct Anthropic SDK with 5-second timeout."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.debug("ANTHROPIC_API_KEY not configured, using fallback reasoning.")
        return fallback

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key, timeout=DEFAULT_TIMEOUT)
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}],
        )
        if response.content and len(response.content) > 0:
            text = response.content[0].text.strip()
            if text:
                return text
    except Exception as e:
        logger.warning(f"Anthropic API call failed or timed out: {e}. Falling back to default template.")

    return fallback


def _call_bedrock_claude(prompt: str, fallback: str) -> str:
    """Invoke Claude via AWS Bedrock runtime with 5-second timeout."""
    region = os.getenv("AWS_REGION", "us-east-1")
    try:
        import boto3
        from botocore.config import Config

        config = Config(connect_timeout=DEFAULT_TIMEOUT, read_timeout=DEFAULT_TIMEOUT)
        bedrock = boto3.client("bedrock-runtime", region_name=region, config=config)

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 150,
            "messages": [{"role": "user", "content": prompt}],
        })

        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=body,
        )
        response_body = json.loads(response.get("body").read())
        content = response_body.get("content", [])
        if content and len(content) > 0:
            text = content[0].get("text", "").strip()
            if text:
                return text
    except Exception as e:
        logger.warning(f"AWS Bedrock Claude call failed or timed out: {e}. Falling back to default template.")

    return fallback
