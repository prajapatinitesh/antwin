import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent
DOCS_CONTENT_DIR = ROOT_DIR / "docs" / "Content"

# Database
DB_PATH = BASE_DIR / "antwin.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# App Config
PROJECT_NAME = "ANTWIN"
PROJECT_FULL_NAME = "Antarctic Digital TWIN for Intelligent Operations & Monitoring"
API_V1_STR = "/api"
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

# Primary Demo Parameters
DEFAULT_COMFORT_TEMP_C = 18.0
DEFAULT_THERMAL_SENSITIVITY = 2.2  # kW per deg C below comfort
DEFAULT_SEED = 26060
