
import api from './api'

export const claimsService = {
  // Student: submit a claim
  submit: (data: {
    itemId: number
    identifyingMarks: string
    hiddenDetails: string
    lostWhenWhere: string
    proofFile?: File
  }) => {
    const form = new FormData()

    form.append('itemId', String(data.itemId))
    form.append('identifyingMarks', data.identifyingMarks)
    form.append('hiddenDetails', data.hiddenDetails)
    form.append('lostWhenWhere', data.lostWhenWhere)

    if (data.proofFile) {
      form.append('proof', data.proofFile)
    }

    return api.post('/claims', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Student: list own claims
  mine: () => api.get('/claims/mine'),

  // Guard: list pending claims
  pending: () => api.get('/claims/pending'),

  // Guard: get single claim with private evidence
  getById: (id: number) => api.get(`/claims/${id}`),

  // Guard: approve or reject
  decide: (id: number, decision: 'approved' | 'rejected', reason?: string) =>
    api.patch(`/claims/${id}/decision`, { decision, reason }),

  // Guard: record handover
  handover: (claimId: number, signatureData: string) =>
    api.post(`/claims/${claimId}/handover`, { signatureData }),
}
