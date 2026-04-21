import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Auto-detect backend IP
const debuggerHost = Constants.expoConfig?.hostUri;
let ip = '10.110.155.246'; // Your current Wi-Fi IPv4: 10.110.155.246

if (__DEV__) {
  if (!Constants.isDevice && Platform.OS === 'android') {
    ip = '10.0.2.2';
  } else if (!Constants.isDevice && Platform.OS === 'ios') {
    ip = '127.0.0.1';
  } else if (debuggerHost) {
    // Priority 1: Use the actual Expo dev host IP
    ip = debuggerHost.split(':')[0];
  }
}

// Ensure we aren't using an Expo tunnel URL for the API (unless configured)
if (ip.includes('exp.direct') || ip.includes('anonymous')) {
  console.warn('[API] Expo Tunnel detected. Standard local connections might fail. Defaulting back to current local IP.');
  ip = '10.110.155.246';
}

// 1. Prioritize explicitly provided URL (Best for dealing with AP Isolation on physical devices)
// 2. Fall back to local LAN IP resolution
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || `http://${ip}:3000/api/v1`;

console.log('[API] ===== CONNECTING TO:', API_BASE, '=====');

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
