import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listReceipts } from '../services/api';
import { ReceiptListItem } from '../types/api';

export const HomeScreen = () => {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadReceipts = async () => {
    try {
      const response = await listReceipts(50, 0);
      setReceipts(response.receipts);
    } catch (error) {
      console.error('Erro ao carregar receipts:', error);
      // Em caso de erro, manter lista vazia
      setReceipts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  // Recarregar quando a tela receber foco (após voltar de outras telas)
  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const handleOpenScanner = () => {
    navigation.navigate('Scanner' as never);
  };

  const handleReceiptPress = (receiptId: string) => {
    navigation.navigate('ReceiptDetail' as never, { receiptId } as never);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Compras</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Compras</Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleOpenScanner}
      >
        <Text style={styles.scanButtonText}>Escanear Nota</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {receipts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma nota cadastrada</Text>
            <Text style={styles.emptySubtext}>
              Escaneie uma nota fiscal para começar
            </Text>
          </View>
        ) : (
          receipts.map((receipt) => (
            <TouchableOpacity
              key={receipt.id}
              style={styles.receiptCard}
              onPress={() => handleReceiptPress(receipt.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.storeName}>
                  {receipt.store_name || 'Loja não identificada'}
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(receipt.total_value)}
                </Text>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.dateText}>
                  {formatDate(receipt.emitted_at || receipt.created_at)}
                </Text>
                {receipt.total_tax > 0 && (
                  <View style={styles.taxIndicator}>
                    <Text style={styles.taxText}>
                      Impostos: {formatCurrency(receipt.total_tax)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#34C759',
    margin: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  taxIndicator: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  taxText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
});
