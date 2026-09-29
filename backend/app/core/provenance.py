from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DataClass(str, Enum):
    LIVE = "LIVE"
    REPLAY = "REPLAY"
    REFERENCE = "REFERENCE"
    SIMULATED = "SIMULATED"
    DERIVED = "DERIVED"

class TemporalStatus(str, Enum):
    CURRENT = "CURRENT"
    HISTORICAL = "HISTORICAL"
    PLANNED = "PLANNED"
    SIMULATED = "SIMULATED"

class ProvenanceRecord(BaseModel):
    data_class: DataClass
    source: str
    source_year: Optional[int] = None
    station: Optional[str] = None
    unit: Optional[str] = None
    temporal_status: TemporalStatus = TemporalStatus.CURRENT
    confidence: Optional[str] = "HIGH"
    formula: Optional[str] = None
    inputs: Optional[List[str]] = None
    notes: Optional[str] = None

def make_provenance(
    data_class: DataClass,
    source: str,
    source_year: Optional[int] = 2025,
    station: Optional[str] = None,
    unit: Optional[str] = None,
    temporal_status: TemporalStatus = TemporalStatus.CURRENT,
    confidence: str = "HIGH",
    formula: Optional[str] = None,
    inputs: Optional[List[str]] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    return ProvenanceRecord(
        data_class=data_class,
        source=source,
        source_year=source_year,
        station=station,
        unit=unit,
        temporal_status=temporal_status,
        confidence=confidence,
        formula=formula,
        inputs=inputs,
        notes=notes
    ).model_dump()
