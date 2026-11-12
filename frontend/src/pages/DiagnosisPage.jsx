import { useState } from "react";
import { analyzeScan } from "../services/diagnosisService";

const scanType = "lung_ct";
const diseaseClasses = [
  "Adenocarcinoma",
  "Benign cases",
  "Large cell carcinoma",
  "Normal cases",
  "Squamous cell carcinoma",
];

export default function DiagnosisPage() {
  const [patientId, setPatientId] = useState("");
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (event) => {
    event.preventDefault();
    const normalizedPatientId = patientId.trim();

    if (!normalizedPatientId) {
      setError("Enter a patient ID to save this result.");
      return;
    }

    if (!image) {
      setError("Choose an image for the selected scan type.");
      return;
    }

    setError("");
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeScan({
        patientId: normalizedPatientId,
        scanType,
        image,
      });
      setAnalysis(result.analyses?.[0] || result);
    } catch (requestError) {
      setError(requestError.message || "Unable to analyze the uploaded scan.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="analysis-page">
      <header className="analysis-heading">
        <span className="analysis-heading-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M8 4H5a1 1 0 00-1 1v3m12-4h3a1 1 0 011 1v3M4 16v3a1 1 0 001 1h3m12-4v3a1 1 0 01-1 1h-3M8 12h8m-4-4v8" />
          </svg>
        </span>
        <div>
          <p className="eyebrow">Imaging workspace</p>
          <h2>Analyze a scan</h2>
          <p>Submit one lung CT image for five-class AI-assisted review.</p>
        </div>
      </header>

      <form className="analysis-form" onSubmit={handleAnalyze}>
        <section className="analysis-section">
          <div className="analysis-section-title">
            <span>1</span>
            <div>
              <h3>Patient information</h3>
              <p>Use your clinic’s patient identifier. Avoid entering names.</p>
            </div>
          </div>
          <label className="analysis-field" htmlFor="patient-id">
            <span>Patient ID <b>*</b></span>
            <input
              id="patient-id"
              name="patientId"
              type="text"
              autoComplete="off"
              required
              value={patientId}
              onChange={(event) => {
                setPatientId(event.target.value);
                setAnalysis(null);
                setError("");
              }}
              placeholder="e.g. PT-1042"
            />
          </label>
        </section>

        <section className="analysis-section">
          <div className="analysis-section-title">
            <span>2</span>
            <div>
              <h3>Classification classes</h3>
              <p>The model checks the uploaded CT against these five classes.</p>
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {diseaseClasses.map((diseaseClass) => (
              <li
                key={diseaseClass}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {diseaseClass}
              </li>
            ))}
          </ul>
        </section>

        <section className="analysis-section">
          <div className="analysis-section-title">
            <span>3</span>
            <div>
              <h3>Upload scan image</h3>
              <p>
                Choose a lung CT image. JPG, PNG or WEBP, up to 5 MB.
              </p>
            </div>
          </div>
          <input
            key={scanType}
            id="scan-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setImage(event.target.files?.[0] || null);
              setAnalysis(null);
              setError("");
            }}
            className="analysis-file-input"
          />
          <label htmlFor="scan-image" className="analysis-upload">
            <span className="analysis-upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 16V4m0 0L7 9m5-5l5 5M5 15v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
              </svg>
            </span>
            <span className="analysis-upload-copy">
              <strong>{image ? image.name : "Choose an image to upload"}</strong>
              <small>
                {image
                  ? `${(image.size / (1024 * 1024)).toFixed(2)} MB · Ready to analyze`
                  : "Select a file from your device"}
              </small>
            </span>
            <span className="secondary-btn analysis-browse-button">
              Browse files
            </span>
          </label>
        </section>

        {error && (
          <p role="alert" className="analysis-error">
            {error}
          </p>
        )}

        <footer className="analysis-actions">
          <p>AI-assisted results support clinician review; they are not a diagnosis.</p>
          <button
            type="submit"
            disabled={!image || !patientId.trim() || isAnalyzing}
            className="primary-btn analysis-submit"
          >
            {isAnalyzing ? "Analyzing scan…" : "Run analysis"}
            {!isAnalyzing && <span aria-hidden="true">→</span>}
          </button>
        </footer>
      </form>

      {analysis && (
        <section className="analysis-result" aria-live="polite">
          <div className="analysis-result-heading">
            <span className="analysis-result-check" aria-hidden="true">✓</span>
            <div>
              <p className="eyebrow">Analysis complete</p>
              <h3>Result for patient {analysis.patientId || patientId.trim()}</h3>
            </div>
          </div>
          <div className="analysis-result-grid">
            <div>
              <span>Scan type</span>
              <strong>              Lung CT</strong>
            </div>
            <div>
              <span>Model output</span>
              <strong>{analysis.prediction || "Not available"}</strong>
            </div>
            <div>
              <span>Model confidence</span>
              <strong>
                {Number(analysis.confidence).toFixed(2)}%
              </strong>
            </div>
          </div>
          <p className="analysis-result-note">
            Five-class lung cancer classification. Review this AI-generated
            result with appropriate clinical information.
          </p>
        </section>
      )}
    </div>
  );
}
