// api/auth.js
import { apiFetch } from "./client.js";
export function login(username, password) {
  return apiFetch("/api/auth/login", { method: "POST", body: { username, password } });
}
export function register(user) {
  return apiFetch("/api/auth/register", { method: "POST", body: user });
}

// api/students.js
import { apiFetch } from "./client.js";
export function getRequirements(token) {
  return apiFetch("/api/students/requirements", { token });
}