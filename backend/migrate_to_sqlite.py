"""
CloudLeaf SQLite Migration Script
=================================
Migrates existing records from backend/data/history.json into backend/data/cloudleaf.db.
"""

from __future__ import annotations

import json
from pathlib import Path
from backend.storage import append_snapshot, get_history, init_db, HISTORY_FILE, DB_FILE


def migrate_json_to_sqlite() -> None:
    """Read history.json and insert all records into SQLite database if DB is empty."""
    init_db()

    current_db_records = get_history()
    if current_db_records:
        print(f"Database already contains {len(current_db_records)} records. Migration skipped.")
        return

    if not HISTORY_FILE.exists():
        print("No history.json found to migrate.")
        return

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)

        if not isinstance(records, list) or not records:
            print("history.json is empty or invalid.")
            return

        print(f"Migrating {len(records)} records from {HISTORY_FILE} to {DB_FILE}...")
        for rec in records:
            append_snapshot(rec)

        print(f"Successfully migrated {len(records)} records to SQLite database {DB_FILE}.")
    except Exception as exc:
        print(f"Error migrating JSON data to SQLite: {exc}")


if __name__ == "__main__":
    migrate_json_to_sqlite()
