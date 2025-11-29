/**
 * Types para Shopping Lists
 */
import { UUID } from './api';

export interface UnitResponse {
  id: UUID;
  code: string;
  name: string;
  type: string;
  multiplier: number;
}

export interface ShoppingListItemCreate {
  description: string;
  quantity: number;
  unit_code: string;
  product_id?: UUID | null;
}

export interface ShoppingListCreate {
  name: string;
  items: ShoppingListItemCreate[];
}

export interface ShoppingListItemResponse {
  id: UUID;
  shopping_list_id: UUID;
  product_id?: UUID | null;
  description: string;
  quantity: number;
  unit_code: string;
  unit_type: string;
  unit_multiplier: number;
  price_estimate?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListResponse {
  id: UUID;
  user_id: UUID;
  name: string;
  is_shared: boolean;
  meta?: any;
  items: ShoppingListItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItemEstimateResponse {
  id: UUID;
  description: string;
  quantity: number;
  unit_code: string;
  unit_price_estimate?: number | null;
  total_price_estimate?: number | null;
  confidence: number;
}

export interface ShoppingListEstimateResponse {
  list_id: UUID;
  total_estimate?: number | null;
  items: ShoppingListItemEstimateResponse[];
}

export interface ItemComparisonResponse {
  id?: string | null;
  description: string;
  planned_quantity?: number | null;
  planned_unit_code?: string | null;
  real_quantity?: number | null;
  real_unit_code?: string | null;
  planned_unit_price?: number | null;
  real_unit_price?: number | null;
  planned_total?: number | null;
  real_total?: number | null;
  difference?: number | null;
  difference_percent?: number | null;
  status:
    | 'PLANNED_AND_MATCHED'
    | 'PLANNED_NOT_PURCHASED'
    | 'PURCHASED_NOT_PLANNED'
    | 'PRICE_HIGHER_THAN_EXPECTED'
    | 'PRICE_LOWER_THAN_EXPECTED'
    | 'QUANTITY_DIFFERENT';
}

export interface ShoppingListSyncResponse {
  list_id: UUID;
  receipt_id: UUID;
  summary: {
    planned_total?: number | null;
    real_total: number;
    difference?: number | null;
    difference_percent?: number | null;
    items_planned: number;
    items_purchased: number;
    items_missing: number;
    items_extra: number;
  };
  items: ItemComparisonResponse[];
  execution_id: UUID;
  created_at: string;
}

export interface ExecutionResponse {
  execution_id: UUID;
  created_at: string;
  planned_total?: number | null;
  real_total?: number | null;
  difference?: number | null;
  difference_percent?: number | null;
  receipt_id: UUID;
}

