// api/client.js
//
// Lightweight wrapper around fetch with three conveniences the rest of the
// codebase already assumes:
//   - `token`  attaches "Authorization: Bearer <token>"
//   - `body`   if it's a plain object/array, gets JSON.stringified for you
//              (a pre-stringified string passes through untouched)
//   - errors  surface the server's `error` / `message` field when the
//              response is non-2xx
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