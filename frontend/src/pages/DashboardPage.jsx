import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchPredictionHistory } from "../services/diagnosisService";
import { formatName } from "../utils/formatName";

function scanLabel(scanType) {
  if (scanType === "lung_ct") return "Lung CT";
  return "Unknown scan";
}

function diseaseFocus(row) {
  if (row.diseaseType) return row.diseaseType;
  if (row.scanType === "lung_ct") return "Five-class lung cancer classification";
  return "Not recorded";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = formatName(user?.name?.split(" ")[0] || "Doctor");
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPredictionHistory()
      .then(setAnalyses)
      .catch((requestError) =>
        setError(requestError.message || "Unable to load analyses."),
      )
      .finally(() => setLoading(false));
  }, []);
  const recentAnalyses = analyses.slice(0, 5);
  const patientCount = new Set(
    analyses.map((item) => item.patientId).filter(Boolean),
  ).size;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow" style={{ color: "#9de3dd" }}>
          Imaging workspace
          </span>
          <h2>Welcome, Dr. {firstName}</h2>
          <p>
          Review lung CT classifications and keep each result organized by
          patient.
          </p>
        </div>
        <Link to="/analyze" className="primary-btn">
          Start New Analysis
        </Link>
      </section>

      <section className="stat-grid" aria-label="Analysis statistics">
        <div className="surface stat-card">
          <span>Total cases</span>
          <strong>{analyses.length}</strong>
          <small>Saved analyses</small>
        </div>
        <div className="surface stat-card">
          <span>Unique patients</span>
          <strong>{patientCount}</strong>
          <small>Across saved cases</small>
        </div>
        <div className="surface stat-card">
          <span>Lung CT cases</span>
          <strong>{analyses.length}</strong>
          <small>Saved classifications</small>
        </div>
      </section>

      <section className="surface mt-6">
        <div className="surface-header">
          <div>
            <h3>Recent analyses</h3>
            <p>Your latest scan reviews at a glance.</p>
          </div>
          <Link to="/history" className="link-btn">
            View history
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Scan type</th>
                <th>Disease focus</th>
                <th>Prediction</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-red-700">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading analyses…
                  </td>
                </tr>
              ) : recentAnalyses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No analyses recorded yet.
                  </td>
                </tr>
              ) : (
                recentAnalyses.map((row) => (
                  <tr key={row.id}>
                    <td>{row.patientId || "—"}</td>
                    <td>
                      {scanLabel(row.scanType)}
                    </td>
                    <td>{diseaseFocus(row)}</td>
                    <td>{row.prediction || "Not available"}</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to="/history" className="link-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
