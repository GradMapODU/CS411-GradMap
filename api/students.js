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

export function submitPlan(token, planId) {
  return apiRequest(`/api/students/plans/${planId}/submit`, {
    method: "POST",
    token,
  });
}

export function deletePlan(token, planId) {
  return apiRequest(`/api/students/plans/${planId}`, {
    method: "DELETE",
    token,
  });
}

export function updatePlanCourses(token, planId, courses) {
  return apiRequest(`/api/students/plans/${planId}/courses`, {
    method: "PUT",
    body: { courses },
    token,
  });
}

export function getAvailability(token) {
  return apiRequest("/api/students/availability", { token });
}

export function saveAvailability(token, slots) {
  return apiRequest("/api/students/availability", {
    method: "PUT",
    body: slots,
    token,
  });
}

export function addAvailability(token, slot) {
  return apiRequest("/api/students/availability", {
    method: "POST",
    body: slot,
    token,
  });
}