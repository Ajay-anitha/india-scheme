const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchSchemes(query = '') {
  const url = query
    ? `${API_BASE}/schemes?q=${encodeURIComponent(query)}`
    : `${API_BASE}/schemes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Backend server error');
  return res.json();
}

export async function fetchSchemeById(id) {
  const res = await fetch(`${API_BASE}/scheme/${id}`);
  if (!res.ok) throw new Error('Scheme not found');
  return res.json();
}

export async function checkEligibility(payload) {
  const res = await fetch(`${API_BASE}/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Eligibility check failed');
  return res.json();
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

