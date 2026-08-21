import api from './api';

export const leaseService = {
  getAll: () => api.get('/leases'),
  getById: (id) => api.get(`/leases/${id}`)
};
