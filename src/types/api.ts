/**
 * Tipos TypeScript para respostas da API
 */

export interface ScanReceiptRequest {
  qr_text: string;
}

export interface ScanReceiptResponse {
  receipt_id: string;
  status: 'saved';
}

export interface ScanReceiptProcessingResponse {
  status: 'processing';
  task_id: string;
  message: string;
}

export interface ScanReceiptConflictResponse {
  detail: string;
  receipt_id: string;
}

export interface ReceiptDetailResponse {
  id: string;
  user_id: string;
  access_key: string;
  total_value: number;
  subtotal: number;
  total_tax: number;
  emitted_at: string;
  store_name: string | null;
  store_cnpj: string | null;
  created_at: string;
  items: ReceiptItemResponse[];
}

export interface ReceiptItemResponse {
  id: string;
  receipt_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_value: number;
  created_at: string;
}

export interface ReceiptListItem {
  id: string;
  store_name: string | null;
  store_cnpj: string | null;
  total_value: number;
  total_tax: number;
  emitted_at: string | null;
  created_at: string | null;
}

export interface ReceiptListResponse {
  receipts: ReceiptListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface MonthlySummaryResponse {
  total_mes: number;
  total_por_categoria: Record<string, number>;
  top_10_itens: Array<{
    description: string;
    total_quantity: number;
    total_spent: number;
    purchase_count: number;
  }>;
  variacao_vs_mes_anterior: number;
  month: string;
}

export interface TopItem {
  description: string;
  total_quantity: number;
  total_spent: number;
  avg_price: number;
  purchase_count: number;
}

export interface TopItemsResponse {
  items: TopItem[];
  count: number;
}

export interface StorePriceComparison {
  store_name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  purchase_count: number;
}

export interface StoreComparisonResponse {
  product_id: string;
  product_name: string;
  preco_medio_por_supermercado: StorePriceComparison[];
  menor_preco_encontrado: number | null;
  loja_menor_preco: string | null;
  total_comparacoes: number;
}

