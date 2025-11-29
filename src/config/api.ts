import axios from 'axios';

export function getApi() {
  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 15000,
  });

  api.interceptors.request.use((config) => {
    if (config.headers) {
      config.headers.Authorization = 'Bearer test';
    }
    return config;
  });

  return api;
}
