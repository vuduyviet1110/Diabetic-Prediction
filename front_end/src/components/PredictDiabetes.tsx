import { InfoIcon } from "lucide-react";
import { cn } from "../lib/utils";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
type PredictionResponse = {
  prediction: 1 | 0;
  probability: number;
  risk_level: "Low" | "Average" | "High";
};

const PredictDiabetes = () => {
  const [formData, setFormData] = useState({
    pregnancies: undefined,
    glucose: undefined,
    blood_pressure: undefined,
    skin_thickness: undefined,
    insulin: undefined,
    bmi: undefined,
    diabetes_pedigree: undefined,
    age: undefined,
  });
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const isValid = Object.values(formData).every(
    (value) => value !== undefined && value !== null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? undefined : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    const response = await fetch("http://localhost:8000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const res = await response.json();
      setResult(res);
      console.log(result);
    } else {
      alert("Error predicting diabetes");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className=" w-full h-auto p-8 border-2 border-dashed rounded-lg  bg-gray-50 "
      >
        <h3 className="text-xl text-center font-bold text-gray-800 mb-4">
          Fill in your health indicators to predict diabetes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(formData).map(([name, value]) => (
            <label key={name} className="block">
              <span className="block text-lg font-semibold text-gray-700">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
              <input
                type="number"
                step="0.01"
                name={name}
                className="mt-2 block w-full rounded-md h-8 px-1.5 text-blue-800  shadow-sm border-none "
                value={value === undefined ? "" : value}
                onChange={handleChange}
              />
            </label>
          ))}
        </div>
        {result ? (
          <button
            onClick={() => {
              setFormData({
                pregnancies: undefined,
                glucose: undefined,
                blood_pressure: undefined,
                skin_thickness: undefined,
                insulin: undefined,
                bmi: undefined,
                diabetes_pedigree: undefined,
                age: undefined,
              });
              setResult(null);
            }}
            disabled={!isValid}
            className={cn(
              "mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-50",
              {
                "opacity-50 cursor-not-allowed": !isValid,
              }
            )}
          >
            Re-Predict
          </button>
        ) : (
          <Button
            type="submit"
            disabled={!isValid}
            className={cn(
              "mt-4 rounded-md  px-4 py-2 text-white w-1/3 text-center flex justify-self-center ",
              {
                "opacity-50 cursor-not-allowed": !isValid,
              }
            )}
          >
            Predict Diabetes
          </Button>
        )}
      </form>
      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-bold text-gray-800">Prediction Result</h3>
          <p className="text-gray-700 mt-2">
            Prediction
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="inline-block w-3 h-3 ml-1 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>0: No Diabetes, 1: Diabetes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            : <span className="font-semibold">{result.prediction}</span>
          </p>
          <p className="text-gray-700">
            Probability:{" "}
            <span className="font-semibold">
              {(result.probability * 100).toFixed(2)}%
            </span>
          </p>
          <p className="text-gray-700">
            Risk Level:{" "}
            <span className="font-semibold">{result.risk_level}</span>
          </p>
        </div>
      )}
    </div>
  );
};
export default PredictDiabetes;
