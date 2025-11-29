import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getTopItems } from '../services/api';
import { TopItem } from '../types/api';
import { formatCurrency } from '../utils/formatters';
import { AppBar } from '../components/AppBar';

const TopItemsScreen = () => {
  const { colors } = useTheme();
  const [items, setItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      const response = await getTopItems(50);
      setItems(response.items);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const renderItem = ({ item, index }: { item: TopItem; index: number }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.rankText, { color: colors.textOnPrimary }]}>#{index + 1}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.description}</Text>
          <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
            {item.total_quantity.toFixed(2)} unidades • {item.purchase_count} compras
          </Text>
        </View>
      </View>
      <View style={[styles.itemFooter, { borderTopColor: colors.border }]}>
        <View style={styles.priceInfo}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Preço Médio:</Text>
          <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
            {formatCurrency(item.avg_price)}
          </Text>
        </View>
        <View style={styles.totalInfo}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Gasto:</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(item.total_spent)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="PRODUCTS" />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={40} color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="PRODUCTS" />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum item encontrado</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Comece a escanear notas fiscais para ver seus itens mais comprados
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="PRODUCTS" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.description}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      </View>
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
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rankBadge: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TopItemsScreen;

