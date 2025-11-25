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
import { listReceipts, getMonthlySummary } from '../services/api';
import { ReceiptListItem, MonthlySummaryResponse } from '../types/api';

export const HomeScreen = () => {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryResponse | null>(null);
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

  const loadMonthlySummary = async () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const summary = await getMonthlySummary(currentYear, currentMonth);
      setMonthlySummary(summary);
    } catch (error) {
      console.error('Erro ao carregar resumo mensal:', error);
      // Em caso de erro, manter null
      setMonthlySummary(null);
    }
  };

  useEffect(() => {
    loadReceipts();
    loadMonthlySummary();
  }, []);

  // Recarregar quando a tela receber foco (após voltar de outras telas)
  useFocusEffect(
    useCallback(() => {
      loadReceipts();
      loadMonthlySummary();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReceipts();
    loadMonthlySummary();
  };

  const handleOpenAnalytics = () => {
    navigation.navigate('Analytics' as never);
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

      {/* Card de Resumo Mensal */}
      {monthlySummary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumo do Mês</Text>
            <TouchableOpacity onPress={handleOpenAnalytics}>
              <Text style={styles.summaryLink}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Gasto</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(monthlySummary.total_mes)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Impostos</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(monthlySummary.total_mes * 0.1)}
              </Text>
            </View>
          </View>
          {/* Mini gráfico placeholder */}
          <View style={styles.miniChart}>
            <Text style={styles.miniChartText}>
              📊 Gráfico de gastos (em desenvolvimento)
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={handleOpenAnalytics}
      >
        <Text style={styles.analyticsButtonText}>📊 Resumo de Gastos</Text>
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
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  miniChart: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  miniChartText: {
    fontSize: 12,
    color: '#999',
  },
  analyticsButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 16,
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
