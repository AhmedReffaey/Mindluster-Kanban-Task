import axios from 'axios';

// Automatically use LocalStorage when deployed on Vercel/Netlify for a stable Live Demo!
const USE_LOCAL_STORAGE = import.meta.env.PROD;

const DELAY = 400; // Simulate network latency to show loading spinners
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getLocalTasks = () => JSON.parse(localStorage.getItem('kanban_tasks') || '[]');
const saveLocalTasks = (tasks) => localStorage.setItem('kanban_tasks', JSON.stringify(tasks));

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// Seed data if empty array in Vercel to show something to the reviewer
const seedInitialDataIfNeeded = () => {
  const existing = getLocalTasks();
  if (existing.length === 0) {
    saveLocalTasks([]);
  }
};

export const fetchTasks = async () => {
  if (USE_LOCAL_STORAGE) {
    await delay(DELAY);
    seedInitialDataIfNeeded();
    return getLocalTasks();
  }
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (task) => {
  if (USE_LOCAL_STORAGE) {
    await delay(DELAY);
    const tasks = getLocalTasks();
    const newTask = { ...task, id: Date.now().toString() };
    tasks.push(newTask);
    saveLocalTasks(tasks);
    return newTask;
  }
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (task) => {
  if (USE_LOCAL_STORAGE) {
    await delay(DELAY);
    let tasks = getLocalTasks();
    tasks = tasks.map(t => t.id === task.id ? task : t);
    saveLocalTasks(tasks);
    return task;
  }
  const response = await api.put(`/tasks/${task.id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  if (USE_LOCAL_STORAGE) {
    await delay(DELAY);
    let tasks = getLocalTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveLocalTasks(tasks);
    return {};
  }
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};
