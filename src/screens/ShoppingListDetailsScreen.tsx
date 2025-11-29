/**
 * Tela de Detalhes de Lista de Compras
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { estimateList, syncListWithReceipt } from '../services/shoppingListsApi';
import { ShoppingListItemResponse } from '../types/shoppingList';

const ShoppingListDetailsScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { listId } = route.params as { listId: string };
  const { activeList, loading, loadList } = useShoppingListStore();
  const [estimating, setEstimating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadList(listId);
  }, [listId]);

  // Verificar se há sincronização pendente
  useFocusEffect(
    React.useCallback(() => {
      const { receiptId, syncReceipt } = (route.params as any) || {};
      if (syncReceipt && receiptId) {
        handleSyncWithReceipt(receiptId);
      }
    }, [route.params])
  );

  const handleSyncWithReceipt = async (receiptId: string) => {
    setSyncing(true);
    try {
      const result = await syncListWithReceipt(listId, receiptId);
      // Recarregar lista após sincronização
      await loadList(listId);
      navigation.navigate('ExecutionReport' as never, { executionId: result.execution_id } as never);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleEstimate = async () => {
    setEstimating(true);
    try {
      const estimate = await estimateList(listId);
      Alert.alert(
        'Estimativa',
        `Total estimado: R$ ${estimate.total_estimate?.toFixed(2) || 'N/A'}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao estimar custo');
    } finally {
      setEstimating(false);
    }
  };

  const handleSync = async () => {
    navigation.navigate('SelectReceipt' as never, { listId } as never);
  };

  const handleViewHistory = () => {
    navigation.navigate('ShoppingListExecutions' as never, { listId } as never);
  };

  const renderItem = ({ item }: { item: ShoppingListItemResponse }) => (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.itemDescription, { color: colors.textPrimary }]}>
        {item.description}
      </Text>
      <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
        {item.quantity} {item.unit_code}
      </Text>
      {item.price_estimate && (
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          R$ {item.price_estimate.toFixed(2)}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activeList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Lista não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{activeList.name}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {activeList.items.length} {activeList.items.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleEstimate}
          disabled={estimating}
        >
          {estimating ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>
              Estimar Custo
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>
              Sincronizar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          onPress={handleViewHistory}
        >
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeList.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ShoppingListDetailsScreen;

