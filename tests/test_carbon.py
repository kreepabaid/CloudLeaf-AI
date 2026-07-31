"""
Unit tests for backend/carbon.py
"""

from backend.carbon import (
    INSTANCE_POWER_WATTS,
    REGION_CARBON_FACTOR,
    estimate_carbon_kg,
)


def test_estimate_carbon_kg_known_values():
    # t3.micro (6.0 W), us-east-1 (0.385 kg/kWh), 720 hours
    # (6.0 / 1000) * 720 * 0.385 = 0.006 * 720 * 0.385 = 1.6632 kg
    result = estimate_carbon_kg("t3.micro", "us-east-1", 720)
    assert round(result, 4) == 1.6632


def test_estimate_carbon_kg_fallback():
    # unknown instance, unknown region
    # (10.0 / 1000) * 100 * 0.400 = 0.4 kg
    result = estimate_carbon_kg("unknown.type", "unknown-region", 100)
    assert round(result, 4) == 0.4
