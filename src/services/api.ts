import { getApi } from '../config/api';
import { AxiosInstance } from 'axios';
import { DEV_TOKEN } from '../config/settings';
import {
  ScanReceiptResponse,
  ScanReceiptProcessingResponse,
  ScanReceiptConflictResponse,
  ReceiptListResponse,
} from '../types/api';

const apiInstance: AxiosInstance = getApi();

export const api = {
  baseURL: apiInstance.defaults.baseURL || '',

  async get<T>(endpoint: string): Promise<T> {
    const response = await apiInstance.get<T>(endpoint);
    return response.data;
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await apiInstance.post<T>(endpoint, data);
    return response.data;
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await apiInstance.put<T>(endpoint, data);
    return response.data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await apiInstance.delete<T>(endpoint);
    return response.data;
  },
};

/**
 * Escaneia um QR code de nota fiscal
 * @param qr_text Texto do QR code
 * @returns Resposta do backend (pode ser ScanReceiptResponse, ScanReceiptProcessingResponse ou ScanReceiptConflictResponse)
 */
export async function scanReceipt(
  qr_text: string
): Promise<ScanReceiptResponse | ScanReceiptProcessingResponse | ScanReceiptConflictResponse> {
  const response = await apiInstance.post<
    ScanReceiptResponse | ScanReceiptProcessingResponse | ScanReceiptConflictResponse
  >(
    '/api/v1/receipts/scan',
    { qr_text },
    {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    }
  );
  return response.data;
}

/**
 * Lista todas as notas fiscais do usuário
 * @param limit Número máximo de resultados (padrão: 50)
 * @param offset Número de resultados para pular (padrão: 0)
 * @returns Lista de receipts
 */
export async function listReceipts(
  limit: number = 50,
  offset: number = 0
): Promise<ReceiptListResponse> {
  const response = await apiInstance.get<ReceiptListResponse>(
    `/api/v1/receipts/list?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    }
  );
  return response.data;
}
