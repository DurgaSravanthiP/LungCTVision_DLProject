const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function authHeaders() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("lungscope_ai_auth") || "null",
    );
    return stored?.token ? { Authorization: `Bearer ${stored.token}` } : {};
  } catch {
    return {};
  }
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function analyzeScan({ patientId, scanType, image }) {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("scanType", scanType);
  formData.append("image", image);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const data = await readResponse(response);
  return data;
}

export async function fetchPredictionHistory() {
  const response = await fetch(`${API_BASE}/analysis/history`, {
    headers: authHeaders(),
  });
  const data = await readResponse(response);
  return data.history || [];
}

export async function fetchAnalysisById(id) {
  const response = await fetch(`${API_BASE}/analysis/${id}`, {
    headers: authHeaders(),
  });
  const data = await readResponse(response);
  return data.analysis;
}

export async function fetchAnalysisImage(id) {
  const response = await fetch(
    `${API_BASE}/analysis/${encodeURIComponent(id)}/image`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to load the analysis image.");
  }

  return response.blob();
}

export async function savePrediction(id) {
  return fetchAnalysisById(id);
}
