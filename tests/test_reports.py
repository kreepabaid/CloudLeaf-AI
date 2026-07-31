"""
Unit tests for backend/routes/reports.py
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_get_reports_summary():
    response = client.get("/api/reports/summary")
    assert response.status_code == 200
    data = response.json()

    assert "current_stats" in data
    assert "historical_trends" in data

    stats = data["current_stats"]
    assert "activeInsightsCount" in stats
    assert "autoApprovalCount" in stats
    assert "awaitingApprovalCount" in stats
    assert "totalResourcesAudited" in stats
    assert "monthlyCostSaved" in stats
    assert "monthlyCarbonSaved" in stats

    trends = data["historical_trends"]
    assert isinstance(trends, list)
