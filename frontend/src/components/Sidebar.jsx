import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analyze", label: "Analyze Scan" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

function linkClass({ isActive }) {
  return `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">LS</span>
        <div>
          <p className="text-lg font-semibold text-slate-800">LungScope AI</p>
          <p className="text-xs text-slate-500">Lung CT research support</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
