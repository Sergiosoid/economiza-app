/**
 * API Service para Shopping Lists
 */
import { getApi } from '../config/api';
const apiInstance = getApi();
import { UnitResponse, ShoppingListResponse, ShoppingListCreate, ShoppingListEstimateResponse, ShoppingListSyncResponse } from '../types/shoppingList';

/**
 * Busca todas as unidades disponíveis
 */
export async function fetchUnits(): Promise<UnitResponse[]> {
  const response = await apiInstance.get('/api/v1/units');
  return response.data;
}

/**
 * Lista todas as listas de compras do usuário
 */
export async function fetchShoppingLists(limit = 10, offset = 0): Promise<ShoppingListResponse[]> {
  const response = await apiInstance.get('/api/v1/shopping-lists', {
    params: { limit, offset },
  });
  return response.data;
}

/**
 * Busca uma lista de compras específica
 */
export async function fetchShoppingList(listId: string): Promise<ShoppingListResponse> {
  const response = await apiInstance.get(`/api/v1/shopping-lists/${listId}`);
  return response.data;
}

/**
 * Cria uma nova lista de compras
 */
export async function createShoppingList(data: ShoppingListCreate): Promise<ShoppingListResponse> {
  const response = await apiInstance.post('/api/v1/shopping-lists', data);
  return response.data;
}

/**
 * Estima custo de uma lista de compras
 */
export async function estimateList(listId: string): Promise<ShoppingListEstimateResponse> {
  const response = await apiInstance.post(`/api/v1/shopping-lists/${listId}/estimate`);
  return response.data;
}

/**
 * Sincroniza lista com uma nota fiscal
 */
export async function syncListWithReceipt(
  listId: string,
  receiptId: string
): Promise<ShoppingListSyncResponse> {
  const response = await apiInstance.post(
    `/api/v1/shopping-lists/${listId}/sync-with-receipt/${receiptId}`
  );
  return response.data;
}

/**
 * Busca histórico de execuções de uma lista
 */
export async function fetchExecutions(listId: string, limit = 20, offset = 0): Promise<any[]> {
  const response = await apiInstance.get(`/api/v1/shopping-lists/${listId}/executions`, {
    params: { limit, offset },
  });
  return response.data;
}

/**
 * Busca dados completos de uma execução (incluindo items)
 */
export async function fetchExecutionDetails(executionId: string): Promise<ShoppingListSyncResponse> {
  // Por enquanto, retornamos null pois o endpoint não existe ainda
  // Em produção, seria: GET /api/v1/shopping-lists/executions/{execution_id}
  // Por enquanto, vamos buscar do summary salvo na execução
  throw new Error('Endpoint não implementado ainda. Use os dados do sync response.');
}

/**
 * Baixa PDF de uma execução
 */
export async function downloadExecutionPDF(executionId: string): Promise<string> {
  const response = await apiInstance.get(
    `/api/v1/shopping-lists/executions/${executionId}/pdf`,
    {
      responseType: 'arraybuffer',
    }
  );
  // Converter arraybuffer para base64 (React Native compatible)
  // @ts-ignore - response.data pode ser ArrayBuffer
  const bytes = new Uint8Array(response.data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Usar Buffer se disponível (Expo), senão usar método manual
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary, 'binary').toString('base64');
  }
  // Fallback manual para base64
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    base64 += chars.charAt((bitmap >> 18) & 63);
    base64 += chars.charAt((bitmap >> 12) & 63);
    base64 += i + 1 < binary.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    base64 += i + 2 < binary.length ? chars.charAt(bitmap & 63) : '=';
  }
  return base64;
}

