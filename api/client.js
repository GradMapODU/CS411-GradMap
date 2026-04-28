// api/client.js
export async function apiRequest(path, options = {}) {
  const { token, body, headers, ...rest } = options;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  // Auto-stringify plain object bodies; leave strings/FormData alone
  let finalBody = body;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    typeof body !== "string"
  ) {
    finalBody = JSON.stringify(body);
  }

  const init = { ...rest, headers: finalHeaders };
  if (finalBody !== undefined) {
    init.body = finalBody;
  }

  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}