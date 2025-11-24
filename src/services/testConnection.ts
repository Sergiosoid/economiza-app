import { api } from './api';

interface ExampleResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function testConnection(): Promise<{ success: boolean; message: string; data?: ExampleResponse[] }> {
  try {
    const data = await api.get<ExampleResponse[]>('/api/v1/examples');
    return {
      success: true,
      message: `Conexão bem-sucedida! Encontrados ${data.length} exemplos.`,
      data,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || error?.message || 'Erro desconhecido';
    return {
      success: false,
      message: `Erro na conexão: ${errorMessage}`,
    };
  }
}

