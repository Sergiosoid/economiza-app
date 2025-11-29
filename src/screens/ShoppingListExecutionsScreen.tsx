/**
 * Tela de Histórico de Execuções
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { ExecutionResponse } from '../types/shoppingList';

const ShoppingListExecutionsScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { listId } = route.params as { listId: string };
  const { executions, loading, loadExecutions } = useShoppingListStore();

  useEffect(() => {
    loadExecutions(listId);
  }, [listId]);

  const getStatusColor = (differencePercent?: number | null) => {
    if (differencePercent === null || differencePercent === undefined) return colors.textSecondary;
    const absPercent = Math.abs(differencePercent);
    if (absPercent < 3) return '#4CAF50'; // Verde
    if (absPercent < 10) return '#FFC107'; // Amarelo
    return '#F44336'; // Vermelho
  };

  const getStatusText = (differencePercent?: number | null) => {
    if (differencePercent === null || differencePercent === undefined) return 'N/A';
    const absPercent = Math.abs(differencePercent);
    if (absPercent < 3) return 'OK';
    if (absPercent < 10) return 'Atenção';
    return 'Alerta';
  };

  const handleExecutionPress = (execution: ExecutionResponse) => {
    (navigation as any).navigate('ExecutionReport', { executionId: execution.execution_id });
  };

  const renderItem = ({ item }: { item: ExecutionResponse }) => {
    const statusColor = getStatusColor(item.difference_percent);
    const statusText = getStatusText(item.difference_percent);

    return (
      <TouchableOpacity
        style={[styles.executionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleExecutionPress(item)}
      >
        <View style={styles.executionHeader}>
          <Text style={[styles.executionDate, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleString('pt-BR')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.executionDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Planejado:</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              R$ {item.planned_total?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Real:</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              R$ {item.real_total?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          {item.difference_percent !== null && item.difference_percent !== undefined && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Diferença:</Text>
              <Text style={[styles.detailValue, { color: statusColor }]}>
                {item.difference_percent > 0 ? '+' : ''}
                {item.difference_percent.toFixed(2)}%
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Histórico de Execuções</Text>

      <FlatList
        data={executions}
        renderItem={renderItem}
        keyExtractor={(item) => item.execution_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma execução encontrada
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  list: {
    padding: 16,
  },
  executionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  executionDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  executionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ShoppingListExecutionsScreen;

