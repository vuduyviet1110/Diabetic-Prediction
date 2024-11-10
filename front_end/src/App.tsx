import { useState } from "react";
import DiabetesFileUpload from "./components/DiabetesFileUpload";
import Header from "./components/Header";
import "./styles/globals.css";
import PredictDiabetes from "./components/PredictDiabetes";
import { Guide } from "./components/Guide";

function App() {
  const [activeTab, setActiveTab] = useState("Guide");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Model":
        return <DiabetesFileUpload />;
      case "Predict Diabetes":
        return <PredictDiabetes />;
      case "Guide":
        return <Guide />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/bg.png')",
          filter: "brightness(0.5) contrast(1.2) blur(5px)",
          zIndex: -1,
        }}
      ></div>
      <div className="relative z-10">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-200 tracking-wide">
              Diabetes Prediction System
            </h1>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
