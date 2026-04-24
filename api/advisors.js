import { apiRequest } from "./client";

export function getCurrentAdvisor(token) {
  return apiRequest("/advisors/me", { token });
}

export function getMyStudents(token) {
  return apiRequest("/advisors/students", { token });
}

export function reviewPlan(token, planId, data) {
  return apiRequest(`/advisors/plans/${planId}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function addFeedback(token, planId, message) {
  return apiRequest(`/advisors/plans/${planId}/feedback`, {
    method: "POST",
    body: { message },
    token,
  });
}