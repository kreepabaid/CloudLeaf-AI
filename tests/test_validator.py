"""
Tests for CloudLeaf AI Validator
=================================
Covers all four decision paths:
  - critical → rejected
  - prod → needs_approval
  - high CPU → rejected
  - normal dev → auto_approve
"""

import sys
import os

# Ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ai.validator import (
    validate_insight,
    DECISION_AUTO_APPROVE,
    DECISION_NEEDS_APPROVAL,
    DECISION_REJECTED,
)


# ---------------------------------------------------------------------------
# Fixtures / helpers
# ---------------------------------------------------------------------------

def _make_insight(**overrides):
    """Build a minimal valid insight dict, applying any overrides."""
    base = {
        "insight_id": "INS-001",
        "instance_id": "i-test123",
        "type": "idle",
        "metric_summary": {
            "cpu_avg": 5.0,
            "network_in_bytes": 10000
        },
        "recommendation": "Stop instance",
        "estimated_savings_usd": 100.0,
        "risk_level": "low",
        "requires_approval": False,
        "tags": {
            "env": "dev",
            "critical": False
        }
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

class TestValidatorCritical:
    """Rule 1: critical workloads must be rejected."""

    def test_critical_instance_is_rejected(self):
        insight = _make_insight(tags={"env": "dev", "critical": True})
        result = validate_insight(insight)
        assert result["decision"] == DECISION_REJECTED
        assert "critical" in result["reason"].lower()


class TestValidatorProd:
    """Rule 2: production workloads require manual approval."""

    def test_prod_instance_needs_approval(self):
        insight = _make_insight(tags={"env": "prod", "critical": False})
        result = validate_insight(insight)
        assert result["decision"] == DECISION_NEEDS_APPROVAL
        assert "production" in result["reason"].lower() or "manual" in result["reason"].lower()


class TestValidatorHighCPU:
    """Rule 3: instances above 70% CPU must be rejected."""

    def test_high_cpu_is_rejected(self):
        insight = _make_insight(
            metric_summary={
                "cpu_avg": 85.0,
                "network_in_bytes": 10000
            }
        )
        result = validate_insight(insight)
        assert result["decision"] == DECISION_REJECTED
        assert "cpu" in result["reason"].lower()

    def test_boundary_cpu_70_is_not_rejected(self):
        """Exactly 70% should NOT be rejected (threshold is >70)."""
        insight = _make_insight(
            metric_summary={
                "cpu_avg": 70.0,
                "network_in_bytes": 10000
            }
        )
        result = validate_insight(insight)
        assert result["decision"] == DECISION_AUTO_APPROVE


class TestValidatorAutoApprove:
    """Rule 4: safe insights are auto-approved."""

    def test_normal_dev_instance_auto_approved(self):
        insight = _make_insight()
        result = validate_insight(insight)
        assert result["decision"] == DECISION_AUTO_APPROVE
        assert "auto" in result["reason"].lower()
