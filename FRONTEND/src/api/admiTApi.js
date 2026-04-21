// src/api/adminApi.js
const BASE_URL = "http://localhost:8080/api";

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API Request failed");
  }
  return res.json();
};

export const adminApi = {
  // User Management
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

  // Ticket Management
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
};
