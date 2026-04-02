// api/advisors.js
import { apiFetch } from "./client.js";
export function getStudents(token) {
  return apiFetch("/api/advisors/students", { token });
}
export function updatePlan(token, planId, status, advisorNotes) {
  return apiFetch(`/api/advisors/plans/${planId}`, {
    method: "PUT",
    token,
    body: { status, advisor_notes: advisorNotes }
  });
}