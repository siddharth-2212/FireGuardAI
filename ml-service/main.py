"""
FireGuard AI — ML Inference Service

Lightweight FastAPI service with zero compiled dependencies.
The Node.js backend calls POST /predict with raw sensor readings
and receives a fire risk classification in return.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FireGuard AI — ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def classify_risk(confidence):
    """Maps a 0–1 confidence score to a human-readable risk label."""
    if confidence < 0.25:
        return "low"
    if confidence < 0.50:
        return "medium"
    if confidence < 0.75:
        return "high"
    return "critical"


def run_inference(temperature, smoke_level, co_level):
    """
    Rule-based fire detection model.

    Weights chosen to reflect real-world incident data:
      - Temperature above 50°C is the strongest single signal
      - Smoke particulates above 60% almost always indicate active combustion
      - CO acts as a secondary corroborating signal

    Returns a dict with fire verdict, confidence score, and risk level.
    """
    temp_score  = min(1.0, temperature / 100)
    smoke_score = min(1.0, smoke_level / 100)
    co_score    = min(1.0, co_level / 500)

    # Weighted average — temperature and smoke carry equal weight, CO is secondary
    confidence = round((temp_score * 0.4 + smoke_score * 0.4 + co_score * 0.2), 4)

    # A sensor reading triggers the fire flag when either primary signal is critical,
    # or when the combined confidence crosses the 0.5 threshold
    fire = temperature > 50 or smoke_level > 60 or confidence > 0.5

    return {
        "fire":       fire,
        "confidence": confidence,
        "risk_level": classify_risk(confidence),
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "fireguard-ml"}


@app.post("/predict")
async def predict(request: Request):
    """
    Accepts a JSON body with temperature, smoke_level, and co_level.
    Returns fire verdict, confidence score, and risk classification.
    """
    body = await request.json()

    temperature = float(body.get("temperature", 0))
    smoke_level = float(body.get("smoke_level", 0))
    co_level    = float(body.get("co_level", 0))

    return run_inference(temperature, smoke_level, co_level)
