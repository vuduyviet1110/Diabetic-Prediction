import DiabetesFileUpload from "./components/DiabetesFileUpload";
import "./styles/globals.css";
function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Diabetes Prediction System
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload your CSV file to get predictions
          </p>
        </div>
        <DiabetesFileUpload />
      </div>
    </div>
  );
}

export default App;
