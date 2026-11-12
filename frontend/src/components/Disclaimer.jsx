export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-slate-500 leading-relaxed">
        Decision-support only — not a substitute for professional medical diagnosis or
        treatment.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong className="font-semibold">Medical disclaimer:</strong> LungScope AI is a
      decision-support tool for educational and demonstration purposes. It does not replace
      professional medical diagnosis, advice, or treatment. Always seek qualified healthcare
      providers for medical concerns.
    </div>
  )
}
