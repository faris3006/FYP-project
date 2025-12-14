import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config/api";

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Attach Authorization header automatically and redirect to /login on 401/403
export const authFetch = async (input, init = {}) => {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 || response.status === 403) {
    // Clear token and redirect to login for protected API calls
    clearToken();
    // Avoid infinite loops if we're already on login
    if (!window.location.pathname.includes("/login")) {
      // Preserve return path
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?next=${returnTo}`;
    }
  }
  return response;
};

export const logoutEverywhere = async () => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (_) {}
  clearToken();
};
