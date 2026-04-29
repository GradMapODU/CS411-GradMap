// api/resources.js
import { apiRequest } from "./client";

export function getResources(token) {
  return apiRequest("/api/resources", { token });
}
