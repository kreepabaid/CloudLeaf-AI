"""
CloudLeaf Carbon Calculation Module
====================================
Provides constants and estimation logic for computing carbon emissions (kg CO2)
of AWS EC2 instances based on instance type, AWS region, and runtime hours.
"""

from __future__ import annotations

# Approximate average power draw in watts for common EC2 instance types
INSTANCE_POWER_WATTS: dict[str, float] = {
    "t2.nano": 3.0,
    "t2.micro": 5.0,
    "t3.micro": 6.0,
    "t3.small": 10.0,
    "t3.medium": 18.0,
    "m5.large": 45.0,
    "m5.xlarge": 90.0,
}

# Grid carbon intensity in kg CO2 per kWh by AWS region
REGION_CARBON_FACTOR: dict[str, float] = {
    "us-east-1": 0.385,
    "eu-west-1": 0.295,
    "us-west-2": 0.190,
    "ap-south-1": 0.708,
}

# Default fallbacks if instance type or region is not in dictionary
DEFAULT_POWER_WATTS: float = 10.0
DEFAULT_CARBON_FACTOR: float = 0.400


def estimate_carbon_kg(instance_type: str, region: str, hours: float) -> float:
    """Estimate CO2 emissions in kg for a given instance type, region, and duration in hours.

    Formula:
        (power_watts / 1000) * hours * region_carbon_factor
    """
    power_watts = INSTANCE_POWER_WATTS.get(instance_type.lower(), DEFAULT_POWER_WATTS)
    carbon_factor = REGION_CARBON_FACTOR.get(region.lower(), DEFAULT_CARBON_FACTOR)
    return (power_watts / 1000.0) * hours * carbon_factor
