from typing import Dict, Any
from datetime import datetime, timezone

# In-memory edge state for SATCOM communication link simulation
_comm_state = {
    "MAITRI": {
        "link_status": "CONNECTED",  # CONNECTED, LINK_LOSS, BUFFERING
        "queued_records": 0,
        "latency_ms": 640,
        "sync_status": "SYNCHRONIZED",
        "last_sync": "24 Apr 2025, 14:28 IST",
        "data_class": "SIMULATED"
    },
    "BHARATI": {
        "link_status": "CONNECTED",
        "queued_records": 0,
        "latency_ms": 580,
        "sync_status": "SYNCHRONIZED",
        "last_sync": "24 Apr 2025, 14:28 IST",
        "data_class": "SIMULATED"
    }
}

def get_communication_state(station_id: str = "MAITRI") -> Dict[str, Any]:
    st_id = station_id.upper()
    state = _comm_state.get(st_id, _comm_state["MAITRI"])
    if state["link_status"] == "LINK_LOSS":
        state["queued_records"] += 1
    return {
        "station_id": st_id,
        "link_status": state["link_status"],
        "queued_records": state["queued_records"],
        "latency_ms": state["latency_ms"],
        "sync_status": state["sync_status"],
        "last_sync": state["last_sync"],
        "data_class": "SIMULATED"
    }

def simulate_link_loss(station_id: str = "MAITRI") -> Dict[str, Any]:
    st_id = station_id.upper()
    if st_id in _comm_state:
        _comm_state[st_id]["link_status"] = "LINK_LOSS"
        _comm_state[st_id]["sync_status"] = "PENDING (LOCAL BUFFERING)"
        _comm_state[st_id]["queued_records"] = 14
        _comm_state[st_id]["latency_ms"] = 0
    return get_communication_state(st_id)

def restore_communication(station_id: str = "MAITRI") -> Dict[str, Any]:
    st_id = station_id.upper()
    if st_id in _comm_state:
        _comm_state[st_id]["link_status"] = "CONNECTED"
        _comm_state[st_id]["sync_status"] = "SYNCHRONIZED"
        _comm_state[st_id]["queued_records"] = 0
        _comm_state[st_id]["latency_ms"] = 640
        _comm_state[st_id]["last_sync"] = "Just now (Store-and-forward batch synced)"
    return get_communication_state(st_id)
