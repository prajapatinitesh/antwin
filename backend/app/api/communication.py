from fastapi import APIRouter
from app.services.communication import get_communication_state, simulate_link_loss, restore_communication

router = APIRouter(prefix="/stations/{station_id}/communication", tags=["Communication & Edge"])

@router.get("")
def get_comm_state(station_id: str):
    return get_communication_state(station_id)

@router.post("/simulate-loss")
def trigger_link_loss(station_id: str):
    """
    Simulates SATCOM disconnection: station edge continues autonomous monitoring,
    stores records in local buffer queue, and flags store-and-forward status.
    """
    return simulate_link_loss(station_id)

@router.post("/restore")
def trigger_restore(station_id: str):
    """
    Restores SATCOM connection: automatically drains local buffer queue and
    synchronizes central digital twin state.
    """
    return restore_communication(station_id)
