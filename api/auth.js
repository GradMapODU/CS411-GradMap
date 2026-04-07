// api/auth.js
import { apiRequest } from "./client";

export function loginUser({ username, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRequirements(token) {
  return apiRequest("/api/students/requirements", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}