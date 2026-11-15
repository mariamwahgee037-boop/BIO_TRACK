
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# Load trained model and label encoder
model = joblib.load("biotrack_stress_model.pkl")
label_encoder = joblib.load("biotrack_label_encoder.pkl")

app = FastAPI(title="BIO TRACK Stress Prediction API")

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StressInput(BaseModel):
    scl_std: float
    activation_mean: float
    scl_mean: float

@app.get("/")
def home():
    return {
        "project": "BIO TRACK",
        "status": "API is running"
    }

@app.post("/predict/stress")
def predict_stress(data: StressInput):
    features = np.array([[
        data.scl_std,
        data.activation_mean,
        data.scl_mean
    ]])

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    predicted_label = label_encoder.inverse_transform(
        [int(prediction)]
    )[0]

    return {
        "prediction": str(predicted_label),
        "probabilities": {
            str(label): round(float(probability), 4)
            for label, probability in zip(
                label_encoder.classes_, probabilities
            )
        },
        "model": "Random Forest",
        "disclaimer": "Experimental research model, not a medical diagnosis."
    }
