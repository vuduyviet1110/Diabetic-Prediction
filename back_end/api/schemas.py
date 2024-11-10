from pydantic import BaseModel
from typing import List, Dict

class AnalysisResponse(BaseModel):
    accuracy: float
    confusion_matrix: List[List[int]]
    feature_importance: Dict[str, float]
    cross_val_scores: List[float]
    best_alpha: float
    plots: Dict[str, str] 