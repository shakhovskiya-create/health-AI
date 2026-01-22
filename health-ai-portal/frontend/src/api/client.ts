import axios from 'axios'
import type { Supplement, Goal, LabResult, LabTrend, Cycle, ScheduleItem } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Supplements
export const supplementsApi = {
  list: (params?: { status?: string; category?: string }) =>
    api.get<Supplement[]>('/supplements', { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Supplement>(`/supplements/${id}`).then((r) => r.data),

  create: (data: Partial<Supplement>) =>
    api.post<Supplement>('/supplements', data).then((r) => r.data),

  update: (id: number, data: Partial<Supplement>) =>
    api.put<Supplement>(`/supplements/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/supplements/${id}`),

  getSchedule: () =>
    api.get<ScheduleItem[]>('/supplements/schedule').then((r) => r.data),

  getByCategory: () =>
    api.get<Record<string, Supplement[]>>('/supplements/by-category').then((r) => r.data),
}

// Goals
export const goalsApi = {
  list: () =>
    api.get<Goal[]>('/goals').then((r) => r.data),

  get: (id: number) =>
    api.get<Goal>(`/goals/${id}`).then((r) => r.data),

  create: (data: Partial<Goal>) =>
    api.post<Goal>('/goals', data).then((r) => r.data),

  update: (id: number, data: Partial<Goal>) =>
    api.put<Goal>(`/goals/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/goals/${id}`),
}

// Labs
export const labsApi = {
  list: (params?: { category?: string }) =>
    api.get<LabResult[]>('/labs', { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<LabResult>(`/labs/${id}`).then((r) => r.data),

  create: (data: Partial<LabResult>) =>
    api.post<LabResult>('/labs', data).then((r) => r.data),

  update: (id: number, data: Partial<LabResult>) =>
    api.put<LabResult>(`/labs/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/labs/${id}`),

  getByMarker: (name: string) =>
    api.get<LabResult[]>(`/labs/marker/${name}`).then((r) => r.data),

  getTrends: () =>
    api.get<LabTrend[]>('/labs/trends').then((r) => r.data),
}

// Cycles
export const cyclesApi = {
  list: () =>
    api.get<Cycle[]>('/cycles').then((r) => r.data),

  get: (id: number) =>
    api.get<Cycle>(`/cycles/${id}`).then((r) => r.data),

  create: (data: Partial<Cycle>) =>
    api.post<Cycle>('/cycles', data).then((r) => r.data),

  update: (id: number, data: Partial<Cycle>) =>
    api.put<Cycle>(`/cycles/${id}`, data).then((r) => r.data),
}

// Dashboard
export const dashboardApi = {
  getSummary: () =>
    api.get('/dashboard/summary').then((r) => r.data),
}

export default api
