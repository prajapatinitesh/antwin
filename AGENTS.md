# ANTWIN - AI IDE Agent Instructions

## 1. Project identity

Project name: ANTWIN  
Full name: Antarctic Digital TWIN for Intelligent Operations & Monitoring  
SIH Problem ID: 26060  
Problem: Digital Platform for efficient remote management of Indian Antarctic Research Stations  
Stations: Maitri and Bharati  
Organization: Ministry of Earth Sciences (MoES)  
Department: National Centre for Polar and Ocean Research (NCPOR)  
Theme: Smart Automation

Tagline:
> From Station Monitoring to Mission Intelligence.

Core product statement:
> ANTWIN is a dependency-aware operational Digital Twin for Indian Antarctic research stations that integrates environmental conditions, energy, infrastructure, logistics and mission resources to detect cascading operational risks, estimate mission autonomy and support resilient decisions.

## 2. Non-negotiable product principles

1. ANTWIN is NOT merely a dashboard.
2. ANTWIN is NOT primarily a 3D visualization.
3. Do NOT build 3D/BIM/Three.js unless explicitly requested later.
4. The core differentiator is dependency-aware operational intelligence.
5. The system must model cascading effects across domains.
6. Recommendations must be explainable.
7. Do not claim access to private NCPOR SCADA/BMS/telemetry.
8. Never present synthetic values as real NCPOR data.
9. Every data value must have provenance.
10. Public/current observations, official reference data, simulated telemetry and derived calculations must remain visibly distinct.

## 3. Mandatory four-layer architecture

### Layer 1 - Physical Station & Operational Systems
Power, heating, fuel, water, wastewater, vehicles, assets, personnel, environment, cargo and logistics.

### Layer 2 - Telemetry, Edge & Data Fabric
AWS/BMS/equipment inputs, data ingestion, validation, local persistence, synchronization, SATCOM/network abstraction and store-and-forward behavior.

### Layer 3 - Digital Twin & Intelligence
Dependency graph, thermal/power/fuel models, asset health, cascade analysis, scenario simulation and Mission Autonomy.

### Layer 4 - Mission Operations & Decision Support
Mission Control, station views, alerts, autonomy, risk, scenario comparison, maintenance and resupply decisions.

Do not collapse these into one generic "AI" layer.

## 4. Technology stack

Required MVP stack:
- Frontend: React + TypeScript
- Backend: FastAPI + Python
- Database: SQLite
- ORM/data access: SQLAlchemy or SQLModel
- Validation: Pydantic
- Charts: Recharts
- Real-time UI: FastAPI WebSocket
- Analytics/simulation: Python
- Styling: use a maintainable component/CSS approach; prefer a clean dark operational-console visual system
- API: REST first
- MQTT: optional adapter only, not an MVP dependency
- Deployment: local/single-machine first

Do not introduce PostgreSQL, Kafka, Redis, Kubernetes, microservices, blockchain, deep learning infrastructure or cloud complexity unless explicitly required.

## 5. Data truth policy

Use these four classifications everywhere:

LIVE
- Current/public observations obtained from NCPOR/NPDC or another explicitly documented public source.

REFERENCE
- Official documented station configuration, engineering specifications, expedition planning information or historical engineering information.

SIMULATED
- Prototype-generated telemetry or operational state where private/current station data is unavailable.

DERIVED
- Values calculated by ANTWIN from other data, e.g. autonomy, risk propagation or scenario outcomes.

Every important record should be traceable to:
- source
- source date/year
- station
- unit
- data type
- current/historical/planned status
- confidence where appropriate

Never silently convert historical data into current data.

## 6. Known data caveats

Maitri generator configuration has historical documentation describing 10 generating sets/62.5 kVA-class alternators, but current exact public configuration is not treated as verified. Model current Maitri generator telemetry as SIMULATED and use historical engineering information only for calibration/reference.

Bharati has documented 3 × 100 kVA CHP units and approximately 300 kVA installed electrical capacity. Treat this as REFERENCE configuration, not live telemetry.

Bharati documentation describes approximately 155 kWth maximum thermal demand. This is a maximum/reference parameter, not a constant current thermal load.

Bharati fuel infrastructure is documented in the roughly 296-300 kL class, with source-specific details that can differ. Preserve source-specific values rather than "correcting" them by arithmetic.

Maitri and Bharati personnel capacity values differ by source/version and season. Preserve source/version context.

Maitri-II is future/planned infrastructure. Never mix Maitri-II planned parameters with current Maitri state.

## 7. Core domain modules

Use domain-specific names:
1. Station Identity & Capacity Registry
2. Power & Thermal Plant Monitor
3. Fuel Farm & Consumption Ledger
4. Environmental Condition Engine
5. Maitri Cryosphere Thermal Profile
6. Water & Life-Support Utility
7. Wastewater Treatment Monitor
8. Environmental Compliance Ledger
9. Life-Safety & Security Matrix
10. Asset Reliability Register
11. Polar Mobility Fleet Registry
12. Provision & Cold-Chain Store
13. Expedition Logistics Chain
14. Seasonal Resupply Planner
15. Cargo Lifecycle Tracker
16. Transport Constraint Profile
17. Communication Continuity Monitor
18. Station Dependency Graph
19. Mission Autonomy Engine
20. Cascade Scenario Simulator
21. Operational Decision Console
22. Habitation Load Model
23. Field Operations Envelope

Do not replace these with generic modules like "AI Module", "Analytics Module" or "Management Module" unless technically necessary.

## 8. Mission Autonomy

Mission Autonomy is explainable and expressed in days.

Conceptual calculation:
MA = min(
  energy_endurance,
  fuel_endurance,
  water_endurance,
  provisions_endurance,
  critical_spare_coverage,
  critical_asset_margin,
  logistics_accessibility
)

This is a model, not an official NCPOR metric. Clearly label it as ANTWIN-derived.

The UI should show:
- overall autonomy in days
- limiting constraint
- secondary contributors
- supporting evidence
- mitigation actions
- before/after scenario result

Do not use an unexplained 0-100 "AI score".

## 9. Dependency model

Minimum dependency graph:

WEATHER
  -> ACCESS
  -> HEATING
  -> FIELD OPERATIONS

ACCESS -> LOGISTICS
HEATING -> POWER
FIELD OPERATIONS -> VEHICLES/FUEL
POWER -> FUEL
FUEL -> AUTONOMY
SUPPLIES/SPARES/PERSONNEL -> AUTONOMY
AUTONOMY -> MISSION STATE

Extend it with asset failures and maintenance.

## 10. Primary demo scenario

The main demo should be:

1. Start with normal station state.
2. Inject Generator-02 degradation/failure.
3. Add cold-weather condition.
4. Add a 3-day resupply delay.
5. Show dependency propagation.
6. Show autonomy reduction.
7. Show affected systems.
8. Show explainable mitigation:
   - load redistribution
   - non-critical load shedding
   - heating optimization
   - spare verification
   - resupply reassessment
9. Recalculate.
10. Show improved autonomy and remaining constraints.

The demo must visibly prove that ANTWIN reasons across domains instead of only displaying charts.

## 11. UX requirements

Primary views:
- Mission Control
- Maitri Operational Twin
- Bharati Operational Twin
- Scenario Simulator
- Dependency/Cascade View
- Asset Reliability
- Logistics & Resupply
- Data Provenance / Data Health

Mission Control must prioritize:
- both station status
- mission autonomy
- energy/fuel
- active critical risks
- logistics
- communication state
- alerts
- scenario access

Use a serious operational-console aesthetic. Avoid gimmicky sci-fi UI.

## 12. Coding rules

- Keep code modular and readable.
- Use typed interfaces/models.
- Keep business logic out of React components.
- Keep database models separate from simulation logic.
- Write deterministic simulation logic where possible.
- Use seeded synthetic data for repeatable demos.
- Add unit tests for formulas and scenario transitions.
- Never hard-code critical business logic into visual components.
- Use configuration/constants for simulation parameters.
- Add source/provenance metadata to reference data.
- Use ISO timestamps.
- Store units explicitly or use strongly named fields.
- Handle missing/stale data visibly.
- Make the app usable without internet after initial setup.

## 13. Definition of done

A feature is not done merely because it renders.

It must have:
- backend model/API if data-backed
- validation
- seeded/demo data if needed
- provenance
- error/empty states
- usable UI
- deterministic behavior
- basic tests for critical calculations
- no unsupported claims

## 14. Working style for the AI IDE

Before coding:
1. Read this file.
2. Read docs/PRD.md.
3. Read docs/SRS.md.
4. Read docs/ARCHITECTURE.md.
5. Read docs/DESIGN.md.
6. Inspect docs/Content/.
7. Reconcile contradictions.
8. State assumptions in a project note.
9. Build incrementally.

Do not rewrite the architecture because of a convenient library.

When requirements conflict:
- preserve factual/data provenance constraints first
- preserve the four-layer architecture second
- preserve core demo path third
- simplify implementation rather than weakening the product concept

Do not ask for information that is already present in the repository.
