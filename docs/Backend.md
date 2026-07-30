# CloudLeaf Backend — Backend.md

## Architecture Overview

CloudLeaf's backend follows a **serverless-first** design:

```
┌────────────────────────────────────────────────┐
│                 API Gateway / Event             │
└───────────────────┬────────────────────────────┘
                    │  insight JSON
                    ▼
┌────────────────────────────────────────────────┐
│             Lambda Handler                      │
│   backend/lambda/lambda_handler.py              │
│                                                 │
│   1. Parse incoming event                       │
│   2. Call AI Validator                           │
│   3. Execute Automation (if approved)            │
│   4. Return structured response                  │
└────────┬──────────────────────────┬─────────────┘
         │                          │
         ▼                          ▼
┌────────────────┐     ┌────────────────────────┐
│  AI Validator   │     │  Automation Engine      │
│  backend/ai/    │     │  backend/automation/    │
│  validator.py   │     │  automation.py          │
│                 │     │                         │
│  Rule-based     │     │  Simulated AWS actions: │
│  decision       │     │   - stop_instance       │
│  engine         │     │   - resize_instance     │
│                 │     │   - no_action            │
└────────────────┘     └────────────────────────┘
```

## Components

### 1. AI Validator (`backend/ai/validator.py`)

A **rule-based validation engine** that evaluates each insight in priority order:

| Priority | Rule | Decision |
|----------|------|----------|
| 1 | `tags.critical == true` | `rejected` |
| 2 | `tags.env == "prod"` | `needs_approval` |
| 3 | `cpu_avg_7d > 70` | `rejected` |
| 4 | Everything else | `auto_approve` |

**Input:** A single insight JSON object.
**Output:** `{ "decision": "...", "reason": "..." }`

### 2. Automation Engine (`backend/automation/automation.py`)

Simulated AWS optimization actions. **No real AWS calls are made.**

| Function | Action | When Used |
|----------|--------|-----------|
| `stop_instance(id)` | Stop/terminate | Idle or no-network instances |
| `resize_instance(id, new_type)` | Right-size | Over-provisioned instances |
| `no_action(id)` | Skip | Rejected insights |

Each returns a structured JSON with `status`, `action`, `instance_id`, `detail`, and `timestamp`.

### 3. Lambda Handler (`backend/lambda/lambda_handler.py`)

The orchestration layer that ties everything together. Accepts an insight, validates it, and executes the appropriate action.

**Response codes:**
- `200` — Action executed (auto-approved or rejected with no_action)
- `202` — Queued for manual approval
- `400` — Bad request (malformed input)
- `500` — Internal error

## Folder Structure

```
winning hackathon/
├── backend/
│   ├── __init__.py
│   ├── ai/
│   │   ├── __init__.py
│   │   └── validator.py          # Rule-based AI validator
│   ├── automation/
│   │   ├── __init__.py
│   │   └── automation.py         # Simulated AWS actions
│   └── lambda/
│       ├── __init__.py
│       └── lambda_handler.py     # Lambda entry point
├── contracts/
│   └── insight.schema.json       # Shared data contract
├── tests/
│   ├── sample_insights.json      # Demo sample data
│   ├── test_validator.py         # AI validator tests
│   └── test_automation.py        # Automation engine tests
├── docs/
│   └── Backend.md                # This file
├── requirements.txt              # Python dependencies
└── src/                          # React frontend (untouched)
```

## How to Run

### Prerequisites
- Python 3.10+
- pip

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Tests
```bash
pytest tests/ -v
```

### Invoke the Lambda Locally
```python
import json
from backend.lambda.lambda_handler import handler

insight = {
    "id": "test-001",
    "type": "idle",
    "instance_id": "i-abc123",
    "region": "us-east-1",
    "tags": {"env": "dev", "critical": False},
    "cpu_avg_7d": 2.0,
    "recommendation": "Stop idle instance",
    "target_instance_type": None,
    "confidence": 98,
    "estimated_savings_usd": 420.0,
}

response = handler(insight)
print(json.dumps(json.loads(response["body"]), indent=2))
```
