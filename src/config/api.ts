import axios, { AxiosInstance, AxiosError } from 'axios';

// TODO: Ajustar o IP para o IP da sua máquina na rede local
const BASE_URL = 'http://192.168.0.xxx:8000';

export function getApi(): AxiosInstance {
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de requisição (log)
  api.interceptors.request.use(
    (config) => {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta (log e tratamento de erro)
  api.interceptors.response.use(
    (response) => {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        // Servidor respondeu com status de erro
        console.error(
          `[API Error] ${error.response.status} ${error.config?.url}`,
          error.response.data
        );
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        console.error('[API Error] No response received', error.request);
      } else {
        // Erro ao configurar a requisição
        console.error('[API Error]', error.message);
      }
      return Promise.reject(error);
    }
  );

  return api;
}

