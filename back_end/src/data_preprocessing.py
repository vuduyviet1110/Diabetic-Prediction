import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

class DataPreprocessor:
    def __init__(self):
        self.column_names = [
            "Pregnancies",
            "Glucose",
            "BloodPressure",
            "SkinThickness",
            "Insulin",
            "BMI",
            "DiabetesPedigreeFunction",
            "Age",
            "Outcome"
        ]

    def load_data(self, file_path):
        """Load and preprocess the diabetes dataset"""
        df = pd.read_csv(file_path)
        return df

    def analyze_data(self, df):
        """Perform initial data analysis"""
        analysis = {}
        for column in df.columns:
            analysis[column] = {
                'unique_values': df[column].unique(),
                'value_counts': df[column].value_counts()
            }
        return analysis

    def clean_data(self, df):
        """Remove records with zero values in specific columns"""
        columns_to_check = ['Glucose', 'BMI', 'BloodPressure']
        
        df_clean = df.copy()
        for column in columns_to_check:
            df_clean = df_clean[df_clean[column] != 0]
        return df_clean

    def prepare_train_test_data(self, df, test_size=0.1, random_state=20):
        """Prepare training and testing datasets"""
        X = df.drop('Outcome', axis=1).copy()
        y = df['Outcome'].copy()
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        X_train2, X_fake_test, y_train2, y_fake_test = train_test_split(
            X_train, y_train, test_size=test_size, random_state=random_state
        )
        
        return {
            'X_train': X_train,
            'X_test': X_test,
            'y_train': y_train,
            'y_test': y_test,
            'X_train2': X_train2,
            'X_fake_test': X_fake_test,
            'y_train2': y_train2,
            'y_fake_test': y_fake_test,
            'feature_names': X.columns
        }
