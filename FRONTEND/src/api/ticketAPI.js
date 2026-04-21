import api from "./axios";

export const ticketApi = {
  getAll: (params) => api.get("/facilities", { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post("/facilities", data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`),
  toggleStatus: (id) => api.patch(`/facilities/${id}/status`),
};
