import api from './api'

export const authService = {
  register: (data: {
    fullName: string
    studentOrStaffNumber: string
    email: string
    password: string
  }) => api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
}
