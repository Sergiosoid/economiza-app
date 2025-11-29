/**
 * Tela de Seleção de Nota Fiscal para Sincronização
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { listReceipts } from '../services/api';
import { ReceiptListItem } from '../types/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const SelectReceiptScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { listId } = route.params as { listId: string };
  
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const response = await listReceipts(50, 0);
      setReceipts(response.receipts || []);
    } catch (error: any) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSelectReceipt = (receipt: ReceiptListItem) => {
    navigation.navigate('ShoppingListDetails' as never, { 
      listId,
      receiptId: receipt.id,
      syncReceipt: true,
    } as never);
  };

  const renderItem = ({ item }: { item: ReceiptListItem }) => (
    <TouchableOpacity
      style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleSelectReceipt(item)}
    >
      <View style={styles.receiptHeader}>
        <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.store_name || 'Loja não identificada'}
        </Text>
        <Text style={[styles.receiptDate, { color: colors.textSecondary }]}>
          {formatDate(item.emitted_at)}
        </Text>
      </View>
      <View style={styles.receiptFooter}>
        <Text style={[styles.receiptTotal, { color: colors.primary }]}>
          {formatCurrency(item.total_value)}
        </Text>
        <Text style={[styles.receiptItems, { color: colors.textSecondary }]}>
          {item.items_count || 0} {item.items_count === 1 ? 'item' : 'itens'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Selecione uma Nota Fiscal
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escolha a nota para sincronizar com a lista
        </Text>
      </View>

      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadReceipts} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma nota fiscal encontrada
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
  list: {
    padding: 16,
  },
  receiptCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  receiptHeader: {
    marginBottom: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  receiptItems: {
    fontSize: 14,
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

export default SelectReceiptScreen;

