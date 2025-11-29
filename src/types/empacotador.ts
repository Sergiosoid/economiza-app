/**
 * Tipos para o Modo Empacotador
 */

import type { ProductCategory } from '../services/ai/classifier';

export interface ItemCorrection {
  id?: number;
  receipt_item_id: string;
  original_name: string;
  original_normalized_name: string;
  original_category: ProductCategory;
  original_brand?: string;
  
  corrected_normalized_name?: string;
  corrected_category: ProductCategory;
  corrected_brand?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface EmpacotadorItem {
  receipt_item_id: string;
  original_name: string;
  normalized_name: string;
  category: ProductCategory;
  brand?: string;
  quantity?: number;
  unit_price?: number;
}

export interface ClassifierKnowledge {
  id?: number;
  pattern: string; // Nome normalizado ou padrão
  category: ProductCategory;
  brand?: string;
  confidence: number; // 0-1
  source: 'manual' | 'correction' | 'auto';
  created_at?: string;
  updated_at?: string;
}

