import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPredictionHistory } from "../services/diagnosisService";
import { formatName } from "../utils/formatName";

export default function ProfilePage() {
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    hospital: user?.hospital || "",
    specialization: user?.specialization || "",
    doctorId: user?.doctorId || "",
  });

  useEffect(() => {
    fetchPredictionHistory()
      .then(setAnalyses)
      .catch((requestError) =>
        setError(requestError.message || "Unable to load your analyses."),
      );
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfile({ ...form, name: formatName(form.name) });
      setEditing(false);
      setSuccess("Profile updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="surface profile-card">
        <div className="flex items-center gap-4">
          <div className="profile-avatar" aria-hidden="true">
            {formatName(user?.name || "Doctor")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-800">
              Dr. {formatName(user?.name || "Doctor")}
            </h2>
            <p className="text-slate-600">
              {user?.email || "Email not provided"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Saved analyses:{" "}
              <span className="font-semibold text-teal-700">
                {analyses.length}
              </span>
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn"
            disabled={loadingProfile}
            onClick={async () => {
              if (editing) {
                setEditing(false);
                setError("");
                setSuccess("");
                return;
              }
              setError("");
              setSuccess("");
              setLoadingProfile(true);
              try {
                const savedUser = await refreshUser();
                setForm({
                  name: savedUser.name || "",
                  email: savedUser.email || "",
                  hospital: savedUser.hospital || "",
                  specialization: savedUser.specialization || "",
                  doctorId: savedUser.doctorId || "",
                });
                setEditing(true);
              } catch (requestError) {
                setError(
                  requestError.message || "Unable to load saved profile details.",
                );
              } finally {
                setLoadingProfile(false);
              }
            }}
          >
            {loadingProfile
              ? "Loading…"
              : editing
                ? "Cancel"
                : "Edit profile"}
          </button>
        </div>
      </section>

      {editing && (
        <form className="surface profile-form" onSubmit={handleSave}>
          <h3 className="text-lg font-semibold text-slate-800">Edit profile</h3>
          <div className="auth-grid">
            {[
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["hospital", "Hospital / Organization", "text"],
              ["specialization", "Medical specialization", "text"],
              ["doctorId", "Doctor ID", "text"],
            ].map(([key, label, type]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  {label}
                </span>
                <input
                  type={type}
                  required={key === "name" || key === "email"}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </label>
            ))}
          </div>
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {(error || success) && (
        <p className={error ? "form-message error" : "form-message success"}>
          {error || success}
        </p>
      )}

      <section className="surface profile-details">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Professional details
        </h3>
        <dl className="profile-detail-list">
          <div>
            <dt>Hospital / Organization</dt>
            <dd>{user?.hospital || "Not provided"}</dd>
          </div>
          <div>
            <dt>Medical specialization</dt>
            <dd>{user?.specialization || "Not provided"}</dd>
          </div>
          <div>
            <dt>Doctor ID</dt>
            <dd>{user?.doctorId || "Not provided"}</dd>
          </div>
        </dl>
      </section>

      <section className="surface profile-details">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Recent analyses
        </h3>
        {analyses.length ? (
          <ul className="space-y-3">
            {analyses.slice(0, 5).map((item) => (
              <li key={item.id} className="profile-activity">
                <span>
                  Lung CT
                </span>
                <span>Patient {item.patientId || "ID not provided"}</span>
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            {error
              ? "Analysis activity could not be loaded."
              : "No saved analyses yet."}
          </p>
        )}
      </section>

      <button type="button" className="secondary-btn" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
