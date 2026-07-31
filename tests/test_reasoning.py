"""
Tests for CloudLeaf AI Reasoning Engine
=======================================
Tests AI reasoning generation, Anthropic & Bedrock SDK integrations (mocked),
and graceful fallback behavior when API is unavailable or times out.
"""

import os
import sys
from unittest.mock import patch, MagicMock

# Ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ai.reasoning_engine import generate_reasoning, _get_fallback_reasoning


def _sample_insight():
    return {
        "id": "INS-100",
        "instance_id": "i-0123456789test",
        "type": "idle",
        "cpu_avg_7d": 4.5,
        "recommendation": "Stop instance",
        "estimated_savings_usd": 35.0,
        "tags": {"env": "dev", "critical": False},
    }


class TestReasoningFallback:
    """Test standard fallback template generation."""

    def test_fallback_template_formatting(self):
        insight = _sample_insight()
        fallback = _get_fallback_reasoning(insight)
        assert "CloudWatch metrics show CPU avg of 4.5%" in fallback
        assert "Recommending Stop instance" in fallback

    def test_fallback_when_no_api_key(self, monkeypatch):
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        monkeypatch.setenv("BEDROCK_ENABLED", "false")
        insight = _sample_insight()
        result = generate_reasoning(insight)
        assert result == _get_fallback_reasoning(insight)


class TestAnthropicIntegration:
    """Test Anthropic API calling & mocking."""

    def test_anthropic_api_success(self, monkeypatch):
        monkeypatch.setenv("ANTHROPIC_API_KEY", "dummy-test-key")
        monkeypatch.setenv("BEDROCK_ENABLED", "false")

        mock_content = MagicMock()
        mock_content.text = "This idle dev instance uses only 4.5% CPU. Stopping it saves $35/mo safely."
        mock_response = MagicMock()
        mock_response.content = [mock_content]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response

        with patch("anthropic.Anthropic", return_value=mock_client):
            insight = _sample_insight()
            reasoning = generate_reasoning(insight)
            assert reasoning == "This idle dev instance uses only 4.5% CPU. Stopping it saves $35/mo safely."

    def test_anthropic_api_timeout_fallback(self, monkeypatch):
        monkeypatch.setenv("ANTHROPIC_API_KEY", "dummy-test-key")
        monkeypatch.setenv("BEDROCK_ENABLED", "false")

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = Exception("Connection timeout after 5s")

        with patch("anthropic.Anthropic", return_value=mock_client):
            insight = _sample_insight()
            reasoning = generate_reasoning(insight)
            assert reasoning == _get_fallback_reasoning(insight)


class TestBedrockIntegration:
    """Test AWS Bedrock Claude calling & mocking."""

    def test_bedrock_api_success(self, monkeypatch):
        monkeypatch.setenv("BEDROCK_ENABLED", "true")
        monkeypatch.setenv("AWS_REGION", "us-east-1")

        mock_body = MagicMock()
        mock_body.read.return_value = b'{"content": [{"text": "Bedrock Claude: Safe to stop low-CPU instance."}]}'

        mock_bedrock = MagicMock()
        mock_bedrock.invoke_model.return_value = {"body": mock_body}

        with patch("boto3.client", return_value=mock_bedrock):
            insight = _sample_insight()
            reasoning = generate_reasoning(insight)
            assert reasoning == "Bedrock Claude: Safe to stop low-CPU instance."

    def test_bedrock_api_failure_fallback(self, monkeypatch):
        monkeypatch.setenv("BEDROCK_ENABLED", "true")

        with patch("boto3.client", side_effect=Exception("AWS Bedrock Access Denied")):
            insight = _sample_insight()
            reasoning = generate_reasoning(insight)
            assert reasoning == _get_fallback_reasoning(insight)
