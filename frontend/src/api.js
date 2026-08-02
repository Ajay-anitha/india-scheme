const API_BASE = 'http://localhost:8000';

export async function fetchSchemes(query = '') {
  const url = query
    ? `${API_BASE}/schemes?q=${encodeURIComponent(query)}`
    : `${API_BASE}/schemes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Backend offline');
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
