import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getMonthlySummary } from '../services/api';
import { MonthlySummaryResponse } from '../types/api';

export const AnalyticsScreen = () => {
  const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const loadSummary = async () => {
    try {
      const data = await getMonthlySummary(currentYear, currentMonth);
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo mensal:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSummary();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
      </View>
    );
  }

  const totalImpostos = Object.values(summary.total_por_categoria).reduce(
    (acc, val) => acc + val,
    0
  ) * 0.1; // Estimativa de 10% de impostos

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Resumo Mensal</Text>
        <Text style={styles.subtitle}>{formatMonth(summary.month)}</Text>
      </View>

      {/* Card Principal - Totais */}
      <View style={styles.mainCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Gasto</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(summary.total_mes)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Impostos</Text>
            <Text style={styles.statValue}>
              {formatCurrency(summary.total_mes * 0.1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Compras</Text>
            <Text style={styles.statValue}>
              {summary.top_10_itens.reduce((acc, item) => acc + item.purchase_count, 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Card de Variação */}
      {summary.variacao_vs_mes_anterior !== 0 && (
        <View style={styles.variationCard}>
          <Text style={styles.variationLabel}>Variação vs Mês Anterior</Text>
          <Text
            style={[
              styles.variationValue,
              summary.variacao_vs_mes_anterior > 0
                ? styles.variationPositive
                : styles.variationNegative,
            ]}
          >
            {summary.variacao_vs_mes_anterior > 0 ? '+' : ''}
            {summary.variacao_vs_mes_anterior.toFixed(2)}%
          </Text>
        </View>
      )}

      {/* Card de Economia Estimada (Placeholder) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Economia Estimada</Text>
        <Text style={styles.economyValue}>
          {formatCurrency(summary.total_mes * 0.05)}
        </Text>
        <Text style={styles.economyNote}>
          Baseado em comparações de preços
        </Text>
      </View>

      {/* Card de Categorias */}
      {Object.keys(summary.total_por_categoria).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gastos por Categoria</Text>
          {Object.entries(summary.total_por_categoria).map(([category, total]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryValue}>{formatCurrency(total)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card de Top Itens */}
      {summary.top_10_itens.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top 10 Itens</Text>
          {summary.top_10_itens.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.description}</Text>
                <Text style={styles.itemDetails}>
                  {item.total_quantity.toFixed(2)} unidades • {item.purchase_count} compras
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatCurrency(item.total_spent)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Placeholder para Gráfico */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gráfico de Gastos</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            Gráfico será implementado com VictoryNative
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  mainCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  variationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variationLabel: {
    fontSize: 14,
    color: '#666',
  },
  variationValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  variationPositive: {
    color: '#34C759',
  },
  variationNegative: {
    color: '#FF3B30',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  economyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  economyNote: {
    fontSize: 12,
    color: '#999',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

