import { apiRequest } from "./client";

export function getCurrentStudent(token) {
  return apiRequest("/students/me", { token });
}

export function getRequirements(token) {
  return apiRequest("/students/requirements", { token });
}

export function generateSemester(token, data) {
  return apiRequest("/students/generate-semester", {
    method: "POST",
    body: data,
    token,
  });
}

export function getPlanFeedback(token, planId) {
  return apiRequest(`/students/plans/${planId}/feedback`, { token });
}