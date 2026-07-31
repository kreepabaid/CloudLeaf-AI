"""
Unit tests for backend/seed_history.py
"""

from backend.seed_history import seed_demo_history
from backend.storage import get_history


def test_seed_demo_history():
    # Calling seed_demo_history when history is not empty should not overwrite
    history_before = get_history()
    seed_demo_history()
    history_after = get_history()
    assert len(history_after) >= len(history_before)
