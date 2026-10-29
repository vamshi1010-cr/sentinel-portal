# Sentinel Portal

**Autonomous Web Attack Detection & Incident Response**

A fully synthetic, presentation-ready web application that demonstrates a controlled DDoS/DoS incident against an imaginary campus portal. Built for the research case study:

> _"DoS Attack on an Online Portal — A Research Case Study on Attack Detection, Security Analysis and Prevention"_

---

## ⚠ Important Safety Notice

This application generates **only synthetic, in-memory telemetry**. It does **NOT**:
- Send any real network traffic
- Perform HTTP flooding or packet generation
- Scan external systems
- Generate botnet behaviour
- Interact with any external service

All metrics are deterministic simulation values consumed by the dashboard.

---

## Features

| Feature | Description |
|---|---|
| Autonomous Incident Engine | Phases progress automatically: Normal → Anomaly → Investigation → Incident → Mitigation → Recovery → Resolved |
| Three Scenarios | Volumetric Flood, Low-and-Slow Exhaustion, Legitimate Traffic Surge (false positive demo) |
| Multi-Signal Detection | 5-signal weighted threat score (Traffic, CPU, Latency, Error Rate, Behaviour) |
| Live Charts | Rolling-window charts for all metrics via WebSocket |
| Incident Timeline | Live event log with timestamps |
| Portal Preview | Mock campus portal that degrades during the simulated incident |
| Research Comparison | Traffic-only vs multi-signal detection comparison table |
| Post-Incident Report | Auto-generated summary with peak metrics |
| Demo Controls | Pause, Resume, Replay, Speed control, Scenario switch |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React |
| Backend | Python 3.10+, FastAPI, WebSocket |
| Communication | REST (initial state) + WebSocket (live telemetry at 0.8 s) |
| Storage | None — fully in-memory |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1. Install Backend Dependencies

```bash
cd backend
pip install fastapi uvicorn websockets
```

### 2. Start Backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`.

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Project Structure

```
sentinel-portal/
│
├── backend/
│   ├── main.py                    # FastAPI app, REST + WebSocket endpoints
│   ├── requirements.txt
│   ├── simulation/
│   │   ├── scenarios.py           # Three scenario definitions (phase configs)
│   │   └── engine.py              # Simulation state machine + telemetry generator
│   └── detection/
│       └── __init__.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main layout, navigation, page routing
│   │   ├── types/index.ts         # TypeScript types
│   │   ├── hooks/useTelemetry.ts  # WebSocket + state management
│   │   ├── services/api.ts        # API + WebSocket client
│   │   └── components/
│   │       ├── SystemStatus.tsx
│   │       ├── MetricCard.tsx
│   │       ├── Charts.tsx
│   │       ├── ThreatScore.tsx
│   │       ├── IncidentTimeline.tsx
│   │       ├── IncidentPhaseBar.tsx
│   │       ├── PortalPreview.tsx
│   │       ├── MitigationPanel.tsx
│   │       ├── IncidentReport.tsx
│   │       ├── ComparisonTable.tsx
│   │       └── DemoControls.tsx
│   └── ...config files
│
└── README.md
```

---

## Scenarios

### Scenario 1 — Sudden Volumetric Event
Traffic escalates from ~1,100 to ~48,000 req/s. All signals trigger simultaneously.
**Expected classification:** HIGH-CONFIDENCE TRAFFIC FLOOD

### Scenario 2 — Low-and-Slow Resource Exhaustion
Traffic increases only slightly (~1,200 → ~3,200 req/s) but CPU and latency climb steadily.
Traffic-only detection would miss this. Multi-signal correlation catches it.
**Expected classification:** POSSIBLE LOW-AND-SLOW RESOURCE EXHAUSTION

### Scenario 3 — Legitimate Traffic Surge
Traffic rises dramatically (~1,200 → ~15,000 req/s) but CPU, latency and error rate remain stable.
The system correctly classifies this as NOT an attack — demonstrating false-positive avoidance.
**Expected classification:** LIKELY LEGITIMATE TRAFFIC SURGE

---

## Detection Engine

The threat score is computed as a weighted sum of five signals:

| Signal | Weight |
|---|---|
| Traffic Anomaly | 25% |
| CPU Anomaly | 20% |
| Latency Anomaly | 25% |
| Error Rate Anomaly | 15% |
| Request Behaviour | 15% |

**These weights are a demonstration model and have not been experimentally validated.**

---

## Academic Honesty

- All values are synthetic demonstration data
- Detection times and classifications are produced by the demonstration model
- The comparison table is a conceptual illustration, not an experimental result
- This application does not prove or disprove the effectiveness of any detection method
