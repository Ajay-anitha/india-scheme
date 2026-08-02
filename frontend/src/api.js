/**
 * Frontend API Service for AI Government Scheme Assistant
 * Connects directly to FastAPI Backend endpoints:
 * - GET  /
 * - GET  /schemes?q=...
 * - GET  /scheme/{id}
 * - POST /eligibility
 * - POST /chat
 */

const getPrimaryBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Default to 127.0.0.1:8000
  return 'http://127.0.0.1:8000';
};

/**
 * Robust fetch helper with automatic host fallback (127.0.0.1 <-> localhost)
 * to prevent CORS or origin resolution errors across different browsers/environments.
 */
async function apiFetch(path, options = {}) {
  const primaryBase = getPrimaryBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const primaryUrl = `${primaryBase}${cleanPath}`;

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  const defaultHeaders = {
    'Accept': 'application/json',
    ...(geminiApiKey ? { 'X-API-Key': geminiApiKey } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
  };

  const fetchOptions = {
    mode: 'cors',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(primaryUrl, fetchOptions);
    if (res.ok) {
      return res;
    }
    // If server responded with error status (e.g. 404, 500)
    throw new Error(`Server returned status ${res.status}`);
  } catch (primaryErr) {
    // If primary failed due to network error ("Failed to fetch"), try alternate local host alias
    let fallbackBase = null;
    if (primaryBase.includes('127.0.0.1')) {
      fallbackBase = primaryBase.replace('127.0.0.1', 'localhost');
    } else if (primaryBase.includes('localhost')) {
      fallbackBase = primaryBase.replace('localhost', '127.0.0.1');
    }

    if (fallbackBase) {
      try {
        const fallbackUrl = `${fallbackBase}${cleanPath}`;
        const fallbackRes = await fetch(fallbackUrl, fetchOptions);
        if (fallbackRes.ok) {
          return fallbackRes;
        }
      } catch (fallbackErr) {
        // preserve primary error
      }
    }
    throw primaryErr;
  }
}

/**
 * Health check endpoint (GET /)
 */
export async function checkBackendHealth() {
  try {
    const res = await apiFetch('/');
    return await res.json();
  } catch (err) {
    console.error('Backend health check failed:', err);
    throw err;
  }
}

/**
 * Fetch all schemes or search schemes by keyword (GET /schemes?q=...)
 */
export async function fetchSchemes(query = '') {
  try {
    const path = query && query.trim()
      ? `/schemes?q=${encodeURIComponent(query.trim())}`
      : '/schemes';
    const res = await apiFetch(path);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch schemes:', err);
    throw new Error('Unable to connect to the backend server. Please ensure FastAPI is running on http://127.0.0.1:8000.');
  }
}

/**
 * Fetch scheme search suggestions for dropdown autocomplete (GET /schemes/suggest?q=...)
 */
export async function fetchSchemeSuggestions(query = '') {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await apiFetch(`/schemes/suggest?q=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch (err) {
    console.warn('Failed to fetch scheme suggestions:', err);
    return [];
  }
}

/**
 * Fetch a single scheme by ID (GET /scheme/{id})
 */
export async function fetchSchemeById(id) {
  try {
    const res = await apiFetch(`/scheme/${id}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch scheme ${id}:`, err);
    throw new Error('Scheme details not found.');
  }
}

/**
 * Verify scheme eligibility (POST /eligibility)
 */
export async function checkEligibility(payload) {
  try {
    const res = await apiFetch('/eligibility', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Eligibility check error:', err);
    throw new Error('Eligibility verification failed. Unable to connect to backend API.');
  }
}

/**
 * Send chat message to AI Assistant (POST /chat)
 */
export async function sendChatMessage(message) {
  try {
    const res = await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('AI Chat error:', err);
    throw new Error('Chat failed. Unable to communicate with AI Assistant service.');
  }
}
