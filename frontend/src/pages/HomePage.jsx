import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const ctaPath = isAuthenticated ? "/analyze" : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Lung CT research workspace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Lung CT classification, organized around the patient.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Review five-class lung cancer predictions in one focused workspace.
            Keep each result connected to its patient record.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={ctaPath}>
              <Button className="px-8 py-3 text-base">Open workspace</Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">
            Supported scan
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Lung CT</h2>
          <p className="mt-2 text-base text-slate-600">
            Adenocarcinoma, benign, large cell carcinoma, normal, and squamous
            cell carcinoma classification.
          </p>
        </div>

      </section>
    </div>
  );
}
