const workflow = [
  {
    number: "01",
    title: "Select the patient",
    detail: "Enter the patient ID so each submitted scan is linked to the correct history.",
  },
  {
    number: "02",
    title: "Add imaging",
    detail: "Upload one lung CT image to analyze it with the five-class lung cancer model.",
  },
  {
    number: "03",
    title: "Review classifications",
    detail: "View the model classification and confidence for each scan in the current review.",
  },
  {
    number: "04",
    title: "Return to the record",
    detail: "Find saved results in analysis history by patient ID, scan type, and date.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-9 max-w-3xl">
        <p className="eyebrow">Workflow</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A clear path from scan upload to saved result
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          Patient-linked analysis keeps lung CT review organized in one
          workspace.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2">
        {workflow.map((step) => (
          <li
            key={step.number}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="text-sm font-semibold tracking-wider text-teal-700">
              {step.number}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {step.detail}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Supported lung CT classes
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Adenocarcinoma",
            "Benign cases",
            "Large cell carcinoma",
            "Normal cases",
            "Squamous cell carcinoma",
          ].map((diseaseClass) => (
            <div key={diseaseClass} className="rounded-xl bg-white p-4">
              <p className="font-medium text-slate-900">{diseaseClass}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
