// api/client.js

export async function apiRequest(path, options = {}) {
  const { token, body, headers: customHeaders, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  if (body != null && typeof body !== "string" && !(body instanceof FormData)) {
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(path, {
    ...rest,
    headers,
    ...(finalBody !== undefined ? { body: finalBody } : {}),
  });

  // 204 No Content / empty body -> just return {} so callers don't choke.
  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  return data;
}