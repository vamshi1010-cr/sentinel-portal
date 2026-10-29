"""
Simulation engine — produces synthetic telemetry snapshots.
Nothing here sends real traffic or touches external systems.
"""

import time
import math
import random
from typing import Optional, Dict, Any

from simulation.scenarios import SCENARIOS, Scenario, PhaseConfig


def lerp(a: float, b: float, t: float) -> float:
    """Linear interpolation clamped to [0, 1]."""
    t = max(0.0, min(1.0, t))
    return a + (b - a) * t


def _add_noise(value: float, amplitude: float) -> float:
    """Add small random noise so charts look organic."""
    return value + random.uniform(-amplitude, amplitude)


class SimulationEngine:
    """
    Drives a deterministic, phase-based incident simulation.
    Call tick() periodically to advance state and produce a telemetry snapshot.
    """

    def __init__(self, scenario_id: str = "volumetric"):
        self._scenario: Scenario = SCENARIOS[scenario_id]
        self._phase_index: int = 0
        self._phase_elapsed: float = 0.0
        self._last_tick: float = time.monotonic()
        self._running: bool = True
        self._paused: bool = False
        self._timeline_events: list = []
        self._emitted_events: set = set()
        self._incident_id: str = self._generate_incident_id()
        self._peak: Dict[str, float] = {
            "rps": 0, "cpu": 0, "latency_ms": 0,
            "error_rate": 0, "threat_score": 0,
        }
        self._incident_start_time: Optional[float] = None
        self._incident_end_time: Optional[float] = None
        self._incident_declared_at: Optional[float] = None
        self._wall_start: float = time.time()
        self._speed_multiplier: float = 1.0  # demo fast-forward

    # ── public control ──────────────────────────────────────────────────────

    def pause(self):
        self._paused = True

    def resume(self):
        self._paused = False
        self._last_tick = time.monotonic()

    def restart(self, scenario_id: Optional[str] = None):
        if scenario_id:
            self._scenario = SCENARIOS[scenario_id]
        self._phase_index = 0
        self._phase_elapsed = 0.0
        self._last_tick = time.monotonic()
        self._timeline_events = []
        self._emitted_events = set()
        self._incident_id = self._generate_incident_id()
        self._peak = {"rps": 0, "cpu": 0, "latency_ms": 0, "error_rate": 0, "threat_score": 0}
        self._incident_start_time = None
        self._incident_end_time = None
        self._incident_declared_at = None
        self._wall_start = time.time()
        self._paused = False

    def set_speed(self, multiplier: float):
        self._speed_multiplier = max(0.1, min(10.0, multiplier))

    # ── tick ────────────────────────────────────────────────────────────────

    def tick(self) -> Dict[str, Any]:
        now = time.monotonic()
        dt = (now - self._last_tick) * self._speed_multiplier
        self._last_tick = now

        if not self._paused:
            self._phase_elapsed += dt

        phase = self._current_phase()
        t = min(self._phase_elapsed / max(phase.duration_seconds, 0.001), 1.0)

        # Advance phase when time expires (except last phase which is infinite)
        if self._phase_elapsed >= phase.duration_seconds and self._phase_index < len(self._scenario.phases) - 1:
            self._phase_index += 1
            self._phase_elapsed = 0.0
            phase = self._current_phase()
            t = 0.0

        snap = self._build_snapshot(phase, t)
        self._emit_timeline_events(phase, t)
        self._update_peaks(snap)
        return snap

    # ── internals ───────────────────────────────────────────────────────────

    def _current_phase(self) -> PhaseConfig:
        return self._scenario.phases[self._phase_index]

    def _build_snapshot(self, phase: PhaseConfig, t: float) -> Dict[str, Any]:
        rps = _add_noise(lerp(phase.rps_start, phase.rps_end, t), lerp(phase.rps_start, phase.rps_end, t) * 0.03)
        cpu = _add_noise(lerp(phase.cpu_start, phase.cpu_end, t), 1.2)
        memory = _add_noise(lerp(phase.memory_start, phase.memory_end, t), 0.8)
        latency = _add_noise(lerp(phase.latency_start_ms, phase.latency_end_ms, t), lerp(phase.latency_start_ms, phase.latency_end_ms, t) * 0.04)
        error_rate = max(0.0, _add_noise(lerp(phase.error_rate_start, phase.error_rate_end, t), 0.3))
        availability = max(0.0, _add_noise(lerp(phase.availability_start, phase.availability_end, t), 0.2))
        suspicious_ratio = lerp(phase.suspicious_ratio_start, phase.suspicious_ratio_end, t)

        # Synthetic active users derived from rps
        active_users = max(10, int(rps * random.uniform(0.8, 1.0) / 1.1))

        # Compute multi-signal threat score (Demonstration Model — not scientifically validated)
        baseline_rps = 1300.0
        traffic_anomaly = min(100, max(0, (rps / baseline_rps - 1) * 35))
        cpu_anomaly = min(100, max(0, (cpu - 40) * 1.8))
        latency_anomaly = min(100, max(0, (latency - 200) / 48))
        error_anomaly = min(100, max(0, error_rate * 2.8))
        behavior_anomaly = min(100, max(0, suspicious_ratio * 100 * 1.05))

        weights = {"traffic": 0.25, "cpu": 0.20, "latency": 0.25, "error": 0.15, "behavior": 0.15}
        threat_score = (
            traffic_anomaly * weights["traffic"]
            + cpu_anomaly * weights["cpu"]
            + latency_anomaly * weights["latency"]
            + error_anomaly * weights["error"]
            + behavior_anomaly * weights["behavior"]
        )
        threat_score = min(100, max(0, round(_add_noise(threat_score, 1.5), 1)))

        # Track incident timing
        state = phase.state
        if state == "INCIDENT_DECLARED" and self._incident_declared_at is None:
            self._incident_declared_at = time.time()
        if state == "RECOVERING" and self._incident_start_time is None:
            self._incident_start_time = time.time()
        if state == "RESOLVED" and self._incident_end_time is None:
            self._incident_end_time = time.time()

        detection_time_seconds = None
        recovery_time_seconds = None
        if self._incident_declared_at:
            detection_time_seconds = round(self._incident_declared_at - self._wall_start, 1)
        if self._incident_start_time and self._incident_end_time:
            recovery_time_seconds = round(self._incident_end_time - self._incident_start_time, 1)

        return {
            "timestamp": time.time(),
            "scenario_id": self._scenario.id,
            "scenario_name": self._scenario.name,
            "phase_index": self._phase_index,
            "phase_name": phase.name,
            "state": state,
            "classification": self._get_classification(state),
            "classification_color": self._scenario.classification_color if state in ("INCIDENT_DECLARED", "MITIGATION_ACTIVE", "RESOLVED") else "neutral",
            "requests_per_second": round(max(0, rps), 1),
            "active_users": active_users,
            "cpu_percent": round(min(100, max(0, cpu)), 1),
            "memory_percent": round(min(100, max(0, memory)), 1),
            "latency_ms": round(max(0, latency), 1),
            "error_rate": round(min(100, max(0, error_rate)), 2),
            "availability": round(min(100, max(0, availability)), 2),
            "suspicious_ratio": round(suspicious_ratio, 3),
            "signal_scores": {
                "traffic_anomaly": round(traffic_anomaly, 1),
                "cpu_anomaly": round(cpu_anomaly, 1),
                "latency_anomaly": round(latency_anomaly, 1),
                "error_anomaly": round(error_anomaly, 1),
                "behavior_anomaly": round(behavior_anomaly, 1),
            },
            "threat_score": threat_score,
            "incident_id": self._incident_id,
            "detection_time_seconds": detection_time_seconds,
            "recovery_time_seconds": recovery_time_seconds,
            "peaks": dict(self._peak),
            "timeline_events": list(self._timeline_events),
            "is_paused": self._paused,
            "speed_multiplier": self._speed_multiplier,
        }

    def _get_classification(self, state: str) -> str:
        if state in ("INCIDENT_DECLARED", "MITIGATION_ACTIVE"):
            return self._scenario.classification
        if state == "RESOLVED":
            return self._scenario.classification
        if state == "MONITORING":
            return "MONITORING — NO INCIDENT DECLARED"
        return "NORMAL OPERATION"

    def _emit_timeline_events(self, phase: PhaseConfig, t: float):
        events = phase.timeline_events
        n = len(events)
        for i, evt in enumerate(events):
            key = f"{self._phase_index}:{i}"
            if key not in self._emitted_events:
                threshold = (i + 1) / (n + 1)
                if t >= threshold:
                    self._emitted_events.add(key)
                    self._timeline_events.append({
                        "time": time.time(),
                        "phase": phase.name,
                        "state": phase.state,
                        "message": evt,
                    })

    def _update_peaks(self, snap: Dict[str, Any]):
        self._peak["rps"] = max(self._peak["rps"], snap["requests_per_second"])
        self._peak["cpu"] = max(self._peak["cpu"], snap["cpu_percent"])
        self._peak["latency_ms"] = max(self._peak["latency_ms"], snap["latency_ms"])
        self._peak["error_rate"] = max(self._peak["error_rate"], snap["error_rate"])
        self._peak["threat_score"] = max(self._peak["threat_score"], snap["threat_score"])

    @staticmethod
    def _generate_incident_id() -> str:
        import random
        return f"INC-2026-{random.randint(1000, 9999)}"
