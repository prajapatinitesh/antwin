# ANTWIN — Antarctic Digital TWIN for Intelligent Operations & Monitoring

> **SIH Problem ID:** 26060  
> **Problem Statement:** Digital Platform for efficient remote management of Indian Antarctic Research Stations  
> **Stations:** Maitri and Bharati  
> **Organization:** Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)  
> **Tagline:** *From Station Monitoring to Mission Intelligence.*

---

## 1. Executive Summary & Core Product Concept

ANTWIN is a dependency-aware operational Digital Twin engineered for remote mission management of India’s Antarctic research stations (**Maitri** and **Bharati**). 

Unlike generic IoT dashboards or purely decorative 3D visualizations, ANTWIN integrates environmental conditions, energy systems, infrastructure, logistics, and mission resources to answer five vital operational questions:
1. **What is happening** at the station?
2. **Why is it happening** across cross-domain physical dependencies?
3. **What systems will be affected next** through cascading propagation?
4. **How much Mission Autonomy remains** (in explainable days)?
5. **What actionable mitigation can improve the situation**, and what is the outcome after mitigation?

---

## 2. Four-Layer System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 4 - MISSION OPERATIONS & DECISION SUPPORT                         │
│ • Remote Mission Control Overview (Tactical Radar, Station Cards)       │
│ • Maitri & Bharati Station Digital Twin Consoles                       │
│ • Interactive Scenario Simulator (Cascading fault injection)           │
│ • Station Dependency Graph & Cascading Risk Propagation                │
│ • Data Truth Provenance & Audit Inspector                              │
├──────────────────────────────────▲─────────────────────────────────────┤
│ LAYER 3 - DIGITAL TWIN & INTELLIGENCE                                  │
│ • Multi-Constraint Mission Autonomy Engine (in days)                   │
│ • Directed Graph Cascade & Dependency Propagation Engine               │
│ • Correlated Thermal, Power, and Fuel Consumption Models               │
│ • Rule-Based Explainable Mitigation & Recommendation Engine            │
├──────────────────────────────────▲─────────────────────────────────────┤
│ LAYER 2 - TELEMETRY, EDGE & DATA FABRIC                                │
│ • Local SQLite Persistence with SQLAlchemy / SQLModel                  │
│ • Pydantic Validated Schemas & Modular REST API                        │
│ • FastAPI WebSocket Real-time Feeds (/ws/stations/{id})                │
│ • SATCOM Link-Loss & Store-and-Forward Sync Queue Simulation           │
├──────────────────────────────────▲─────────────────────────────────────┤
│ LAYER 1 - PHYSICAL STATION & OPERATIONAL SUBSYSTEMS                    │
│ • Power (CHP / DG), Hydronic Heating, Fuel Farms, Water / RO,          │
│   Wastewater, Life-Safety, Critical Assets, Polar Mobility Fleet       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strict Data Truth & Provenance Policy

Every metric and record in ANTWIN is classified into one of four immutable data classes:

| Class | Definition | Provenance Source |
| :--- | :--- | :--- |
| **`LIVE`** | Current public surface meteorological observations. | NCPOR / NPDC Automatic Weather Stations (AWS). |
| **`REFERENCE`** | Documented station configuration, engineering specifications, or expedition advisories. | NCPOR Tender TD-22062017 (Bharati), Expedition Planning Advisories 2022/2025. |
| **`SIMULATED`** | Prototype operational telemetry where private SCADA/BMS is confidential. Deterministic & correlated. | Polar Station Telemetry Simulator (Engine Seed 26060). |
| **`DERIVED`** | Calculated by ANTWIN multi-constraint equations. | Mission Autonomy Engine, Thermal Sensitivity, Cascading Propagation. |

*Clicking any badge in the console opens the interactive Data Truth Provenance Modal displaying document source, publication year, verified confidence, formula, and input variables.*

---

## 4. Primary Hackathon Demo Sequence

To demonstrate ANTWIN's cross-domain reasoning and decision support:

1. **Remote Mission Control Overview (`/`)**
   - Inspect both stations (**Maitri** in Schirmacher Oasis and **Bharati** in Larsemann Hills).
   - Observe tactical Antarctic radar view, live weather, and baseline Mission Autonomy (**8.4 days**).
2. **Enter Maitri Station Digital Twin (`/maitri`)**
   - Review 5 Key Systems Status (all Normal).
   - Inspect the interactive 2D Station Facility Map with layer toggles (Buildings, Power, Water, Fuel).
   - Review hourly power generation vs. load trends and 7-day fuel burn ledger.
3. **Open Scenario Simulator (`/scenarios`)**
   - Inject primary failure conditions:
     - **Severe Cold**: outdoor temp drops to `-35°C`, wind speed rises to `60 km/h`.
     - **Generator Degradation**: `Generator-02 operates at 50% capacity` (high vibration alert).
     - **Resupply Delay**: `+7 days delay` due to polar pack-ice conditions.
   - Click **Run Simulation**.
4. **Observe Cascading Dependency Propagation**
   - Step 1: Environmental change (convective loss)
   - Step 2: Heating demand spikes (+62% vs current, to 128 kWth)
   - Step 3: Auxiliary electrical load jumps (+48%)
   - Step 4: Degraded Generator-02 forces Generator-01 to operate near maximum capacity
   - Step 5: Fuel consumption accelerates (+35% burn rate)
   - Step 6: Fuel endurance drops to 9.1 days
   - Step 7: Resupply buffer drops to 7 days
   - Step 8: **Mission Autonomy collapses from 11.2 to 6.8 days** (Critical Risk threshold breached!).
5. **Apply Explainable Mitigations & Recalculate**
   - Select mitigations:
     - Non-critical load shedding (+12% est.)
     - Optimize heating setpoints (+8% est.)
     - Redistribute generator load (+6% est.)
     - Verify spare availability (+3% est.)
   - Click **Recalculate with Mitigation**.
   - **Mission Autonomy recovers to 9.4 days** with remaining constraints explicitly diagnosed.
6. **Simulate Offline Edge Resilience (SATCOM Link Loss)**
   - Click **"Simulate Link Loss"** in the sidebar.
   - Central link transitions to `BUFFERING`; local queue buffers incoming telemetry packets.
   - Click **"Restore SATCOM Link"**; store-and-forward batch synchronously flushes to central twin.

---

## 5. Local Setup & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Service (FastAPI + SQLite)
```bash
cd backend
python -m pip install -r requirements.txt  # or: pip install fastapi uvicorn sqlalchemy pydantic httpx pytest
python -m app.seed.seed_data              # Initialize and seed database
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API interactive documentation is available at: `http://127.0.0.1:8000/docs`.

### 2. Frontend Application (React + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Running Unit Tests
```bash
cd backend
python -m pytest tests
```
