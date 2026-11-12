const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const STORAGE_KEY = "lungscope_ai_auth";

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ token, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

async function request(path, options = {}) {
  const stored = getStoredAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name, email, password, profile = {}) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, ...profile }),
  });
}

export async function fetchCurrentUser() {
  return request("/auth/me");
}

export async function updateProfile(profile) {
  return request("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export async function logoutApi() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Offline or session expired — still clear local session
  }
}
