/**
 * Zustand Store para Shopping Lists
 */
import { create } from 'zustand';
import { ShoppingListResponse, ExecutionResponse } from '../types/shoppingList';
import {
  fetchShoppingLists,
  fetchShoppingList,
  fetchExecutions,
} from '../services/shoppingListsApi';

interface ShoppingListState {
  lists: ShoppingListResponse[];
  activeList: ShoppingListResponse | null;
  executions: ExecutionResponse[];
  loading: boolean;
  error: string | null;
  loadLists: () => Promise<void>;
  loadList: (id: string) => Promise<void>;
  loadExecutions: (listId: string) => Promise<void>;
  clearActiveList: () => void;
}

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  lists: [],
  activeList: null,
  executions: [],
  loading: false,
  error: null,

  loadLists: async () => {
    set({ loading: true, error: null });
    try {
      const lists = await fetchShoppingLists();
      set({ lists, loading: false });
    } catch (error: any) {
      console.error('Erro ao carregar listas:', error);
      set({ error: error.message || 'Erro ao carregar listas', loading: false });
    }
  },

  loadList: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const list = await fetchShoppingList(id);
      set({ activeList: list, loading: false });
    } catch (error: any) {
      console.error('Erro ao carregar lista:', error);
      set({ error: error.message || 'Erro ao carregar lista', loading: false });
    }
  },

  loadExecutions: async (listId: string) => {
    set({ loading: true, error: null });
    try {
      const executions = await fetchExecutions(listId);
      set({ executions, loading: false });
    } catch (error: any) {
      console.error('Erro ao carregar execuções:', error);
      set({ error: error.message || 'Erro ao carregar execuções', loading: false });
    }
  },

  clearActiveList: () => {
    set({ activeList: null });
  },
}));

