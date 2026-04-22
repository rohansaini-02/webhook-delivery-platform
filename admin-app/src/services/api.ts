import AsyncStorage from '@react-native-async-storage/async-storage';

const resolveApiUrl = (): string => {
  return 'https://webhook-delivery-platform-nlew.onrender.com/api/v1';
};

export const API_BASE = resolveApiUrl();

console.log('[API] Connecting to:', API_BASE);

// Helper to build explicit query parameters
const buildUrl = (path: string, params?: Record<string, any>) => {
  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
         searchParams.append(key, String(params[key]));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
};

// Explicit Fetch Adapter that completely replaces the bugged Axios instance
const nativeFetchRequest = async (method: string, path: string, options: { data?: any, params?: any } = {}) => {
  const url = buildUrl(path, options.params);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true'
  };

  const apiKey = await AsyncStorage.getItem('apiKey');
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options.data) {
    fetchOptions.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = text; }

    // Replicate Axios error shape
    if (!response.ok) {
      if (response.status === 401 && data?.status === 'error' && typeof data?.message === 'string') {
         await AsyncStorage.removeItem('apiKey');
      }
      throw { response: { status: response.status, data }, message: `HTTP ${response.status}` };
    }

    // Replicate Axios success shape
    return { data, status: response.status };
  } catch (err: any) {
    if (!err.response) {
      throw { message: err.message || 'Network Error', isFetchError: true };
    }
    throw err;
  }
};

const api = {
  get: (path: string, config?: any) => nativeFetchRequest('GET', path, { params: config?.params }),
  post: (path: string, data?: any, config?: any) => nativeFetchRequest('POST', path, { data, params: config?.params }),
  patch: (path: string, data?: any, config?: any) => nativeFetchRequest('PATCH', path, { data, params: config?.params }),
  delete: (path: string, config?: any) => nativeFetchRequest('DELETE', path, { params: config?.params }),
};

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
