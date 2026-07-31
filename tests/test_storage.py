"""
Unit tests for backend/storage.py and history logging in routes/insights.py
"""

from backend.storage import append_snapshot, get_history, HISTORY_FILE
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_storage_append_and_get():
    initial_len = len(get_history())

    sample_snapshot = {
        "date": "2026-07-30",
        "total_savings_usd": 37.0,
        "auto_approved_count": 1,
        "awaiting_approval_count": 1,
        "resources_audited": 5,
    }

    append_snapshot(sample_snapshot)
    history = get_history()

    assert len(history) == initial_len + 1
    stored = history[-1]
    assert stored["date"] == "2026-07-30"
    assert stored["total_savings_usd"] == 37.0
    assert stored["auto_approved_count"] == 1
    assert stored["awaiting_approval_count"] == 1
    assert stored["resources_audited"] == 5
    assert "timestamp" in stored


def test_insights_triggers_snapshot():
    initial_len = len(get_history())
    response = client.get("/api/insights")
    assert response.status_code == 200

    history = get_history()
    assert len(history) == initial_len + 1
