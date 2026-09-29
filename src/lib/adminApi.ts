const API = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Calls the admin API: GET without a body, POST with one. Throws the API's error message if it fails.
 * The token goes in a header, never in the URL: URLs end up in logs and history.
 */
export async function adminApi(token: string, path: string, body?: object) {
  const res = await fetch(`${API}/admin/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `The API answered ${res.status}`);
  return json;
}
