from fastapi import APIRouter, UploadFile, File, HTTPException
from io import BytesIO
import pandas as pd
import base64
import matplotlib.pyplot as plt
from src.data_preprocessing import DataPreprocessor
from src.model_training import DiabetesModel
from src.visualization import Visualizer
from .schemas import AnalysisResponse
import json
import numpy as np

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
        mean_scores = model.calculate_cross_val_scores(
            datasets['X_train'],
            datasets['y_train'],
            ccp_alphas
        )
        
        # Get best model
        best_model = model.models[mean_scores.index(max(mean_scores))]
        

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
        
        # Return response
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
