from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score
import numpy as np

class DiabetesModel:
    def __init__(self, criterion='entropy', random_state=20):
        self.criterion = criterion
        self.random_state = random_state
        self.model = None
        self.models = []

    def train_initial_model(self, X_train, y_train):
        """Train initial decision tree model"""
        self.model = DecisionTreeClassifier(
            criterion=self.criterion,
            random_state=self.random_state
        )
        self.model.fit(X_train, y_train)
        return self.model

    def perform_cost_complexity_pruning(self, X_train, y_train):
        """Perform cost complexity pruning analysis"""
        tree_path = self.model.cost_complexity_pruning_path(X_train, y_train)
        ccp_alphas = tree_path.ccp_alphas[:-1]
        
        self.models = []
        for ccp_alpha in ccp_alphas:
            model = DecisionTreeClassifier(
                criterion=self.criterion,
                random_state=self.random_state,
                ccp_alpha=ccp_alpha
            )
            model.fit(X_train, y_train)
            self.models.append(model)
            
        return ccp_alphas

    def calculate_scores(self, X_train, y_train, X_test, y_test):
        """Calculate training and testing scores"""
        train_scores = [model.score(X_train, y_train) for model in self.models]
        test_scores = [model.score(X_test, y_test) for model in self.models]
        return train_scores, test_scores

    def calculate_cross_val_scores(self, X_train, y_train, ccp_alphas):
        """Calculate cross-validation scores"""
        mean_scores = []
        for ccp_alpha in ccp_alphas:
            model = DecisionTreeClassifier(
                criterion=self.criterion,
                random_state=self.random_state,
                ccp_alpha=ccp_alpha
            )
            scores = cross_val_score(model, X_train, y_train, cv=5)
            mean_scores.append(np.mean(scores))
        return mean_scores