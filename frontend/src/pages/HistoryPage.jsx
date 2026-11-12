import { useEffect, useState } from "react";
import { fetchPredictionHistory } from "../services/diagnosisService";
import { getStoredAuth } from "../services/authService";
import { getClinicalGuidance } from "../utils/clinicalGuidance";

function formatScanName(scanType) {
  if (scanType === "lung_ct") return "Lung CT";
  return "Unknown scan";
}

function formatDiseaseFocus(row) {
  if (row.diseaseType) return row.diseaseType;
  if (row.scanType === "lung_ct") return "Five-class lung cancer classification";
  return "Not recorded";
}

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.token) {
      setAuthToken(auth.token);
    }

    fetchPredictionHistory()
      .then((data) => setRows(data))
      .catch((requestError) =>
        setError(requestError.message || "Unable to load analysis history."),
      )
      .finally(() => setLoading(false));
  }, []);

  const guidance = selectedScan ? getClinicalGuidance(selectedScan.prediction) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            History
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Analysis History
          </h2>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs">
          Total Records: <b>{rows.length}</b>
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="history-table min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Scan
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Patient ID
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Date &amp; Time
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Scan Type
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Disease Focus
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Prediction
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Loading history...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-red-700"
                  >
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No analysis records yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedScan(row)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                    title="Click to view enlarged scan and precautions"
                  >
                    <td className="px-4 py-2.5">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-300 bg-black flex items-center justify-center shrink-0">
                        {row.imageAvailable ? (
                          <img
                            src={`/api/analysis/${row.id}/image?token=${authToken}`}
                            alt="CT scan"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentElement.innerHTML = '<span class="text-[9px] text-white">CT</span>';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">Scan</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {row.patientId || "Not provided"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(row.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatScanName(row.scanType)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatDiseaseFocus(row)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {row.prediction || "Not available"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {Number(row.confidence).toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlarged Image & Precautions Modal for Selected History Record */}
      {selectedScan && guidance && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedScan(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 md:p-8 space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="eyebrow text-xs uppercase font-bold text-teal-700">Historical Patient Record</p>
                <h3 className="text-xl font-bold text-slate-900">Patient: {selectedScan.patientId}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="w-36 h-36 rounded-xl overflow-hidden bg-black border-2 border-slate-800 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src={`/api/analysis/${selectedScan.id}/image?token=${authToken}`}
                  alt="CT scan"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<span class="text-xs text-white">Image Preview</span>';
                  }}
                />
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1 ${guidance.color.badge}`}>
                  {guidance.riskLevel}
                </span>
                <p className="text-base font-bold text-slate-900">{selectedScan.prediction}</p>
                <p><span className="text-slate-500">Confidence:</span> <b>{Number(selectedScan.confidence).toFixed(2)}%</b></p>
                <p><span className="text-slate-500">Scan Type:</span> {formatScanName(selectedScan.scanType)}</p>
                <p><span className="text-slate-500">Analyzed on:</span> {new Date(selectedScan.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Precautions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>🛡️</span> Recommended Precautions &amp; Actions:
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {guidance.precautions.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{idx + 1}. {item.title}</p>
                    <p className="mt-0.5 text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 text-xs">
              <strong className="text-teal-900">Action Checklist: </strong>
              <span className="text-slate-700">{guidance.nextSteps.join(" · ")}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                🖨️ Print Summary
              </button>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
