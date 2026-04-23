// src/api/adminApi.js
const BASE_URL = "http://localhost:8080/api";

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API Request failed");
  }
  // Some patch requests might return a JSON body, others might be empty
  // This handles both cases safely
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res;
};

export const adminApi = {
  // --- Existing User Management ---
  getUsers: () =>
    fetch(`${BASE_URL}/admin/users`, { credentials: "include" }).then(
      handleResponse,
    ),

  enrollUser: (userData) =>
    fetch(`${BASE_URL}/admin/users/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    }).then(handleResponse),

  // --- Existing Ticket Management ---
  getAllTickets: () =>
    fetch(`${BASE_URL}/tickets`, { credentials: "include" }).then(
      handleResponse,
    ),

  assignTechnician: (ticketId, techId) =>
    fetch(`${BASE_URL}/tickets/${ticketId}/assign/${techId}`, {
      method: "PATCH",
      credentials: "include",
    }).then(handleResponse),

  updateTicketStatus: (ticketId, status) =>
    fetch(`${BASE_URL}/tickets/${ticketId}/status?status=${status}`, {
      method: "PATCH",
      credentials: "include",
    }).then(handleResponse),

  // --- NEW: Admin & Tech Feedback Management ---

  /**
   * Updates the official response visible to the student/lecturer.
   * Targets: @PatchMapping("/{id}/admin-response")
   */
  updateAdminResponse: (ticketId, responseText) =>
    fetch(`${BASE_URL}/tickets/${ticketId}/admin-response`, {
      method: "PATCH",
      headers: { "Content-Type": "text/plain" }, // Matches @RequestBody String in Spring Boot
      credentials: "include",
      body: responseText,
    }).then(handleResponse),

  /**
   * Updates internal technical notes.
   * Targets: @PatchMapping("/{id}/tech-feedback")
   */
  updateTechFeedback: (ticketId, feedbackText) =>
    fetch(`${BASE_URL}/tickets/${ticketId}/tech-feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "text/plain" },
      credentials: "include",
      body: feedbackText,
    }).then(handleResponse),
};
