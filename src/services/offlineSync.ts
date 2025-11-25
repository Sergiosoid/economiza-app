/**
 * Serviço para sincronização offline de scans pendentes
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getApi } from '../config/api';
import { ScanReceiptRequest } from '../types/api';
import { DEV_TOKEN } from '../config/settings';

const PENDING_SCANS_KEY = '@economiza:pending_scans';

export interface PendingScan {
  qr_text: string;
  timestamp: number;
}

/**
 * Salva um scan pendente no AsyncStorage
 */
export async function savePendingScan(qr_text: string): Promise<void> {
  try {
    const pending = await getPendingScans();
    pending.push({
      qr_text,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(pending));
    console.log('Scan pendente salvo:', qr_text.substring(0, 20) + '...');
  } catch (error) {
    console.error('Erro ao salvar scan pendente:', error);
  }
}

/**
 * Obtém todos os scans pendentes
 */
export async function getPendingScans(): Promise<PendingScan[]> {
  try {
    const data = await AsyncStorage.getItem(PENDING_SCANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao obter scans pendentes:', error);
    return [];
  }
}

/**
 * Remove um scan pendente após sincronização bem-sucedida
 */
export async function removePendingScan(qr_text: string): Promise<void> {
  try {
    const pending = await getPendingScans();
    const filtered = pending.filter(scan => scan.qr_text !== qr_text);
    await AsyncStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erro ao remover scan pendente:', error);
  }
}

/**
 * Sincroniza todos os scans pendentes quando o app voltar online
 */
export async function syncPendingScans(): Promise<void> {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    console.log('Sem conexão, pulando sincronização');
    return;
  }

  const pending = await getPendingScans();
  
  if (pending.length === 0) {
    console.log('Nenhum scan pendente para sincronizar');
    return;
  }

  console.log(`Sincronizando ${pending.length} scan(s) pendente(s)...`);

  const api = getApi();
  const successful: string[] = [];

  for (const scan of pending) {
    try {
      const response = await api.post('/api/v1/receipts/scan', 
        { qr_text: scan.qr_text },
        {
          headers: {
            Authorization: `Bearer ${DEV_TOKEN}`,
          },
        }
      );

      if (response.status === 200 || response.status === 409) {
        successful.push(scan.qr_text);
        console.log('Scan sincronizado com sucesso:', scan.qr_text.substring(0, 20) + '...');
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar scan:', error);
      // Se for erro de rede, mantém o scan pendente
      // Se for erro do servidor (500), também mantém para tentar novamente
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // Erro do cliente (400, 409, etc) - remove pois não adianta tentar novamente
        successful.push(scan.qr_text);
      }
    }
  }

  // Remove scans sincronizados com sucesso
  for (const qr_text of successful) {
    await removePendingScan(qr_text);
  }

  console.log(`Sincronização concluída. ${successful.length}/${pending.length} scan(s) sincronizado(s)`);
}

/**
 * Limpa todos os scans pendentes (útil para testes)
 */
export async function clearPendingScans(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_SCANS_KEY);
}

