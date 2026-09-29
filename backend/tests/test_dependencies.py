import pytest
from app.simulation.dependencies import get_dependency_graph, get_node_details

def test_maitri_dependency_graph():
    graph = get_dependency_graph("MAITRI")
    assert graph["station_id"] == "MAITRI"
    nodes = {n["id"]: n for n in graph["nodes"]}
    assert "environment" in nodes
    assert "heating" in nodes
    assert "power" in nodes
    assert "fuel" in nodes
    assert "autonomy" in nodes

    # Check terminal node
    assert nodes["autonomy"]["category"] == "MISSION"
    assert nodes["autonomy"]["provenance"] == "DERIVED"

    # Check edges
    edge_pairs = [(e["source"], e["target"]) for e in graph["edges"]]
    assert ("environment", "heating") in edge_pairs
    assert ("heating", "power") in edge_pairs
    assert ("power", "fuel") in edge_pairs
    assert ("fuel", "autonomy") in edge_pairs

def test_bharati_dependency_graph():
    graph = get_dependency_graph("BHARATI")
    assert graph["station_id"] == "BHARATI"
    nodes = {n["id"]: n for n in graph["nodes"]}
    assert "seawater_intake" in nodes
    assert "water_pump" in nodes
    assert "ro_plant" in nodes
    assert "freshwater_storage" in nodes
    assert "chp_fleet" in nodes
    assert "autonomy" in nodes

    # Check Bharati signature water path
    edge_pairs = [(e["source"], e["target"]) for e in graph["edges"]]
    assert ("environment", "seawater_intake") in edge_pairs
    assert ("seawater_intake", "water_pump") in edge_pairs
    assert ("water_pump", "ro_plant") in edge_pairs
    assert ("ro_plant", "freshwater_storage") in edge_pairs
    assert ("freshwater_storage", "autonomy") in edge_pairs

def test_get_node_details():
    details = get_node_details("power", "MAITRI")
    assert details is not None
    assert details["node"]["id"] == "power"
    assert len(details["upstream_dependencies"]) > 0
    assert len(details["downstream_impacts"]) > 0

    ro_details = get_node_details("ro_plant", "BHARATI")
    assert ro_details is not None
    assert ro_details["node"]["id"] == "ro_plant"
    assert any(u["node"] == "water_pump" for u in ro_details["upstream_dependencies"])
    assert any(d["node"] == "freshwater_storage" for d in ro_details["downstream_impacts"])
