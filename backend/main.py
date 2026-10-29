"""
FastAPI backend for Sentinel Portal.
Provides REST endpoints and a WebSocket stream for live telemetry.

IMPORTANT: This application generates ONLY synthetic, in-memory telemetry.
It does NOT send any real network traffic, perform port scans,
or interact with external systems in any way.
"""

import asyncio
import json
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from simulation.engine import SimulationEngine
from simulation.scenarios import SCENARIOS

# ── Global engine (single-user demo) ───────────────────────────────────────────
engine = SimulationEngine(scenario_id="volumetric")
connected_clients: list[WebSocket] = []


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    yield
    task.cancel()


async def broadcast_loop():
    """Push a telemetry snapshot to all connected WebSocket clients every 800 ms."""
    while True:
        await asyncio.sleep(0.8)
        if connected_clients:
            snap = engine.tick()
            payload = json.dumps(snap)
            dead = []
            for ws in connected_clients:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                connected_clients.remove(ws)


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sentinel Portal — Backend",
    description="Synthetic incident simulation for academic demonstration.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/status")
def get_status():
    """Return current telemetry snapshot immediately (HTTP poll fallback)."""
    return engine.tick()


@app.get("/api/scenarios")
def list_scenarios():
    """Return available scenario definitions."""
    return [
        {
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "classification": s.classification,
            "classification_color": s.classification_color,
            "phases": [p.name for p in s.phases],
        }
        for s in SCENARIOS.values()
    ]


@app.post("/api/control/restart")
def restart(scenario_id: Optional[str] = Query(default=None)):
    valid = list(SCENARIOS.keys())
    sid = scenario_id if scenario_id in valid else None
    engine.restart(scenario_id=sid)
    return {"ok": True, "scenario_id": sid or engine._scenario.id}


@app.post("/api/control/pause")
def pause():
    engine.pause()
    return {"ok": True, "paused": True}


@app.post("/api/control/resume")
def resume():
    engine.resume()
    return {"ok": True, "paused": False}


@app.post("/api/control/speed")
def set_speed(multiplier: float = Query(default=1.0)):
    engine.set_speed(multiplier)
    return {"ok": True, "speed_multiplier": multiplier}


@app.post("/api/control/scenario")
def set_scenario(scenario_id: str = Query(...)):
    if scenario_id not in SCENARIOS:
        return {"ok": False, "error": f"Unknown scenario: {scenario_id}"}
    engine.restart(scenario_id=scenario_id)
    return {"ok": True, "scenario_id": scenario_id}


@app.get("/api/comparison")
def get_comparison():
    """
    Return the conceptual traffic-only vs multi-signal detection comparison table.
    This is a static demonstration model — not an experimentally validated result.
    """
    return {
        "label": "Conceptual Demonstration — Simulation-Based Comparison",
        "rows": [
            {
                "event_type": "Legitimate Traffic Surge",
                "traffic_only": "FALSE ALERT",
                "traffic_only_color": "red",
                "multi_signal": "NORMAL",
                "multi_signal_color": "green",
                "notes": "High volume but low resource stress and normal behaviour patterns.",
            },
            {
                "event_type": "Volumetric Flood",
                "traffic_only": "DETECTED",
                "traffic_only_color": "green",
                "multi_signal": "DETECTED",
                "multi_signal_color": "green",
                "notes": "Both methods detect. Multi-signal provides higher confidence.",
            },
            {
                "event_type": "Low-and-Slow Exhaustion",
                "traffic_only": "UNCERTAIN",
                "traffic_only_color": "amber",
                "multi_signal": "DETECTED",
                "multi_signal_color": "green",
                "notes": "Traffic barely rises; CPU, latency and behaviour anomalies trigger detection.",
            },
            {
                "event_type": "Resource Exhaustion",
                "traffic_only": "UNCERTAIN",
                "traffic_only_color": "amber",
                "multi_signal": "DETECTED",
                "multi_signal_color": "green",
                "notes": "Application-layer stress detected without volumetric flood.",
            },
        ],
    }


# ── WebSocket endpoint ─────────────────────────────────────────────────────────

@app.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    # Send one immediate snapshot on connect
    try:
        snap = engine.tick()
        await websocket.send_text(json.dumps(snap))
        # Keep alive — broadcast_loop handles further messages
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)


# ── Static Files & SPA Fallback for Production ───────────────────────────────
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Look for frontend dist in both standard local dev layout and container layouts
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
    "/app/frontend/dist",
]

frontend_dist = next((p for p in possible_dist_paths if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or WS paths
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return {"error": "Not Found"}
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}

