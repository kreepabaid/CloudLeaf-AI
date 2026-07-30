"""
Tests for CloudLeaf Actions API (/api/actions)
==============================================
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
client = TestClient(app)

FAKE_INSIGHTS = [
    {
        "insight": {
            "id": "insight-auto-1",
            "type": "idle",
            "instance_id": "i-auto123",
            "region": "ap-south-1",
            "tags": {"env": "dev", "critical": False},
            "cpu_avg_7d": 1.5,
            "recommendation": "Stop idle dev instance",
            "target_instance_type": None,
            "confidence": 95,
            "estimated_savings_usd": 120.0,
        },
        "validation": {
            "decision": "auto_approve",
            "reason": "Insight passes all safety checks — auto-approved.",
        },
        "automation_result": {
            "status": "success",
            "action": "stop",
            "instance_id": "i-auto123",
        },
    },
    {
        "insight": {
            "id": "insight-prod-2",
            "type": "idle",
            "instance_id": "i-prod456",
            "region": "ap-south-1",
            "tags": {"env": "prod", "critical": False},
            "cpu_avg_7d": 2.0,
            "recommendation": "Stop idle prod instance",
            "target_instance_type": None,
            "confidence": 90,
            "estimated_savings_usd": 300.0,
        },
        "validation": {
            "decision": "needs_approval",
            "reason": "Instance is in production — manual approval required.",
        },
        "automation_result": None,
        "message": "Queued for manual approval",
    },
    {
        "insight": {
            "id": "insight-critical-3",
            "type": "idle",
            "instance_id": "i-crit789",
            "region": "ap-south-1",
            "tags": {"env": "dev", "critical": True},
            "cpu_avg_7d": 3.0,
            "recommendation": "Stop critical instance",
            "target_instance_type": None,
            "confidence": 99,
            "estimated_savings_usd": 500.0,
        },
        "validation": {
            "decision": "rejected",
            "reason": "Instance is tagged as critical — automated action is blocked.",
        },
        "automation_result": None,
    },
]


@pytest.fixture(autouse=True)
def stub_get_insights(monkeypatch):
    """Stub get_insights in backend.routes.actions to return FAKE_INSIGHTS."""
    monkeypatch.setattr(
        "backend.routes.actions.get_insights",
        lambda: {"insights": FAKE_INSIGHTS, "count": len(FAKE_INSIGHTS)},
    )


class TestApproveAction:
    def test_approve_auto_approve_calls_automation(self):
        res = client.post("/api/actions/insight-auto-1/approve")
        assert res.status_code == 200
        data = res.json()
        assert data["decision"] == "auto_approve"
        assert data["automation_result"] is not None
        assert data["automation_result"]["action"] == "stop"
        assert data["automation_result"]["instance_id"] == "i-auto123"

    def test_approve_needs_approval_without_force_approve(self):
        res = client.post("/api/actions/insight-prod-2/approve")
        assert res.status_code == 200
        data = res.json()
        assert data["decision"] == "needs_approval"
        assert "not yet wired" in data["message"]
        assert "automation_result" not in data

    def test_approve_needs_approval_with_force_approve(self):
        res = client.post(
            "/api/actions/insight-prod-2/approve",
            json={"force_approve": True},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["decision"] == "needs_approval"
        assert data["automation_result"] is not None
        assert data["automation_result"]["action"] == "stop"
        assert data["automation_result"]["instance_id"] == "i-prod456"

    def test_approve_rejected_never_calls_automation(self):
        res = client.post("/api/actions/insight-critical-3/approve")
        assert res.status_code == 200
        data = res.json()
        assert data["decision"] == "rejected"
        assert data["automation_result"] is None

        res_force = client.post(
            "/api/actions/insight-critical-3/approve",
            json={"force_approve": True},
        )
        assert res_force.status_code == 200
        data_force = res_force.json()
        assert data_force["decision"] == "rejected"
        assert data_force["automation_result"] is None

    def test_approve_unknown_insight_returns_404(self):
        res = client.post("/api/actions/non-existent-insight/approve")
        assert res.status_code == 404
        data = res.json()
        assert "not found" in data["detail"].lower()


class TestDismissAction:
    def test_dismiss_valid_insight(self):
        res = client.post("/api/actions/insight-auto-1/dismiss")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "dismissed"
        assert data["insight_id"] == "insight-auto-1"
