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

