"""
Tests for CloudLeaf Actions API Endpoint
=========================================
Unit tests for POST /api/actions/{insight_id}/approve and dismiss endpoints.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_approve_non_prod_idle_auto_approve():
    """Test approving a non-prod idle insight (INS-001) returns auto_approve decision and automation_result."""
    response = client.post("/api/actions/INS-001/approve")
    assert response.status_code == 200
    data = response.json()
    assert "validation" in data
    assert data["validation"]["decision"] == "auto_approve"
    assert data["automation_result"] is not None


def test_approve_critical_tagged_rejected():
    """Test approving a critical-tagged insight (INS-003) returns rejected decision and NO automation call."""
    response = client.post("/api/actions/INS-003/approve")
    assert response.status_code == 200
    data = response.json()
    assert "validation" in data
    assert data["validation"]["decision"] == "rejected"
    assert data["automation_result"] is None


def test_approve_prod_needs_approval():
    """Test approving a production insight (INS-002) returns needs_approval decision."""
    response = client.post("/api/actions/INS-002/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["validation"]["decision"] == "needs_approval"
    assert data["automation_result"] is None


def test_force_approve_override():
    """Test force_approve parameter overrides decision and executes action."""
    response = client.post("/api/actions/INS-002/approve?force_approve=true")
    assert response.status_code == 200
    data = response.json()
    assert data["automation_result"] is not None


def test_dismiss_action():
    """Test dismiss endpoint logs and returns status dismissed."""
    response = client.post("/api/actions/INS-001/dismiss")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "dismissed"


def test_approve_non_existent_insight():
    """Test approving a non-existent insight returns 404."""
    response = client.post("/api/actions/INS-9999/approve")
    assert response.status_code == 404
