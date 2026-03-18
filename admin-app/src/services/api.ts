import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:3000/api/v1'; // Android emulator → localhost

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach API key from storage to every request
api.interceptors.request.use(async (config) => {
  const apiKey = await AsyncStorage.getItem('apiKey');
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const setApiKey = async (key: string) => {
  await AsyncStorage.setItem('apiKey', key);
};

export const getStoredApiKey = async () => {
  return AsyncStorage.getItem('apiKey');
};

// ─── Metrics ─────────────────────────────────────────────────────────────────
export const fetchMetrics = () => api.get('/metrics');

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const fetchSubscriptions = () => api.get('/subscriptions');
export const fetchSubscription = (id: string) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data: { url: string; events: string[] }) =>
  api.post('/subscriptions', data);
export const updateSubscription = (id: string, data: any) =>
  api.put(`/subscriptions/${id}`, data);
export const deleteSubscription = (id: string) => api.delete(`/subscriptions/${id}`);

// ─── Deliveries ──────────────────────────────────────────────────────────────
export const fetchDeliveries = () => api.get('/deliveries');
export const fetchDelivery = (id: string) => api.get(`/deliveries/${id}`);

export default api;
