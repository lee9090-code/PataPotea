import api from './api'

export const lostReportsService = {
  submit: (data: {
    category: string
    description: string
    locationLost: string
    dateLost: string
  }) => api.post('/lost-reports', data),

  mine: () => api.get('/lost-reports/mine'),

  all: (status?: string) =>
    api.get('/lost-reports', { params: status ? { status } : undefined }),
}
