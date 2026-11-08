import api from './api'

export const itemsService = {
  // Public
  getAll: (params?: { category?: string; dateRange?: string; area?: string; q?: string }) =>
    api.get('/items', { params }),

  getById: (id: number) => api.get(`/items/${id}`),

  // Guard only
  logItem: (data: FormData) =>
    api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  updateStatus: (id: number, status: string) =>
    api.patch(`/items/${id}/status`, { status }),
}
