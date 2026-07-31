"""
Unit tests for backend/routes/account.py
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_get_account_details():
    response = client.get("/api/account")
    assert response.status_code == 200
    data = response.json()

    assert "accountId" in data
    assert "iamRoleArn" in data
    assert "status" in data
    assert "regionsMonitored" in data
    assert "collectorVersion" in data
