"""
CloudLeaf Demo History Seed Module
===================================
Populates backend/data/history.json with 6 synthetic monthly snapshots (Feb-Jul 2026)
showing a realistic improving trend if the history file is empty or missing.
"""

from __future__ import annotations

import json
from pathlib import Path
from backend.storage import DATA_DIR, HISTORY_FILE, get_history

# 6 synthetic monthly snapshots showing an improving trend (Feb-Jul 2026)
DEMO_SNAPSHOTS = [
    {
        "date": "2026-02-28",
        "period": "Feb 2026",
        "total_savings_usd": 120.0,
        "total_savings_co2_kg": 45.0,
        "auto_approved_count": 3,
        "awaiting_approval_count": 2,
        "resources_audited": 12,
        "spend": 1450.0,
        "carbon": 520.0,
        "savings": 120.0,
        "co2Reduced": 45.0,
        "timestamp": "2026-02-28T23:59:59+00:00",
    },
    {
        "date": "2026-03-31",
        "period": "Mar 2026",
        "total_savings_usd": 185.0,
        "total_savings_co2_kg": 68.0,
        "auto_approved_count": 5,
        "awaiting_approval_count": 2,
        "resources_audited": 14,
        "spend": 1380.0,
        "carbon": 490.0,
        "savings": 185.0,
        "co2Reduced": 68.0,
        "timestamp": "2026-03-31T23:59:59+00:00",
    },
    {
        "date": "2026-04-30",
        "period": "Apr 2026",
        "total_savings_usd": 240.0,
        "total_savings_co2_kg": 92.0,
        "auto_approved_count": 6,
        "awaiting_approval_count": 3,
        "resources_audited": 15,
        "spend": 1290.0,
        "carbon": 450.0,
        "savings": 240.0,
        "co2Reduced": 92.0,
        "timestamp": "2026-04-30T23:59:59+00:00",
    },
    {
        "date": "2026-05-31",
        "period": "May 2026",
        "total_savings_usd": 310.0,
        "total_savings_co2_kg": 115.0,
        "auto_approved_count": 8,
        "awaiting_approval_count": 1,
        "resources_audited": 18,
        "spend": 1180.0,
        "carbon": 410.0,
        "savings": 310.0,
        "co2Reduced": 115.0,
        "timestamp": "2026-05-31T23:59:59+00:00",
    },
    {
        "date": "2026-06-30",
        "period": "Jun 2026",
        "total_savings_usd": 420.0,
        "total_savings_co2_kg": 155.0,
        "auto_approved_count": 11,
        "awaiting_approval_count": 2,
        "resources_audited": 20,
        "spend": 1050.0,
        "carbon": 360.0,
        "savings": 420.0,
        "co2Reduced": 155.0,
        "timestamp": "2026-06-30T23:59:59+00:00",
    },
    {
        "date": "2026-07-31",
        "period": "Jul 2026",
        "total_savings_usd": 550.0,
        "total_savings_co2_kg": 210.0,
        "auto_approved_count": 14,
        "awaiting_approval_count": 1,
        "resources_audited": 24,
        "spend": 920.0,
        "carbon": 310.0,
        "savings": 550.0,
        "co2Reduced": 210.0,
        "timestamp": "2026-07-31T23:59:59+00:00",
    },
]


def seed_demo_history() -> None:
    """Populate backend/data/history.json with synthetic monthly snapshots if history is empty."""
    history = get_history()
    if not history:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(DEMO_SNAPSHOTS, f, indent=2)
