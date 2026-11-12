import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-white"
        >
          <span className="brand-mark">LS</span>LungScope AI
        </Link>
        <div>
          <span className="eyebrow" style={{ color: "#9de3dd" }}>
            Lung CT classification system
          </span>
          <h1>Clarity for every scan review.</h1>
          <p>
            A focused workspace for doctors to classify lung CT images, review
            model output, and keep a clear history of cases.
          </p>
        </div>
        <p className="!text-xs !text-[#b7dedd]">
          AI-assisted research tool. Not a definitive medical diagnosis.
        </p>
      </aside>
      <main className="auth-content">
        <div className="auth-card">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
