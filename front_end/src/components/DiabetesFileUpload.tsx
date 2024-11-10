import React, { useState, ChangeEvent, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Upload } from "lucide-react";

const DiabetesFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    headers: string[];
    content: string[][];
  } | null>(null);
  const [metrics, setMetrics] = useState<{
    accuracy: number;
    confusion_matrix: number[][];
    feature_importance: Record<string, number>;
    cross_val_scores: number[];
    best_alpha: number;
  } | null>(null);
  const [plots, setPlots] = useState<{
    decision_tree: string;
    confusion_matrix: string;
    accuracy_vs_alpha: string;
  } | null>(null);
  const showAllRef = useRef(false);
  const handleShowMore = () => {
    showAllRef.current = !showAllRef.current;
    const button = document.getElementById("show-more-button");
    if (button) {
      button.innerText = showAllRef.current ? "Show Less" : "Show All";
    }
    const list = document.getElementById("cross-val-scores");
    if (list && metrics) {
      list.innerHTML = showAllRef.current
        ? metrics.cross_val_scores.join(" ; ")
        : metrics.cross_val_scores.slice(0, 5).join(" ; ");
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
      // Read and preview the CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target?.result as string;
        const rows = csvData.split("\n").map((row) => row.split(","));
        setData({
          headers: rows[0],
          content: rows.slice(1).filter((row) => row.length > 1), // Filter out empty rows
        });
      };
      reader.readAsText(selectedFile);
    } else {
      setError("Please upload a valid CSV file");
      setFile(null);
      setData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("ok rồi", result);

        // Set predictions
        setPredictions(result.predictions);

        // Set metrics data
        setMetrics({
          accuracy: result.accuracy,
          confusion_matrix: result.confusion_matrix,
          feature_importance: result.feature_importance,
          cross_val_scores: result.cross_val_scores,
          best_alpha: result.best_alpha,
        });

        // Set plots as Base64 images
        setPlots(result.plots);

        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error processing file");
        setPredictions(null);
        console.log("lỗi", errorData);
      }
    } catch (err) {
      setError("Error uploading file");
      setPredictions(null);
      console.log("Có lỗi xảy ra", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Diabetes Prediction - CSV Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500">CSV file only</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {data.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.content.length > 5 && (
                <div className="p-2 text-center text-sm text-gray-500">
                  Showing first 5 rows of {data.content.length} total rows
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !file}>
            {loading ? "Processing..." : "Predict"}
          </Button>

          {predictions && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prediction Results</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Prediction</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((pred, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{pred}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              pred === 1
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {pred === 1 ? "High Risk" : "Low Risk"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {metrics && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Model Metrics</h3>
              <div>
                <h4 className="font-medium">Accuracy</h4>
                <p>{metrics.accuracy.toFixed(4)}</p>
              </div>

              <div>
                <h4 className="font-medium">Confusion Matrix</h4>
                <Table>
                  <TableBody>
                    {metrics.confusion_matrix.map((row, index) => (
                      <TableRow key={index}>
                        {row.map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-medium">Feature Importance</h4>
                <Table>
                  <TableBody>
                    {Object.entries(metrics.feature_importance).map(
                      ([feature, importance]) => (
                        <TableRow key={feature}>
                          <TableCell>{feature}</TableCell>
                          <TableCell>{importance.toFixed(4)}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-medium">Cross-validation Scores</h4>
                {metrics.cross_val_scores.length > 5 ? (
                  <div>
                    <p id="cross-val-scores">
                      {metrics.cross_val_scores.slice(0, 5).join(" ; ")}
                    </p>
                    <button
                      id="show-more-button"
                      className="text-sm text-gray-500"
                      onClick={handleShowMore}
                    >
                      Show All
                    </button>
                  </div>
                ) : (
                  <p>{metrics.cross_val_scores.join(" ; ")}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium">Best Alpha</h4>
                <p>{metrics.best_alpha.toFixed(4)}</p>
              </div>
            </div>
          )}
          {plots && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Visualization</h3>

              <div>
                <h4 className="font-medium">Decision Tree</h4>
                <img
                  src={`data:image/png;base64,${plots.decision_tree}`}
                  alt="Decision Tree"
                  className="w-full max-w-lg mx-auto"
                />
              </div>

              <div>
                <h4 className="font-medium">Confusion Matrix</h4>
                <img
                  src={`data:image/png;base64,${plots.confusion_matrix}`}
                  alt="Confusion Matrix"
                  className="w-full max-w-lg mx-auto"
                />
              </div>

              <div>
                <h4 className="font-medium">Accuracy vs Alpha</h4>
                <img
                  src={`data:image/png;base64,${plots.accuracy_vs_alpha}`}
                  alt="Accuracy vs Alpha"
                  className="w-full max-w-lg mx-auto"
                />
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DiabetesFileUpload;
