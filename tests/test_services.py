"""
Tests for Waste Detector Service
==================================
Verifies waste detection logic for idle, over-provisioned, and healthy workloads.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.waste_detector import build_insight


class TestWasteDetector:
    def test_none_metrics_returns_none(self):
        instance = {"instance_id": "i-123", "region": "us-east-1", "tags": {"env": "dev", "critical": False}}
        metrics = {"instance_id": "i-123", "cpu_avg_7d": None}
        assert build_insight(instance, metrics) is None

    def test_idle_instance_detection(self):
        instance = {"instance_id": "i-0403e5fb9f4f59d0e", "region": "us-east-1", "tags": {"env": "dev", "critical": False}}
        metrics = {"instance_id": "i-0403e5fb9f4f59d0e", "cpu_avg_7d": 4.5}
        
        insight = build_insight(instance, metrics)
        assert insight is not None
        assert insight["type"] == "idle"
        assert insight["instance_id"] == "i-0403e5fb9f4f59d0e"
        assert insight["recommendation"] == "Stop instance"
        assert insight["target_instance_type"] is None
        assert insight["confidence"] == 90
        assert insight["estimated_savings_usd"] == 25.0
        assert len(insight["id"]) == 8

    def test_over_provisioned_detection(self):
        instance = {"instance_id": "i-over123", "region": "us-west-2", "tags": {"env": "prod", "critical": False}}
        metrics = {"instance_id": "i-over123", "cpu_avg_7d": 25.0}

        insight = build_insight(instance, metrics)
        assert insight is not None
        assert insight["type"] == "over-provisioned"
        assert insight["recommendation"] == "Downsize instance to a smaller type"
        assert insight["target_instance_type"] == "t3.micro"
        assert insight["confidence"] == 75
        assert insight["estimated_savings_usd"] == 12.0

    def test_healthy_instance_returns_none(self):
        instance = {"instance_id": "i-busy999", "region": "us-east-1", "tags": {"env": "dev", "critical": False}}
        metrics = {"instance_id": "i-busy999", "cpu_avg_7d": 65.0}
        assert build_insight(instance, metrics) is None
