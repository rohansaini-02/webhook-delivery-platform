import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Automatically detect the IP address of the development machine hosting the Expo server
const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : '10.110.155.246';
const API_BASE = `http://${ip}:3000/api/v1`;

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
