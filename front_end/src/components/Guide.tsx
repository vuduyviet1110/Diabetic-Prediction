export const Guide = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Guide</h2>

      {/* Model Tab Instructions */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Model Tab</h3>
        <p className="mb-2">
          In the Model tab, you can train a diabetes prediction model based on a
          dataset that you provide. The model will display performance metrics
          and evaluations to help assess its accuracy.
        </p>
        <p className="mb-2">
          To get started, please import a CSV file with the following required
          columns:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Pregnancies</li>
          <li>Glucose</li>
          <li>BloodPressure</li>
          <li>SkinThickness</li>
          <li>Insulin</li>
          <li>BMI</li>
          <li>DiabetesPedigreeFunction</li>
          <li>Age</li>
        </ul>
      </div>

      {/* Predict Diabetes Tab Instructions */}
      <div>
        <h3 className="text-md font-semibold mb-2">Predict Diabetes Tab</h3>
        <p className="mb-2">
          In the Predict Diabetes tab, you can input health metrics to get a
          prediction on whether you may have diabetes. This prediction is based
          on the model trained in the Model tab.
        </p>
        <p className="mb-2">
          Please ensure that you have imported the dataset and trained the model
          in the Model tab before using this feature.
        </p>
        <ol className="list-decimal list-inside mb-4">
          <li>Enter the relevant health metrics in the form provided.</li>
          <li>
            Ensure that you’ve already uploaded the CSV dataset in the Model
            tab.
          </li>
          <li>Click the "Predict" button to see the results.</li>
        </ol>
      </div>

      <p className="text-sm text-gray-600">
        Note: The CSV file must contain the columns: 'Pregnancies', 'Glucose',
        'BloodPressure', 'SkinThickness', 'Insulin', 'BMI',
        'DiabetesPedigreeFunction', and 'Age'.
      </p>
    </div>
  );
};
