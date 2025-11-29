/**
 * Tela de Lista de Compras
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { ShoppingListResponse } from '../types/shoppingList';
import { AppBar } from '../components/AppBar';

const ShoppingListsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { lists, loading, error, loadLists } = useShoppingListStore();

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreateList = () => {
    navigation.navigate('CreateShoppingList' as never);
  };

  const handleListPress = (list: ShoppingListResponse) => {
    (navigation as any).navigate('ShoppingListDetails', { listId: list.id });
  };

  const renderItem = ({ item }: { item: ShoppingListResponse }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleListPress(item)}
    >
      <Text style={[styles.listName, { color: colors.textPrimary }]}>{item.name}</Text>
      <Text style={[styles.listInfo, { color: colors.textSecondary }]}>
        {item.items.length} {item.items.length === 1 ? 'item' : 'itens'}
      </Text>
      <Text style={[styles.listDate, { color: colors.textSecondary }]}>
        {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </Text>
    </TouchableOpacity>
  );

  if (loading && lists.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar title="LISTAS" />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateList}
        >
          <Text style={[styles.createButtonText, { color: colors.textOnPrimary }]}>+ Nova Lista</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLists} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma lista criada ainda
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateList}
            >
              <Text style={[styles.emptyButtonText, { color: colors.textOnPrimary }]}>
                Criar Primeira Lista
              </Text>
            </TouchableOpacity>
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
    paddingTop: 8,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  listItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  listDate: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShoppingListsScreen;

