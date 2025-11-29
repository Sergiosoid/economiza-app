/**
 * Helper para integrar o classificador no fluxo de salvamento
 */

import { classifyItem, classifyItems, type ClassifiedItem, type ProductItem } from './classifier';

/**
 * Enriquece um item com dados de classificação antes de salvar
 */
export function enrichItemForSave(item: ProductItem): ProductItem & { 
  normalized_name?: string;
  category?: string;
  brand?: string;
} {
  const classified = classifyItem(item);
  
  return {
    ...item,
    normalized_name: classified.normalizedName,
    category: classified.category,
    brand: classified.brand,
  };
}

/**
 * Enriquece uma lista de itens com dados de classificação
 */
export function enrichItemsForSave(items: ProductItem[]): Array<ProductItem & {
  normalized_name?: string;
  category?: string;
  brand?: string;
}> {
  return items.map(item => enrichItemForSave(item));
}

/**
 * Prepara dados de item para envio ao backend com classificação
 */
export function prepareItemForBackend(item: ProductItem): {
  description: string;
  normalized_name?: string;
  category?: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_value: number;
} {
  const classified = classifyItem(item);
  
  return {
    description: item.name,
    normalized_name: classified.normalizedName,
    category: classified.category,
    brand: classified.brand,
    quantity: item.qty || 1,
    unit_price: item.price || 0,
    total_price: (item.price || 0) * (item.qty || 1),
    tax_value: item.tax || 0,
  };
}

