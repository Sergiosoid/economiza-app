/**
 * Serviço para chamar a função Supabase fetchReceipt
 * 
 * Faz scraping de páginas NFC-e usando a URL do QR Code
 */

import { getApi } from '../config/api';

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  tax: number;
}

export interface FetchReceiptResponse {
  store: string;
  date: string;
  total: number;
  items: ReceiptItem[];
}

export interface FetchReceiptError {
  error: string;
  message: string;
  details?: any;
}

/**
 * Chama a função Supabase fetchReceipt para fazer scraping de uma nota fiscal
 * 
 * @param qrCodeUrl URL da nota fiscal extraída do QR Code
 * @returns Dados estruturados da nota fiscal
 * @throws Error se houver erro no scraping
 */
export async function fetchReceipt(qrCodeUrl: string): Promise<FetchReceiptResponse> {
  // TODO: Substituir pela URL real da sua função Supabase
  // Exemplo: https://seu-project-ref.supabase.co/functions/v1/fetchReceipt
  const SUPABASE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL || 
    'https://your-project-ref.supabase.co/functions/v1/fetchReceipt';
  
  try {
    const apiInstance = getApi();
    
    const response = await apiInstance.post<FetchReceiptResponse>(
      SUPABASE_FUNCTION_URL,
      { qrCodeUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          // Se necessário, adicione autenticação aqui
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('[fetchReceipt] Erro ao chamar função Supabase:', error);
    
    if (error.response) {
      const errorData: FetchReceiptError = error.response.data;
      throw new Error(errorData.message || 'Erro ao fazer scraping da nota fiscal');
    }
    
    if (error.request) {
      throw new Error('Não foi possível conectar ao servidor');
    }
    
    throw new Error('Erro inesperado ao processar nota fiscal');
  }
}

/**
 * Valida se uma string é uma URL válida de nota fiscal
 */
export function isValidReceiptUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Verificar se é HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Verificar se contém indicadores de nota fiscal
    const receiptIndicators = [
      'sefaz',
      'nfce',
      'nfe',
      'nota',
      'fiscal',
    ];
    
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    return receiptIndicators.some(indicator => 
      hostname.includes(indicator) || pathname.includes(indicator)
    );
  } catch {
    return false;
  }
}

