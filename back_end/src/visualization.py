import matplotlib.pyplot as plt
from sklearn.tree import plot_tree
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix

class Visualizer:
    @staticmethod
    def get_decision_tree_plot(model, feature_names):
        """Get decision tree plot as figure"""
        fig, ax = plt.subplots(figsize=(20,8), dpi=100)
        plot_tree(
            model,
            filled=True,
            rounded=True,
            class_names=["Non-Diabetic", "Diabetic"],
            feature_names=feature_names,
            ax=ax
        )
        return fig

    @staticmethod
    def get_confusion_matrix_plot(model, X, y):
        """Get confusion matrix plot as figure"""
        fig, ax = plt.subplots(figsize=(5,5), dpi=300)
        y_pred = model.predict(X)
        cm = confusion_matrix(y, y_pred)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Non-Diabetic", "Diabetic"])
        
        # Plot with `values_format` and other settings
        disp.plot(values_format='.2f', cmap=plt.cm.Blues, ax=ax)
        
        return fig
    
    @staticmethod
    def get_confusion_matrix_data(model, X, y):
        """Get raw confusion matrix data"""
        y_pred = model.predict(X)
        return confusion_matrix(y, y_pred)

    @staticmethod
    def get_accuracy_vs_alpha_plot(ccp_alphas, train_scores, test_scores):
        """Get accuracy vs alpha plot as figure"""
        fig, ax = plt.subplots(figsize=(6,4), dpi=300)
        ax.set_xlabel("Alpha")
        ax.set_ylabel("Accuracy")
        ax.set_title("Accuracy vs Alpha Value for Training and Testing Set")
        ax.plot(ccp_alphas, train_scores, marker='.', label="Train Set",
                drawstyle="steps-post")
        ax.plot(ccp_alphas, test_scores, marker='.', label="Test Set",
                drawstyle="steps-post")
        ax.legend()
        return fig
