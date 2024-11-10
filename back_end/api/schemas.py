from pydantic import BaseModel
from typing import List, Dict

class AnalysisResponse(BaseModel):
    accuracy: float
    confusion_matrix: List[List[int]]
    feature_importance: Dict[str, float]
    cross_val_scores: List[float]
    best_alpha: float
    plots: Dict[str, str] 

class PredictionInput(BaseModel):
    pregnancies: float
    glucose: float 
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: float

class PredictionResponse(BaseModel):
    prediction: int  # 0: Không bị tiểu đường, 1: Bị tiểu đường
    probability: float
    risk_level: str