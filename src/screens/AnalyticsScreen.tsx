import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getMonthlySummary } from '../services/api';
import { MonthlySummaryResponse } from '../types/api';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { AppBar } from '../components/AppBar';

const AnalyticsScreen = () => {
  const { colors } = useTheme();
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


  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="ANALYTICS" />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={40} color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="ANALYTICS" />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Erro ao carregar dados</Text>
        </View>
      </View>
    );
  }

  const totalImpostos = Object.values(summary.total_por_categoria).reduce(
    (acc, val) => acc + val,
    0
  ) * 0.1; // Estimativa de 10% de impostos

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="ANALYTICS" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Resumo Mensal</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{formatMonth(summary.month)}</Text>
      </View>

      {/* Card Principal - Totais */}
      <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Gasto</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(summary.total_mes)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Impostos</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatCurrency(summary.total_mes * 0.1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Compras</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {summary.top_10_itens.reduce((acc, item) => acc + item.purchase_count, 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Card de Variação */}
      {summary.variacao_vs_mes_anterior !== 0 && (
        <View style={[styles.variationCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Variação vs Mês Anterior</Text>
          <Text
            style={[
              styles.variationValue,
              { color: summary.variacao_vs_mes_anterior > 0 ? colors.success : colors.error },
            ]}
          >
            {summary.variacao_vs_mes_anterior > 0 ? '+' : ''}
            {summary.variacao_vs_mes_anterior.toFixed(2)}%
          </Text>
        </View>
      )}

      {/* Card de Economia Estimada (Placeholder) */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Economia Estimada</Text>
        <Text style={[styles.economyValue, { color: colors.success }]}>
          {formatCurrency(summary.total_mes * 0.05)}
        </Text>
        <Text style={[styles.economyNote, { color: colors.textSecondary }]}>
          Baseado em comparações de preços
        </Text>
      </View>

      {/* Card de Categorias */}
      {Object.keys(summary.total_por_categoria).length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Gastos por Categoria</Text>
          {Object.entries(summary.total_por_categoria).map(([category, total]) => (
            <View key={category} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category}</Text>
              <Text style={[styles.categoryValue, { color: colors.textPrimary }]}>{formatCurrency(total)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card de Top Itens */}
      {summary.top_10_itens.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Top 10 Itens</Text>
          {summary.top_10_itens.map((item, index) => (
            <View key={index} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.description}</Text>
                <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
                  {item.total_quantity.toFixed(2)} unidades • {item.purchase_count} compras
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                {formatCurrency(item.total_spent)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Placeholder para Gráfico */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Gráfico de Gastos</Text>
        <View style={[styles.chartPlaceholder, { backgroundColor: colors.background }]}>
          <Text style={[styles.chartPlaceholderText, { color: colors.textSecondary }]}>
            Gráfico será implementado com VictoryNative
          </Text>
        </View>
      </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  mainCard: {
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
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
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
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  variationCard: {
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
  },
  variationValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
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
    marginBottom: 16,
  },
  economyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  economyNote: {
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default AnalyticsScreen;

