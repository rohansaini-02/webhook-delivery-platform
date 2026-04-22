import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── API Base URL Configuration ──────────────────────────────────────────────
// Production: Set EXPO_PUBLIC_API_URL in your .env before building the APK
// Development: Auto-detects from Expo dev server
const resolveApiUrl = (): string => {
  // Hardcoded to strictly point to Render for the production testing phase
  return 'https://webhook-delivery-platform-nlew.onrender.com/api/v1';
};

export const API_BASE = resolveApiUrl();

console.log('[API] Connecting to:', API_BASE);


const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',  // Required: skip LocalTunnel interstitial page
  },
});

// Attach API key from storage to every request
api.interceptors.request.use(async (config) => {
  const apiKey = await AsyncStorage.getItem('apiKey');
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// Handle global response errors (e.g., auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Only clear auth if the backend explicitly rejected the key
      // (don't clear on tunnel errors or transient network issues)
      const isRealAuthError = error.response?.data?.status === 'error'
        && typeof error.response?.data?.message === 'string';
      if (isRealAuthError) {
        await AsyncStorage.removeItem('apiKey');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerUser = (data: any) => api.post('/auth/register', data);
export const loginSettings = (data: any) => api.post('/auth/login', data);
export const updatePasswordReq = (data: any) => api.post('/auth/update-password', data);
export const regenerateApiKeyReq = () => api.post('/auth/regenerate-key');

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
