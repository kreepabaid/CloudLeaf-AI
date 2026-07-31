"""
CloudLeaf Storage Utility
=========================
Manages persistent SQLite database storage for historical optimization snapshots.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent / "data"
DB_FILE = DATA_DIR / "cloudleaf.db"
HISTORY_FILE = DATA_DIR / "history.json"


def _get_connection() -> sqlite3.Connection:
    """Create and return a connection to the SQLite database."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize the SQLite database schema and indexes if not already present."""
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                period TEXT,
                total_savings_usd REAL,
                total_savings_co2_kg REAL,
                auto_approved_count INTEGER,
                awaiting_approval_count INTEGER,
                resources_audited INTEGER,
                spend REAL,
                carbon REAL,
                savings REAL,
                co2Reduced REAL,
                timestamp TEXT,
                instance_id TEXT,
                instance_type TEXT,
                env TEXT,
                waste_type TEXT,
                status TEXT,
                decision TEXT,
                cpu_usage REAL,
                cpu_avg_7d REAL,
                memory REAL,
                cost_estimate REAL,
                carbon_kg REAL,
                recommendation TEXT,
                target_instance_type TEXT,
                confidence REAL,
                data_json TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_history_date ON history(date)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_history_period ON history(period)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_history_instance_id ON history(instance_id)")
        conn.commit()


# Automatically initialize schema on module import
init_db()


def append_snapshot(snapshot: dict[str, Any]) -> None:
    """Append a snapshot dictionary (with a timestamp) to the SQLite database."""
    snapshot_to_store = dict(snapshot)
    if "timestamp" not in snapshot_to_store:
        snapshot_to_store["timestamp"] = datetime.now(timezone.utc).isoformat()

    data_json_str = json.dumps(snapshot_to_store)

    date_val = str(snapshot_to_store.get("date", ""))
    period_val = str(snapshot_to_store.get("period", ""))
    total_savings_usd = float(snapshot_to_store.get("total_savings_usd", 0.0))
    total_savings_co2_kg = float(snapshot_to_store.get("total_savings_co2_kg", 0.0))
    auto_approved_count = int(snapshot_to_store.get("auto_approved_count", 0))
    awaiting_approval_count = int(snapshot_to_store.get("awaiting_approval_count", 0))
    resources_audited = int(snapshot_to_store.get("resources_audited", 0))
    spend = float(snapshot_to_store.get("spend", 0.0))
    carbon = float(snapshot_to_store.get("carbon", 0.0))
    savings = float(snapshot_to_store.get("savings", 0.0))
    co2_reduced = float(snapshot_to_store.get("co2Reduced", 0.0))
    timestamp_val = str(snapshot_to_store.get("timestamp", ""))

    instance_id = str(snapshot_to_store.get("instance_id", ""))
    instance_type = str(snapshot_to_store.get("instance_type", ""))
    env = str(snapshot_to_store.get("env", ""))
    waste_type = str(snapshot_to_store.get("waste_type", ""))
    status = str(snapshot_to_store.get("status", ""))
    decision = str(snapshot_to_store.get("decision", ""))
    cpu_usage = float(snapshot_to_store.get("cpu_usage", 0.0))
    cpu_avg_7d = float(snapshot_to_store.get("cpu_avg_7d", 0.0))
    memory = float(snapshot_to_store.get("memory", 0.0))
    cost_estimate = float(snapshot_to_store.get("cost_estimate", 0.0))
    carbon_kg = float(snapshot_to_store.get("carbon_kg", 0.0))
    recommendation = str(snapshot_to_store.get("recommendation", ""))
    target_instance_type = str(snapshot_to_store.get("target_instance_type", ""))
    confidence = float(snapshot_to_store.get("confidence", 0.0))

    with _get_connection() as conn:
        conn.execute(
            """
            INSERT INTO history (
                date, period, total_savings_usd, total_savings_co2_kg,
                auto_approved_count, awaiting_approval_count, resources_audited,
                spend, carbon, savings, co2Reduced, timestamp,
                instance_id, instance_type, env, waste_type, status, decision,
                cpu_usage, cpu_avg_7d, memory, cost_estimate, carbon_kg,
                recommendation, target_instance_type, confidence, data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                date_val, period_val, total_savings_usd, total_savings_co2_kg,
                auto_approved_count, awaiting_approval_count, resources_audited,
                spend, carbon, savings, co2_reduced, timestamp_val,
                instance_id, instance_type, env, waste_type, status, decision,
                cpu_usage, cpu_avg_7d, memory, cost_estimate, carbon_kg,
                recommendation, target_instance_type, confidence, data_json_str
            ),
        )
        conn.commit()


def get_history() -> list[dict[str, Any]]:
    """Return the full list of stored historical snapshots from SQLite."""
    init_db()
    results: list[dict[str, Any]] = []
    try:
        with _get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT data_json FROM history ORDER BY id ASC")
            rows = cursor.fetchall()
            for row in rows:
                try:
                    obj = json.loads(row["data_json"])
                    if isinstance(obj, dict):
                        results.append(obj)
                except (json.JSONDecodeError, TypeError):
                    continue
    except sqlite3.Error as exc:
        print(f"SQLite error retrieving history: {exc}")

    return results
