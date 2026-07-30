"""
Tests for CloudLeaf Automation Engine
=====================================
Unit tests using mocked boto3 EC2 clients.
No real AWS resources are touched.
"""

import sys
import os
from unittest.mock import MagicMock

# Ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.automation.automation import stop_instance, resize_instance


# ---------------------------------------------------------------------------
# Stop Instance
# ---------------------------------------------------------------------------

class TestStopInstance:

    def test_stop_instance_success(self):
        mock_ec2 = MagicMock()

        mock_ec2.stop_instances.return_value = {
            "StoppingInstances": [
                {
                    "CurrentState": {
                        "Name": "stopping"
                    }
                }
            ]
        }

        result = stop_instance(
            "i-abc123",
            ec2_client=mock_ec2
        )

        mock_ec2.stop_instances.assert_called_once_with(
            InstanceIds=["i-abc123"]
        )

        assert result["success"] is True
        assert "timestamp" in result
        assert "stopping" in result["message"].lower()


# ---------------------------------------------------------------------------
# Resize Instance
# ---------------------------------------------------------------------------

class TestResizeInstance:

    def test_resize_instance_success(self):

        mock_ec2 = MagicMock()

        mock_waiter = MagicMock()

        mock_ec2.get_waiter.return_value = mock_waiter

        result = resize_instance(
            "i-xyz789",
            "t3.small",
            ec2_client=mock_ec2
        )

        mock_ec2.stop_instances.assert_called_once_with(
            InstanceIds=["i-xyz789"]
        )

        mock_ec2.get_waiter.assert_called_once_with(
            "instance_stopped"
        )

        mock_waiter.wait.assert_called_once_with(
            InstanceIds=["i-xyz789"]
        )

        mock_ec2.modify_instance_attribute.assert_called_once_with(
            InstanceId="i-xyz789",
            InstanceType={
                "Value": "t3.small"
            }
        )

        assert result["success"] is True
        assert "timestamp" in result
        assert "t3.small" in result["message"]