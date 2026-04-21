import api from "./axios";

export const ticketApi = {
  // Get all tickets (filtered by role logic in your backend)
  getAll: () => api.get("/tickets"),

  // Get the global list (the /all endpoint we just discussed)
  getGlobalAll: () => api.get("/tickets/all"),

  // Get a specific ticket by its ID
  getById: (id) => api.get(`/tickets/${id}`),

  // Get all tickets raised by a specific user
  getByUser: (userId) => api.get(`/tickets/user/${userId}`),

  // Create a new ticket
  create: (data) => api.post("/tickets", data),

  // Update full ticket details (PUT)
  update: (id, data) => api.put(`/tickets/${id}`, data),

  // Update only the status (PATCH)
  // Note: Since backend uses @RequestParam, we pass it in the params object
  updateStatus: (id, status) =>
    api.patch(`/tickets/${id}/status`, null, { params: { status } }),

  // Assign a technician (PATCH)
  assignTechnician: (id, techId) =>
    api.patch(`/tickets/${id}/assign/${techId}`),
};
