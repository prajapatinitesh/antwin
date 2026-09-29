from fastapi import APIRouter, HTTPException
from app.simulation.dependencies import get_dependency_graph, get_node_details

router = APIRouter(prefix="", tags=["Dependencies"])

@router.get("/stations/{station_id}/dependencies")
def get_station_dependencies(station_id: str):
    st_id = station_id.upper()
    return get_dependency_graph(st_id)

@router.get("/dependencies/node/{node_id}")
def get_node_info(node_id: str, station_id: str = "MAITRI"):
    details = get_node_details(node_id, station_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return details
