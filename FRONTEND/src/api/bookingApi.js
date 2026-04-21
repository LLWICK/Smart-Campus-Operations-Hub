import api from './axios';

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
  approve: (id, data) => api.patch(`/bookings/${id}/approve`, data),
  reject: (id, data) => api.patch(`/bookings/${id}/reject`, data),
  checkAvailability: (params) => api.get('/bookings/check-availability', { params }),
  getByFacilityAndDate: (facilityId, date) =>
    api.get(`/bookings/facility/${facilityId}/date/${date}`),
  getByCheckInCode: (checkInCode) => api.get(`/bookings/checkin/${checkInCode}`),
  checkIn: (checkInCode) => api.post(`/bookings/checkin/${checkInCode}`),
};
