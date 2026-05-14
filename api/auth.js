// api/auth.js
import { apiRequest } from "./client";

export function loginUser({ username, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}