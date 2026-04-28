// api/students.js
import { apiRequest } from "./client";

export function getCurrentStudent(token) {
  return apiRequest("/api/students/me", { token });
}

export function getRequirements(token) {
  return apiRequest("/api/students/requirements", { token });
}

export function generateSemester(token, data) {
  return apiRequest("/api/students/generate-semester", {
    method: "POST",
    body: data,
    token,
  });
}

export function getPlanFeedback(token, planId) {
  return apiRequest(`/api/students/plans/${planId}/feedback`, { token });
}

export function deletePlan(token, planId) {
  return apiRequest(`/api/students/plans/${planId}`, {
    method: "DELETE",
    token,
  });
}