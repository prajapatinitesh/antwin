import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter(tags=["WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, station_id: str, websocket: WebSocket):
        await websocket.accept()
        if station_id not in self.active_connections:
            self.active_connections[station_id] = []
        self.active_connections[station_id].append(websocket)

    def disconnect(self, station_id: str, websocket: WebSocket):
        if station_id in self.active_connections:
            self.active_connections[station_id].remove(websocket)

    async def broadcast(self, station_id: str, message: dict):
        if station_id in self.active_connections:
            for connection in self.active_connections[station_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/stations/{station_id}")
async def websocket_endpoint(websocket: WebSocket, station_id: str):
    st_id = station_id.upper()
    await manager.connect(st_id, websocket)
    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "event": "connected",
            "station_id": st_id,
            "message": f"Connected to ANTWIN Digital Twin real-time stream for {st_id}"
        }))
        while True:
            # Keep alive and receive client events
            data = await websocket.receive_text()
            # Echo or handle incoming commands
            await websocket.send_text(json.dumps({
                "event": "heartbeat",
                "station_id": st_id,
                "status": "ONLINE"
            }))
    except WebSocketDisconnect:
        manager.disconnect(st_id, websocket)
    except Exception:
        manager.disconnect(st_id, websocket)
