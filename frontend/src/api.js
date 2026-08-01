const API_BASE_URL = "http://localhost:8000";

export async function fetchSchemes(searchQuery = "") {
  try {
    const url = searchQuery 
      ? `${API_BASE_URL}/schemes?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/schemes`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch schemes from server.");
    return await response.json();
  } catch (error) {
    console.error("API Error (fetchSchemes):", error);
    throw error;
  }
}

export async function fetchSchemeById(schemeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/scheme/${schemeId}`);
    if (!response.ok) throw new Error("Scheme not found.");
    return await response.json();
  } catch (error) {
    console.error("API Error (fetchSchemeById):", error);
    throw error;
  }
}

export async function checkEligibility(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error("Failed to check eligibility.");
    return await response.json();
  } catch (error) {
    console.error("API Error (checkEligibility):", error);
    throw error;
  }
}

export async function sendChatMessage(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error("Failed to send message to AI assistant.");
    return await response.json();
  } catch (error) {
    console.error("API Error (sendChatMessage):", error);
    throw error;
  }
}
