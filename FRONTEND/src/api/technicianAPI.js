import api from "./axios";

export const technicianApi = {
  /**
   * Get all tickets specifically assigned to the logged-in technician
   * Maps to: GET /api/technician/my-tasks
   */
  getMyTasks: () => api.get("/technician/my-tasks"),

  /**
   * Submit technical resolution feedback
   * This will also trigger the status change to RESOLVED in the backend logic
   * Maps to: PATCH /api/technician/tickets/{id}/resolve
   */
  resolveTask: (id, feedback) =>
    api.patch(`/technician/tickets/${id}/resolve`, { feedback }),

  /**
   * Update the status of a task (e.g., moving from OPEN to IN_PROGRESS)
   * Note: Uses params because the backend expects @RequestParam TicketStatus status
   * Maps to: PATCH /api/tickets/{id}/status
   */
  updateTaskStatus: (id, status) =>
    api.patch(`/tickets/${id}/status`, null, { params: { status } }),

  /**
   * Add a technical note without necessarily resolving the ticket
   * Maps to: PATCH /api/tickets/{id}/tech-feedback
   */
  updateTechFeedback: (id, feedback) =>
    api.patch(`/tickets/${id}/tech-feedback`, feedback, {
      headers: { "Content-Type": "text/plain" },
    }),
};
