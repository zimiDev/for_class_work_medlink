import api from './api';

export async function getAll(params = {}) {
  const response = await api.get('/diagnoses', { params });
  return response.data;
}

export async function getById(id) {
  const response = await api.get(`/diagnoses/${id}`);
  return response.data;
}

export async function create(data) {
  const response = await api.post('/diagnoses', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/diagnoses/${id}`, data);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/diagnoses/${id}`);
  return response.data;
}
