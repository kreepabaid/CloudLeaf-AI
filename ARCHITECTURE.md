# CloudLeaf AI — System Architecture

This document provides a high-level architecture overview of **CloudLeaf AI**, illustrating the data pipeline, AI validation rules, Action Center human-in-the-loop governance, and persistence layer.

---

## High-Level Data Flow & Architecture

```mermaid
flowchart TD
    %% Styling & Theme Definition
    classDef frontend fill:#e6f4ea,stroke:#005237,stroke-width:2px,color:#005237;
    classDef backend fill:#fef3d6,stroke:#795919,stroke-width:2px,color:#795919;
    classDef engine fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px,color:#1a73e8;
    classDef decision fill:#fce8e6,stroke:#c5221f,stroke-width:2px,color:#c5221f;
    classDef storage fill:#f1f3f4,stroke:#3c4043,stroke-width:2px,color:#202124;

    subgraph Frontend ["Frontend Layer (React 19 + Vite 6)"]
        UI_Dash["Dashboard\n(Telemetry & Forecasts)"]:::frontend
        UI_Action["Action Center\n(Queue & Approval Tabs)"]:::frontend
        UI_Reports["Executive Reports\n(PDF / CSV Audit)"]:::frontend
        UI_Settings["Settings Page\n(IAM Governance)"]:::frontend
    end

    subgraph Backend ["Backend API Layer (FastAPI)"]
        API_Insights["GET /api/insights"]:::backend
        API_Reports["GET /api/reports/summary"]:::backend
        API_Account["GET /api/account"]:::backend
        API_Actions["POST /api/actions/{id}/approve"]:::backend
    end

    subgraph Monitoring ["Cloud Monitoring Service"]
        CW_Service["CloudWatch & EC2 Collector\n(boto3 API Integration)"]:::engine
    end

    subgraph Pipeline ["Optimization & Safety Pipeline"]
        Waste_Det["1. Waste Detector\n(CPU & Hardware Power Auditing)"]:::engine
        Validator["2. AI Safety Validator\n(Rule-Based Risk Engine)"]:::engine

        %% Validation Decisions
        Dec_Auto["⚡ Auto-Approved\n(Low-Risk Dev Workloads)"]:::engine
        Dec_Needs["⏳ Needs Approval\n(Prod Non-Critical Workloads)"]:::engine
        Dec_Reject["⛔ Rejected / Locked\n(Critical or CPU > 70%)"]:::decision

        Auto_Engine["3. Automation Engine\n(stop_instance / resize_instance)"]:::engine
    end

    subgraph Storage ["Persistence Layer"]
        DB[("SQLite Database\n(backend/data/cloudleaf.db)")]:::storage
    end

    %% Connections
    UI_Dash -->|Fetch Telemetry| API_Reports
    UI_Reports -->|Fetch Audit Summary| API_Reports
    UI_Settings -->|Fetch Identity| API_Account
    UI_Action -->|Fetch Recommendations| API_Insights

    API_Insights --> CW_Service
    CW_Service --> Waste_Det
    Waste_Det -->|Discovered Insights| Validator

    Validator --> Dec_Auto
    Validator --> Dec_Needs
    Validator --> Dec_Reject

    %% Decision Pathways
    Dec_Auto -->|Auto-Execute Action| Auto_Engine
    Dec_Needs -->|Display in Action Center Queue| UI_Action
    UI_Action -->|Human Manual Sign-off| API_Actions
    API_Actions -->|Force Execute| Auto_Engine

    Dec_Reject -->|Log Lock Status| DB
    Auto_Engine -->|Save Telemetry Snapshot| DB
    API_Reports -->|Query Historical Trends| DB
```

---

## Architectural Highlights

### 1. Data Telemetry & Waste Detection
- **CloudWatch & EC2 Collector**: Reads real-time compute metrics and tags via AWS SDK (`boto3`).
- **Waste Detector**: Classifies workloads as **Idle** (`CPU < 15%`), **Over-provisioned** (`15% <= CPU < 40%`), or **Healthy**. Calculates regional carbon avoidance using Scope 2 GHG grid intensity factors (`kg CO2 / kWh`).

### 2. Multi-Stage AI Safety Validator
Rules are evaluated in strict priority order before any automated action is permitted:
1. **Rule 1 (Block Critical)**: `critical: true` workloads are immediately **Rejected / Locked**.
2. **Rule 2 (Require Sign-off)**: `env: "prod"` workloads require human queue sign-off (**Needs Approval**).
3. **Rule 3 (High CPU Safety)**: Workloads with `CPU > 70%` are **Rejected**.
4. **Rule 4 (Auto-Approve)**: Non-prod, non-critical, safe workloads are **Auto-Approved**.

### 3. Human-in-the-Loop Governance Flow
Production workloads queued under **Awaiting Approval** can be reviewed and manually executed through the Action Center (`POST /api/actions/{id}/approve`), triggering the Automation Engine on-demand.

### 4. Storage & Persistence
All executed actions, telemetry snapshots, and historical monthly trends persist in an embedded **SQLite database** (`backend/data/cloudleaf.db`).
