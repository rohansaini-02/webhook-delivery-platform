import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Auto-detect backend IP from Expo's dev server
const debuggerHost = Constants.expoConfig?.hostUri;
let ip = '10.110.155.246';
if (debuggerHost && !debuggerHost.includes('exp.direct')) {
  ip = debuggerHost.split(':')[0];
}

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
export const registerUser = (data: any) => api.post('/auth/register', data);
export const loginSettings = (data: any) => api.post('/auth/login', data);
export const updatePasswordReq = (data: any) => api.post('/auth/update-password', data);
export const regenerateApiKeyReq = () => api.post('/auth/regenerate-key');
export const googleAuth = (data: { idToken?: string; code?: string; redirectUri?: string }) =>
  api.post('/auth/google', data);

export const setApiKey = async (key: string) => {
  await AsyncStorage.setItem('apiKey', key);
};

export const getStoredApiKey = async () => {
  return AsyncStorage.getItem('apiKey');
};

// ─── Events ──────────────────────────────────────────────────────────────────
export const ingestEvent = (data: { type: string; payload: any }) => api.post('/events', data);
export const fetchEventTypes = () => api.get('/events/meta/types');
export const fetchMetrics = () => api.get('/metrics');

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const fetchSubscriptions = (cursor?: string, limit: number = 20) => 
  api.get('/subscriptions', { params: { cursor, limit } });
export const fetchSubscription = (id: string) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data: { url: string; events: string[]; environment?: 'PROD' | 'STAGE' }) =>
  api.post('/subscriptions', data);
export const updateSubscription = (id: string, data: any) =>
  api.patch(`/subscriptions/${id}`, data);
export const deleteSubscription = (id: string) => api.delete(`/subscriptions/${id}`);

// ─── Deliveries & DLQ ────────────────────────────────────────────────────────
export const fetchDeliveries = (cursor?: string, limit: number = 20) => 
  api.get('/deliveries', { params: { cursor, limit } });
export const fetchDlqDeliveries = (cursor?: string, limit: number = 20) => 
  api.get('/deliveries/dlq', { params: { cursor, limit } });
export const fetchDelivery = (id: string) => api.get(`/deliveries/${id}`);

export const purgeDlq = () => api.post('/deliveries/dlq/purge');
export const replayAllDlq = () => api.post('/deliveries/dlq/replay-all');
export const replayDlqItem = (id: string) => api.post(`/deliveries/${id}/replay`);

export default api;
