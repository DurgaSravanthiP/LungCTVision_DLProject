import { Link, useLocation } from "react-router-dom";
import Button from "../components/Button";

export default function ResultsPage() {
  const { state } = useLocation();
  const result = state?.result;

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          No analysis selected
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Open a saved analysis from patient history to view its results.
        </p>
        <Link to="/history" className="mt-5 inline-block">
          <Button variant="secondary">View patient history</Button>
        </Link>
      </div>
    );
  }

  const scanLabel =
    result.scanType === "lung_ct" ? "Lung CT" : "Unknown scan";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Analysis result
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{scanLabel}</h2>

        <div className="mt-6 space-y-4 text-slate-700">
          <p>
            <span className="font-semibold">Classification:</span>{" "}
            {result.prediction}
          </p>
          <p>
            <span className="font-semibold">Model confidence:</span>{" "}
            {Number(result.confidence).toFixed(2)}%
          </p>
          {result.patientId && (
            <p>
              <span className="font-semibold">Patient ID:</span>{" "}
              {result.patientId}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Model-generated classification for clinician review.
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/analyze">
          <Button>Back to Analysis</Button>
        </Link>
        <Link to="/history">
          <Button variant="secondary">View History</Button>
        </Link>
      </div>
    </div>
  );
}
