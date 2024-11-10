from fastapi import APIRouter, UploadFile, File, HTTPException
from io import BytesIO
import pandas as pd
import base64
import matplotlib.pyplot as plt
from src.data_preprocessing import DataPreprocessor
from src.model_training import DiabetesModel
from src.visualization import Visualizer
from .schemas import AnalysisResponse
from pydantic import BaseModel
import json
import numpy as np
import pickle
import os

# Định nghĩa schema cho input và response
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
    prediction: int
    probability: float
    risk_level: str

router = APIRouter()

def fig_to_base64(fig):
    buf = BytesIO()
    try:
        fig.savefig(buf, format='png', dpi=200, bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
    except Exception as e:
        print(f"Error converting figure to base64: {e}")
        img_str = None
    finally:
        buf.close()
        plt.close(fig)
    return img_str

def save_model(model):
    """Utility function to save the model"""
    try:
        os.makedirs("models", exist_ok=True)
        with open("models/diabetes_model.pkl", 'wb') as f:
            pickle.dump(model, f)  # Sửa lỗi ở đây
        return True
    except Exception as e:
        print(f"Error saving model: {e}")
        return False

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_diabetes_data(file: UploadFile = File(...)):
    try:
        # Read uploaded file
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # Initialize preprocessor
        preprocessor = DataPreprocessor()
        
        # Preprocess data
        clean_data = preprocessor.clean_data(df)
        datasets = preprocessor.prepare_train_test_data(clean_data)
        
        # Train model
        model = DiabetesModel()
        initial_tree = model.train_initial_model(
            datasets['X_train2'],
            datasets['y_train2']
        )
        
        # Generate visualizations
        visualizer = Visualizer()
        
        # Decision Tree plot (Initial Tree)
        initial_tree_fig = visualizer.get_decision_tree_plot(
            initial_tree,
            datasets['feature_names']
        )
        initial_tree_img = fig_to_base64(initial_tree_fig)
        
        # Confusion Matrix plot (Initial Confusion Matrix)
        intial_cm_fig = visualizer.get_confusion_matrix_plot(
            initial_tree,
            datasets['X_test'],
            datasets['y_test']
        )
        initial_cm_img = fig_to_base64(intial_cm_fig)
        
        # Perform cost complexity pruning
        ccp_alphas = model.perform_cost_complexity_pruning(
            datasets['X_train2'],
            datasets['y_train2']
        )
        
        # Calculate scores
        train_scores, test_scores = model.calculate_scores(
            datasets['X_train2'],
            datasets['y_train2'],
            datasets['X_fake_test'],
            datasets['y_fake_test']
        )
        
        # Accuracy vs Alpha plot
        acc_fig = visualizer.get_accuracy_vs_alpha_plot(
            ccp_alphas,
            train_scores,
            test_scores
        )
        acc_img = fig_to_base64(acc_fig)
        
        # Get cross-validation scores
        mean_scores= model.calculate_cross_val_scores(datasets['X_train'], datasets['y_train'], ccp_alphas)

        
        # Get best model
        best_model = model.models[mean_scores.index(max(mean_scores))]
        
        # Lưu model tại đây sau khi có best model
        if not save_model(best_model):
            print("Warning: Failed to save model")

        # Decision Tree plot
        tree_fig = visualizer.get_decision_tree_plot(
            best_model,
            datasets['feature_names']
        )
        tree_img = fig_to_base64(tree_fig)
        
        # Confusion Matrix plot
        cm_fig = visualizer.get_confusion_matrix_plot(
            best_model,
            datasets['X_test'],
            datasets['y_test']
        )
        cm_img = fig_to_base64(cm_fig)
        
        # Calculate feature importance
        feature_importance = dict(zip(
            datasets['feature_names'],
            best_model.feature_importances_
        ))
        
        # Prepare response
        response = {
            "accuracy": float(max(mean_scores)),
            "confusion_matrix": visualizer.get_confusion_matrix_data(
                best_model,
                datasets['X_test'],
                datasets['y_test']
            ).tolist(),
            "feature_importance": {k: float(v) for k, v in feature_importance.items()},
            "cross_val_scores": [float(score) for score in mean_scores],
            "best_alpha": float(ccp_alphas[mean_scores.index(max(mean_scores))]),
            "plots": {
                "decision_tree": tree_img,
                "confusion_matrix": cm_img,
                "accuracy_vs_alpha": acc_img
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict", response_model=PredictionResponse)
async def predict_diabetes(input_data: PredictionInput):
    try:
        # Tạo DataFrame với feature names thay vì numpy array
        features_df = pd.DataFrame([[
            input_data.pregnancies,
            input_data.glucose,
            input_data.blood_pressure,
            input_data.skin_thickness,
            input_data.insulin,
            input_data.bmi,
            input_data.diabetes_pedigree,
            input_data.age
        ]], columns=[
            'Pregnancies',
            'Glucose',
            'BloodPressure',
            'SkinThickness',
            'Insulin',
            'BMI',
            'DiabetesPedigreeFunction',
            'Age'
        ])

        # Load model đã train
        model_path = "models/diabetes_model.pkl"
        if not os.path.exists(model_path):
            raise HTTPException(
                status_code=500,
                detail="Model chưa được train. Vui lòng train model trước."
            )

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Thực hiện dự đoán
        prediction = model.predict(features_df)[0]
        probability = model.predict_proba(features_df)[0][1]

        # Xác định mức độ rủi ro
        if probability < 0.3:
            risk_level = "Low"
        elif probability < 0.7:
            risk_level = "Average"
        else:
            risk_level = "High"

        # Trả về kết quả
        return PredictionResponse(
            prediction=int(prediction),
            probability=float(probability),
            risk_level=risk_level
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))