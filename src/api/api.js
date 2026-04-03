import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // json-server port
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

export const fetchTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (task) => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (task) => {
  const response = await api.put(`/tasks/${task.id}`, task);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
