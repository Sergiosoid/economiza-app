import { getApi } from '../config/api';
import {
  ScanReceiptResponse,
  ScanReceiptProcessingResponse,
  ScanReceiptConflictResponse,
  ReceiptListResponse,
  ReceiptDetailResponse,
  MonthlySummaryResponse,
  TopItemsResponse,
  StoreComparisonResponse,
} from '../types/api';

const apiInstance = getApi();

// 🔹 Wrapper genérico
export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await apiInstance.get<T>(endpoint);
    return response.data;
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await apiInstance.post<T>(endpoint, data);
    return response.data;
  },
};

// 🔹 Escanear Nota Fiscal
export async function scanReceipt(
  qr_text: string
): Promise<
  ScanReceiptResponse |
  ScanReceiptProcessingResponse |
  ScanReceiptConflictResponse
> {
  const response = await apiInstance.post(
    '/api/v1/receipts/scan',
    { qr_text }
  );
  return response.data;
}

// 🔹 Listar notas
export async function listReceipts(
  limit: number = 50,
  offset: number = 0
): Promise<ReceiptListResponse> {
  const response = await apiInstance.get(
    `/api/v1/receipts/list?limit=${limit}&offset=${offset}`
  );
  return response.data;
}

// 🔹 Buscar detalhes de uma nota fiscal
export async function getReceiptDetail(
  receiptId: string
): Promise<ReceiptDetailResponse> {
  const response = await apiInstance.get(
    `/api/v1/receipts/${receiptId}`
  );
  return response.data;
}

// 🔹 Resumo mensal
export async function getMonthlySummary(
  year: number,
  month: number,
  use_cache: boolean = true
): Promise<MonthlySummaryResponse> {
  const response = await apiInstance.get(
    `/api/v1/analytics/monthly-summary?year=${year}&month=${month}&use_cache=${use_cache}`
  );
  return response.data;
}

// 🔹 Top itens
export async function getTopItems(
  limit: number = 20
): Promise<TopItemsResponse> {
  const response = await apiInstance.get(
    `/api/v1/analytics/top-items?limit=${limit}`
  );
  return response.data;
}

// 🔹 Comparar preço entre lojas
export async function getStoreComparison(
  product_id: string
): Promise<StoreComparisonResponse> {
  const response = await apiInstance.get(
    `/api/v1/analytics/compare-store?product_id=${product_id}`
  );
  return response.data;
}

// 🔹 Créditos
export interface CreditsResponse {
  credits: number;
  credits_purchased: number;
  credits_used: number;
}

export interface ConsumeCreditResponse {
  success: boolean;
  credits_remaining: number;
  credits_consumed: number;
}

export interface PurchaseCreditsResponse {
  checkout_url: string;
  amount: number;
  estimated_price: number;
  message: string;
}

export async function getCredits(): Promise<CreditsResponse> {
  const response = await apiInstance.get('/api/v1/credits');
  return response.data;
}

export async function consumeCredit(
  actionType: string,
  actionId?: string,
  creditsAmount: number = 1
): Promise<ConsumeCreditResponse> {
  const params = new URLSearchParams({
    action_type: actionType,
    credits_amount: creditsAmount.toString(),
  });
  if (actionId) {
    params.append('action_id', actionId);
  }
  const response = await apiInstance.post(
    `/api/v1/credits/consume?${params.toString()}`
  );
  return response.data;
}

export async function startPurchaseCredits(
  amount: number
): Promise<PurchaseCreditsResponse> {
  const response = await apiInstance.post(
    `/api/v1/credits/purchase/start?amount=${amount}`
  );
  return response.data;
}
