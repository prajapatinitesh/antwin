from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import PROJECT_NAME, PROJECT_FULL_NAME, CORS_ORIGINS
from app.db.database import engine
from app.seed.seed_data import seed_database
from app.api.stations import router as stations_router
from app.api.environment import router as environment_router
from app.api.energy import router as energy_router
from app.api.assets import router as assets_router
from app.api.logistics import router as logistics_router
from app.api.dependencies import router as dependencies_router
from app.api.simulation import router as simulation_router
from app.api.communication import router as communication_router
from app.api.provenance import router as provenance_router
from app.api.maitri_replay_api import router as maitri_replay_router
from app.api.bharati_replay_api import router as bharati_replay_router
from app.api.websocket import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and Seed data
    try:
        seed_database()
    except Exception as e:
        print(f"Warning during seed: {e}")
    yield

app = FastAPI(
    title=PROJECT_NAME,
    description=PROJECT_FULL_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(stations_router, prefix="/api")
app.include_router(environment_router, prefix="/api")
app.include_router(energy_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(logistics_router, prefix="/api")
app.include_router(dependencies_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(communication_router, prefix="/api")
app.include_router(provenance_router, prefix="/api")
app.include_router(maitri_replay_router, prefix="/api")
app.include_router(bharati_replay_router, prefix="/api")
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "project": PROJECT_NAME,
        "name": PROJECT_FULL_NAME,
        "sih_problem_id": "26060",
        "tagline": "From Station Monitoring to Mission Intelligence",
        "status": "OPERATIONAL",
        "stations": ["MAITRI", "BHARATI"],
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check(response: Response):
    timestamp = datetime.now(timezone.utc).isoformat()
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "service": "ANTWIN Backend API",
            "database": "connected",
            "timestamp": timestamp
        }
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "service": "ANTWIN Backend API",
            "database": "disconnected",
            "timestamp": timestamp,
            "error": "Database connectivity check failed"
        }

