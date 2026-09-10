const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function request(path, { token, method = 'GET', body, form } = {}) {
  const headers = {}; if (token) headers.Authorization = `Bearer ${token}`; if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  if (response.status === 204) return null; const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Request failed.'); return data;
}
