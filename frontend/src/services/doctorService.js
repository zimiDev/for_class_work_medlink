import api from './api';

export async function getAll(params = {}) {
  const response = await api.get('/doctors', { params });
  return response.data;
}

export async function getById(id) {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
}

export async function getByShift(shift) {
  const response = await api.get(`/doctors/by-shift/${shift}`);
  return response.data;
}

export async function create(data) {
  const response = await api.post('/doctors', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
}
