import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listReceipts, getMonthlySummary } from '../services/api';
import { ReceiptListItem, MonthlySummaryResponse } from '../types/api';
import { ScreenContainer, Button, Card, Typography, Loading } from '../components';
import { useTheme } from '../theme/ThemeContext';

export const HomeScreen = () => {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const loadReceipts = async () => {
    try {
      const response = await listReceipts(50, 0);
      setReceipts(response.receipts);
    } catch (error) {
      console.error('Erro ao carregar receipts:', error);
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
      setMonthlySummary(null);
    }
  };

  useEffect(() => {
    loadReceipts();
    loadMonthlySummary();
  }, []);

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

  const handleOpenScanner = () => {
    navigation.navigate('Scanner' as never);
  };

  const handleReceiptPress = (receiptId: string) => {
    navigation.navigate('ReceiptDetail' as never, { receiptId } as never);
  };

  const handleOpenAnalytics = () => {
    navigation.navigate('Analytics' as never);
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
      <ScreenContainer>
        <Loading message="Carregando suas compras..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Typography variant="h1">Minhas Compras</Typography>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Escanear Nota"
          onPress={handleOpenScanner}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>

      {/* Card de Resumo Mensal */}
      {monthlySummary && (
        <Card variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Typography variant="h4">Resumo do Mês</Typography>
            <Button
              title="Ver Detalhes"
              onPress={handleOpenAnalytics}
              variant="ghost"
              size="small"
            />
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Typography variant="caption" color="secondary">Total Gasto</Typography>
              <Typography variant="h3" style={{ color: colors.primary }}>
                {formatCurrency(monthlySummary.total_mes)}
              </Typography>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.summaryItem}>
              <Typography variant="caption" color="secondary">Impostos</Typography>
              <Typography variant="h4">
                {formatCurrency(monthlySummary.total_mes * 0.1)}
              </Typography>
            </View>
          </View>
          <View style={[styles.miniChart, { backgroundColor: colors.surfaceVariant }]}>
            <Typography variant="caption" color="tertiary">
              📊 Gráfico de gastos (em desenvolvimento)
            </Typography>
          </View>
        </Card>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="📊 Resumo de Gastos"
          onPress={handleOpenAnalytics}
          variant="secondary"
          fullWidth
        />
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {receipts.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Typography variant="h4" style={styles.emptyText}>
              Nenhuma nota cadastrada
            </Typography>
            <Typography variant="body2" color="secondary" style={styles.emptySubtext}>
              Escaneie uma nota fiscal para começar
            </Typography>
          </Card>
        ) : (
          receipts.map((receipt) => (
            <Card
              key={receipt.id}
              variant="elevated"
              style={styles.receiptCard}
            >
              <View style={styles.cardHeader}>
                <Typography variant="h4" style={styles.storeName}>
                  {receipt.store_name || 'Loja não identificada'}
                </Typography>
                <Typography variant="h3" style={{ color: colors.primary }}>
                  {formatCurrency(receipt.total_value)}
                </Typography>
              </View>
              <View style={styles.cardDetails}>
                <Typography variant="body2" color="secondary">
                  {formatDate(receipt.emitted_at || receipt.created_at)}
                </Typography>
                {receipt.total_tax > 0 && (
                  <View style={[styles.taxIndicator, { backgroundColor: colors.surfaceVariant }]}>
                    <Typography variant="caption" color="secondary">
                      Impostos: {formatCurrency(receipt.total_tax)}
                    </Typography>
                  </View>
                )}
              </View>
              <Button
                title="Ver Detalhes"
                onPress={() => handleReceiptPress(receipt.id)}
                variant="outline"
                size="small"
                style={styles.detailsButton}
              />
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  miniChart: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  receiptCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeName: {
    flex: 1,
    marginRight: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailsButton: {
    marginTop: 8,
  },
});
