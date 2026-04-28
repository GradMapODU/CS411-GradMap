import { apiRequest } from "./client";

export function getCurrentAdvisor(token) {
  return apiRequest("/api/advisors/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getMyStudents(token) {
  return apiRequest("/api/advisors/students", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function reviewPlan(token, planId, data) {
  return apiRequest(`/api/advisors/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function addFeedback(token, planId, message) {
  return apiRequest(`/api/advisors/plans/${planId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Aliases used by App.jsx
export const getStudents = getMyStudents;
export const updatePlan = reviewPlan;