import { apiRequest } from "./client";

export function getCourseCatalog(token, params = {}) {
  const { major, department, search } = params || {};
  const qp = new URLSearchParams();
  if (major) qp.append("major", major);
  if (department) qp.append("department", department);
  if (search) qp.append("q", search);
  const query = qp.toString();
  const url = query ? `/api/courses?${query}` : "/api/courses";
  return apiRequest(url, { token });
}

export function getCourseById(token, courseId) {
  if (!courseId) return Promise.reject(new Error("courseId is required"));
  return apiRequest(`/api/courses/${encodeURIComponent(courseId)}`, { token });
}