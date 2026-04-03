"""
FireGuard AI — ML Inference Service

Standalone FastAPI service that exposes the fire detection model.
In production, the Node.js backend calls POST /predict with sensor telemetry
and gets back a risk classification with confidence score.

Run with:
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="FireGuard AI — ML Service",
    description="Fire detection inference API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorReading(BaseModel):
    temperature: float = Field(..., ge=-50, le=1500, description="°C")
    smoke_level: float = Field(..., ge=0, le=100, description="Particulate %")
    co_level:    float = Field(..., ge=0, le=10000, description="Parts per million")


class PredictionResult(BaseModel):
    fire:           bool
    confidence:     float
    risk_level:     str
    recommendation: str


def classify_risk(confidence: float) -> tuple[str, str]:
    """Maps a confidence score to a risk level and operator recommendation."""
    if confidence < 0.25:
        return (
            "low",
            "All readings within normal parameters. Continue routine monitoring.",
        )
    if confidence < 0.50:
        return (
            "medium",
            "Elevated readings detected. Increase monitoring and inspect the area.",
        )
    if confidence < 0.75:
        return (
            "high",
            "High fire risk. Initiate evacuation protocol and contact emergency services.",
        )
    return (
        "critical",
        "CRITICAL: Immediate action required. Evacuate all personnel and call 911.",
    )


def infer(temperature: float, smoke_level: float, co_level: float) -> PredictionResult:
    """
    Simulated ML model using weighted sensor coefficients.

    Weights chosen to match historical incident data:
      - Temperature (40%) — strongest predictor above 30°C
      - Smoke      (40%) — direct fire indicator
      - CO         (20%) — secondary indicator, saturates at 200 ppm
    """
    temp_score  = max(0.0, (temperature - 30) / 70) * 0.4
    smoke_score = (smoke_level / 100) * 0.4
    co_score    = min(1.0, co_level / 200) * 0.2

    confidence       = min(1.0, max(0.0, temp_score + smoke_score + co_score))
    fire             = confidence > 0.5
    risk_level, rec  = classify_risk(confidence)

    return PredictionResult(
        fire=fire,
        confidence=round(confidence, 4),
        risk_level=risk_level,
        recommendation=rec,
    )


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fireguard-ml"}


@app.post("/predict", response_model=PredictionResult)
def predict(reading: SensorReading):
    """
    Runs fire detection inference on a single sensor reading.
    Returns a risk classification and operator recommendation.
    """
    return infer(reading.temperature, reading.smoke_level, reading.co_level)
