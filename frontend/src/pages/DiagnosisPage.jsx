import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyzeScan } from "../services/diagnosisService";
import { getClinicalGuidance } from "../utils/clinicalGuidance";

const scanType = "lung_ct";
const diseaseClasses = [
  { name: "Adenocarcinoma", tag: "Malignant NSCLC", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { name: "Benign cases", tag: "Non-Malignant", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { name: "Large cell carcinoma", tag: "Aggressive NSCLC", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { name: "Normal cases", tag: "Healthy Lung", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { name: "Squamous cell carcinoma", tag: "Airway Carcinoma", color: "text-orange-700 bg-orange-50 border-orange-200" },
];

export default function DiagnosisPage() {
  const [patientId, setPatientId] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

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

  const resetForm = () => {
    setImage(null);
    setAnalysis(null);
    setError("");
    setPatientId("");
  };

  const guidance = analysis ? getClinicalGuidance(analysis.prediction) : null;

  return (
    <div className="analysis-page max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="analysis-heading flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="analysis-heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-teal-600 fill-none stroke-2">
              <path d="M8 4H5a1 1 0 00-1 1v3m12-4h3a1 1 0 011 1v3M4 16v3a1 1 0 001 1h3m12-4v3a1 1 0 01-1 1h-3M8 12h8m-4-4v8" />
            </svg>
          </span>
          <div>
            <p className="eyebrow text-xs uppercase tracking-wider font-bold text-teal-600">Imaging Workspace</p>
            <h2 className="text-2xl font-bold text-slate-900">AI Lung CT Scan Analysis</h2>
            <p className="text-sm text-slate-500">Submit one lung CT image for five-class AI-assisted review</p>
          </div>
        </div>
        {analysis && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            + New Analysis
          </button>
        )}
      </header>

      {/* Main Form */}
      <form className="analysis-form bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" onSubmit={handleAnalyze}>
        {/* Step 1: Patient Information */}
        <section className="analysis-section space-y-3">
          <div className="analysis-section-title flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <h3 className="font-semibold text-slate-800">Patient Identifier</h3>
              <p className="text-xs text-slate-500">Use clinic patient identifier code. Avoid entering personal names.</p>
            </div>
          </div>
          <label className="analysis-field block" htmlFor="patient-id">
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
              className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </label>
        </section>

        {/* Step 2: 5 Classes in Colors */}
        <section className="analysis-section space-y-3">
          <div className="analysis-section-title flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <h3 className="font-semibold text-slate-800">Classification Classes</h3>
              <p className="text-xs text-slate-500">The model checks the uploaded CT against these five classes:</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {diseaseClasses.map((item) => (
              <div
                key={item.name}
                className={`rounded-xl border p-3 text-xs font-medium flex flex-col justify-between shadow-2xs ${item.color}`}
              >
                <span className="font-bold text-[13px]">{item.name}</span>
                <span className="text-[10px] opacity-80 mt-1 uppercase tracking-wider font-semibold">{item.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Step 3: Scan Upload & Big Preview */}
        <section className="analysis-section space-y-3">
          <div className="analysis-section-title flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <h3 className="font-semibold text-slate-800">Upload Scan Image</h3>
              <p className="text-xs text-slate-500">Choose a lung CT image. JPG, PNG or WEBP, up to 5 MB.</p>
            </div>
          </div>

          <input
            key={scanType}
            id="scan-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setImage(file);
              setAnalysis(null);
              setError("");
            }}
            className="hidden"
          />

          {!previewUrl ? (
            <label
              htmlFor="scan-image"
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 cursor-pointer bg-slate-50 hover:bg-teal-50/30 transition text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-teal-600 fill-none stroke-2">
                  <path d="M12 16V4m0 0L7 9m5-5l5 5M5 15v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">Choose an image to upload</p>
              <p className="text-xs text-slate-400 mt-1">Select a file from your device</p>
              <span className="mt-4 px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-sm">
                Browse files
              </span>
            </label>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group rounded-xl overflow-hidden bg-black w-44 h-44 shrink-0 border-2 border-slate-700 shadow-md flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Selected Lung CT Scan Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition"
                >
                  🔍 Enlarge View
                </button>
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <p className="text-xs uppercase tracking-wider font-bold text-teal-700">Ready to Analyze</p>
                <h4 className="font-bold text-slate-900 text-base truncate max-w-md">{image.name}</h4>
                <p className="text-xs text-slate-500">
                  Size: {(image.size / (1024 * 1024)).toFixed(2)} MB · Format: {image.type || "image/jpeg"}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setIsZoomed(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
                  >
                    View Big Image
                  </button>
                  <label
                    htmlFor="scan-image"
                    className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    Change File
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setAnalysis(null);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </p>
        )}

        <footer className="analysis-actions flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            AI-assisted results support clinician review; they are not a diagnosis.
          </p>
          <button
            type="submit"
            disabled={!image || !patientId.trim() || isAnalyzing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? "Analyzing scan…" : "Run analysis"}
            {!isAnalyzing && <span aria-hidden="true">→</span>}
          </button>
        </footer>
      </form>

      {/* Analysis Result with Big Image & Neat Precautions */}
      {analysis && guidance && (
        <section className="analysis-result bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6" aria-live="polite">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg">
                ✓
              </span>
              <div>
                <p className="eyebrow text-xs uppercase tracking-wider font-bold text-teal-600">Analysis complete</p>
                <h3 className="text-xl font-bold text-slate-900">Result for patient {analysis.patientId || patientId.trim()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${guidance.color.badge}`}>
                {guidance.riskLevel}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Big Image Display Alongside Classification */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Big Enlarged Image Viewer */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div
                onClick={() => setIsZoomed(true)}
                className="relative group w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-lg flex items-center justify-center cursor-pointer"
              >
                <img
                  src={previewUrl}
                  alt={`CT Scan for patient ${analysis.patientId}`}
                  className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono">
                  Axial CT View
                </div>
                <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono">
                  ID: {analysis.patientId}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition">
                  🔍 Click to Enlarge
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Click scan image to inspect full size
              </p>
            </div>

            {/* Diagnostic Information & Metrics */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Output</span>
                  <span className="text-xs font-bold text-slate-600">{guidance.category}</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {analysis.prediction}
                </h4>

                {/* Animated Confidence Bar Meter */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Model Confidence</span>
                    <span className="text-teal-700">{Number(analysis.confidence).toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(10, analysis.confidence))}%`,
                        backgroundColor: guidance.color.accent,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Neat Pathology Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Pathological Context</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {guidance.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Neat Description of Precautions and Clinical Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div>
                <h4 className="text-base font-bold text-slate-900">Recommended Precautions &amp; Clinical Next Steps</h4>
                <p className="text-xs text-slate-500">Evidence-based clinical protocol corresponding to {analysis.prediction}</p>
              </div>
            </div>

            {/* 4 Neat Precaution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {guidance.precautions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 hover:border-teal-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Next Steps Checklist */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
              <h5 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📋</span> Immediate Clinical Action Checklist
              </h5>
              <ul className="space-y-1.5">
                {guidance.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✔</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="analysis-result-note text-xs text-slate-500 pt-2 border-t border-slate-100">
            Five-class lung cancer classification. Review this AI-generated
            result with appropriate clinical information. Model confidence is not a medical diagnosis.
          </p>

          <div className="flex justify-between items-center pt-2">
            <Link to="/history" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              ← View Saved Results in History
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Analyze Another Scan
            </button>
          </div>
        </section>
      )}

      {/* Enlarged Full-Screen Lightbox Modal */}
      {isZoomed && previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition font-bold"
            >
              ✕
            </button>
            <img
              src={previewUrl}
              alt="High-resolution CT inspection"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-white text-xs flex justify-between items-center">
              <span>Patient ID: <b>{patientId || "Unspecified"}</b></span>
              <span>Modality: <b>Thoracic CT (Axial)</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
