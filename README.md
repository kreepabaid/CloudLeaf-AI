# CloudLeaf AI

> **Continuous Cloud Carbon & Cost Optimizer**

CloudLeaf AI is an intelligent cloud governance and sustainability platform that monitors AWS infrastructure, detects resource waste, validates optimization actions through automated safety rules, and reduces both financial spend and carbon footprint.

---

## Problem Statement

Modern cloud environments suffer from hidden idle resources, over-provisioned compute instances, and unoptimized regional power draw, resulting in billions of dollars in wasted cloud spend and unnecessary carbon emissions. Engineering teams lack real-time visibility into the carbon intensity of their regional workloads and fear automated actions breaking production environments. CloudLeaf AI bridges this gap by combining hardware power modeling, GHG Protocol Scope 2 grid accounting, and multi-stage safety validation to safely automate cloud optimization.

---

## Key Features

- **Automated Waste Detection**: Continuously audits EC2, RDS, S3, and EKS workloads to identify idle instances (< 15% CPU avg) and over-provisioned hardware (15%–40% CPU avg).
- **Rule-Based AI Validation Engine**: Evaluates recommendations against safety rules — automatically blocking critical workloads, queuing production changes for human approval, and auto-approving low-risk dev actions.
- **Automated Optimization Engine**: Executes simulated or real AWS EC2 actions (`stop_instance`, `resize_instance`) with real-time feedback.
- **Action Center Approval Flow**: Interactive queue interface with filter tabs for Pending Queue, Auto-Approved, Awaiting Approval, High Risk / Locked, and Recently Executed actions.
- **Regional Carbon Factor Accounting**: Calculates Scope 2 emissions using hardware wattage formulas (`INSTANCE_POWER_WATTS`) and regional electricity grid carbon intensity factors (`REGION_CARBON_FACTOR`).
- **Executive Audit Reports**: Generates downloadable PDF and CSV sustainability audit reports with performance index scoring and GHG protocol breakdown.
- **Real AWS Account Governance**: Integrates directly with AWS STS identity (`get_caller_identity`) and monitored regions telemetry.
- **Persistent SQLite Data Layer**: Stores historical snapshots and telemetry performance trends in an embedded SQLite database (`cloudleaf.db`).

---

## Tech Stack

### Frontend
- **Framework & Build**: React 19, Vite 6, React Router DOM v7
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons, Glassmorphism Ivory Canopy Design System
- **Data Visualization**: Recharts (Area & Bar Charts)
- **Export & Canvas**: jsPDF, html2canvas

### Backend
- **Framework & API**: Python 3.12, FastAPI, Uvicorn, Starlette
- **AWS Integration**: Boto3, Botocore (EC2, CloudWatch, STS)
- **Database & Storage**: SQLite (`sqlite3`), Python `json`
- **Testing**: Pytest, FastAPI TestClient

---

## Architecture Overview

```
[ AWS CloudWatch & EC2 / Inventory ]
                 │
                 ▼
[ 1. Waste Detector (backend/services/waste_detector.py) ]
                 │
                 ▼
[ 2. AI Validator (backend/ai/validator.py) ]
    ├── Critical Workloads ──► REJECTED (High Risk / Locked)
    ├── Prod Workloads ──────► NEEDS_APPROVAL (Awaiting Queue)
    └── Dev Workloads ───────► AUTO_APPROVE
                 │
                 ▼
[ 3. Automation Engine (backend/automation/automation.py) ]
                 │
                 ▼
[ 4. SQLite Storage (backend/storage.py -> cloudleaf.db) ]
```

---

## How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API (FastAPI)
```bash
# Install Python dependencies
pip install fastapi uvicorn boto3 python-dotenv pytest

# Start the backend server on http://127.0.0.1:8000
uvicorn backend.main:app --reload --port 8000
```

### 2. Start the Frontend Dev Server (Vite)
```bash
# Install Node dependencies
npm install

# Start the frontend dev server on http://localhost:3000
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000) to access CloudLeaf AI.

---

## Testing

CloudLeaf AI includes an extensive unit test suite covering carbon calculations, storage persistence, waste detection, validator safety rules, and API endpoints located in `tests/`.

Run the test suite:
```bash
python -m pytest -v
```

**Current Test Results**: `27 passed` across 9 test files (100% passing).

---

## Screenshots

![Dashboard](/screenshots/dashboard.png)
*Cloud Telemetry & Carbon Audit Dashboard with Prophet forecasting, metric cards, and carbon accounting formula visualizer.*

![Action Center](/screenshots/action-center.png)
*Cloud Optimization Action Center showing filtered recommendation queues (Auto-Approved, Awaiting Approval, High Risk / Locked, Executed).*

![Executive Report](/screenshots/report.png)
*Executive Audit Report with performance index score, GHG Protocol Scope 2 verification, PDF export, and CSV download.*

![Settings & Governance](/screenshots/settings.png)
*Settings & Account Governance panel showing real AWS IAM role ARNs, account identity, and automation safety controls.*
