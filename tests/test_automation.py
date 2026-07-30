"""
Tests for CloudLeaf Automation Engine
======================================
Verifies simulated actions return correct structure.
"""

import sys
import os

# Ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.automation.automation import stop_instance, resize_instance, no_action


# ---------------------------------------------------------------------------
# Shared assertion helper
# ---------------------------------------------------------------------------

def _assert_common_fields(result, expected_action, expected_instance_id):
    """Check the fields that every automation result must contain."""
    assert result["success"] is True
    assert result["status"] == "success"
    assert result["action"] == expected_action
    assert result["instance_id"] == expected_instance_id
    assert "timestamp" in result
    assert "detail" in result
    assert "message" in result


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

class TestStopInstance:
    def test_stop_returns_correct_payload(self):
        result = stop_instance("i-abc123")
        _assert_common_fields(result, "stop", "i-abc123")
        assert "stopped (simulated)" in result["message"].lower()

    def test_stop_does_not_include_new_type(self):
        result = stop_instance("i-abc123")
        assert "new_type" not in result


class TestResizeInstance:
    def test_resize_returns_correct_payload(self):
        result = resize_instance("i-xyz789", "t3.small")
        _assert_common_fields(result, "resize", "i-xyz789")
        assert result["new_type"] == "t3.small"
        assert "t3.small" in result["message"]

    def test_resize_message_mentions_instance(self):
        result = resize_instance("i-xyz789", "m5.xlarge")
        assert "i-xyz789" in result["message"]


class TestNoAction:
    def test_no_action_returns_correct_payload(self):
        result = no_action("i-skip001")
        _assert_common_fields(result, "no_action", "i-skip001")
        assert "no action" in result["message"].lower()
