import { getApi } from '../config/api';
import { AxiosInstance } from 'axios';
import { DEV_TOKEN } from '../config/settings';
import {
  ScanReceiptResponse,
  ScanReceiptProcessingResponse,
  ScanReceiptConflictResponse,
  ReceiptListResponse,
  MonthlySummaryResponse,
  TopItemsResponse,
  StoreComparisonResponse,
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

/**
 * Obtém resumo mensal de gastos
 * @param year Ano (ex: 2024)
 * @param month Mês (1-12)
 * @param use_cache Usar cache se disponível (padrão: true)
 * @returns Resumo mensal com totais, categorias, top itens e variação
 */
export async function getMonthlySummary(
  year: number,
  month: number,
  use_cache: boolean = true
): Promise<MonthlySummaryResponse> {
  const response = await apiInstance.get<MonthlySummaryResponse>(
    `/api/v1/analytics/monthly-summary?year=${year}&month=${month}&use_cache=${use_cache}`,
    {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    }
  );
  return response.data;
}

/**
 * Obtém os itens mais comprados
 * @param limit Número máximo de itens (padrão: 20, máximo: 100)
 * @returns Lista de itens ordenados por total gasto
 */
export async function getTopItems(
  limit: number = 20
): Promise<TopItemsResponse> {
  const response = await apiInstance.get<TopItemsResponse>(
    `/api/v1/analytics/top-items?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    }
  );
  return response.data;
}

/**
 * Compara preços de um produto em diferentes supermercados
 * @param product_id ID do produto
 * @returns Comparação de preços por supermercado
 */
export async function getStoreComparison(
  product_id: string
): Promise<StoreComparisonResponse> {
  const response = await apiInstance.get<StoreComparisonResponse>(
    `/api/v1/analytics/compare-store?product_id=${product_id}`,
    {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    }
  );
  return response.data;
}
