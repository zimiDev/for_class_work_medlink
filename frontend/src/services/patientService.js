import api from './api';

export async function getAll(params = {}) {
  const response = await api.get('/patients', { params });
  return response.data;
}

export async function getById(id) {
  const response = await api.get(`/patients/${id}`);
  return response.data;
}

export async function create(data) {
  const response = await api.post('/patients', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
}
