"""
CloudLeaf Storage Utility
=========================
Manages persistent JSON file storage for historical optimization snapshots.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent / "data"
HISTORY_FILE = DATA_DIR / "history.json"


def append_snapshot(snapshot: dict[str, Any]) -> None:
    """Append a snapshot dictionary (with a timestamp) to the stored history list.

    Creates the directory and file if they do not exist.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    history = get_history()

    snapshot_to_store = dict(snapshot)
    if "timestamp" not in snapshot_to_store:
        snapshot_to_store["timestamp"] = datetime.now(timezone.utc).isoformat()

    history.append(snapshot_to_store)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def get_history() -> list[dict[str, Any]]:
    """Return the full list of stored historical snapshots."""
    if not HISTORY_FILE.exists():
        return []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []
    except (json.JSONDecodeError, OSError):
        return []
