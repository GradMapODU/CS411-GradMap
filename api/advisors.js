import { apiRequest } from "./client";

export function getCurrentAdvisor(token) {
  return apiRequest("/api/advisors/me", { token });
}

export function getMyStudents(token) {
  return apiRequest("/api/advisors/students", { token });
}

export function reviewPlan(token, planId, { status, message } = {}) {
  return apiRequest(`/api/advisors/plans/${planId}`, {
    method: "PUT",
    body: { status, message },
    token,
  });
}

export function addFeedback(token, planId, message) {
  return apiRequest(`/api/advisors/plans/${planId}/feedback`, {
    method: "POST",
    body: { message },
    token,
  });
}

export const getStudents = getMyStudents;
export const updatePlan = reviewPlan;
