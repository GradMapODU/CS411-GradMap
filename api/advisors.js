// api/advisors.js
import { apiRequest } from "./client.js";

export function getStudents(token) {
  return apiRequest("/api/advisors/students", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updatePlan(token, planId, status, advisorNotes = "") {
  return apiRequest(`/api/advisors/plans/${planId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      advisor_notes: advisorNotes,
    }),
  });
}
