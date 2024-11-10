import { cn } from "../lib/utils";
import React, { useState } from "react";

const PredictDiabetes = () => {
  const [formData, setFormData] = useState<Record<string, number | undefined>>({
    pregnancies: undefined,
    glucose: undefined,
    bloodPressure: undefined,
    skinThickness: undefined,
    insulin: undefined,
    bmi: undefined,
    diabetesPedigreeFunction: undefined,
    age: undefined,
  });

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
    alert("Cái ày chưa làm...");
    setFormData({
      pregnancies: undefined,
      glucose: undefined,
      bloodPressure: undefined,
      skinThickness: undefined,
      insulin: undefined,
      bmi: undefined,
      diabetesPedigreeFunction: undefined,
      age: undefined,
    });
    // const response = await fetch("http://localhost:8000/api/predict", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // });

    // if (response.ok) {
    //   const result = await response.json();
    //   alert(`You have ${result.diabetes ? "" : "not "}diabetes`);
    // } else {
    //   alert("Error predicting diabetes");
    // }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" w-full h-auto p-8 border-2 border-dashed rounded-lg  bg-gray-50 "
    >
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
      <button
        type="submit"
        disabled={!isValid}
        className={cn(
          "mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-50",
          {
            "opacity-50 cursor-not-allowed": !isValid,
          }
        )}
      >
        Predict Diabetes
      </button>
    </form>
  );
};
export default PredictDiabetes;
