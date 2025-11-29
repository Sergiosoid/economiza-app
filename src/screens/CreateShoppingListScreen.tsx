/**
 * Tela de Criação/Edição de Lista de Compras
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { createShoppingList, fetchUnits, fetchShoppingList } from '../services/shoppingListsApi';
import { ShoppingListItemCreate, UnitResponse } from '../types/shoppingList';

interface ListItem {
  id: string;
  description: string;
  quantity: string;
  unit_code: string;
  product_id?: string | null;
}

const CreateShoppingListScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { listId } = (route.params as { listId?: string }) || {};
  const { loadLists } = useShoppingListStore();
  
  const [name, setName] = useState('Minha lista');
  const [items, setItems] = useState<ListItem[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUnits();
    if (listId) {
      loadExistingList();
    }
  }, [listId]);

  const loadUnits = async () => {
    try {
      const unitsData = await fetchUnits();
      setUnits(unitsData);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar unidades');
    }
  };

  const loadExistingList = async () => {
    setLoading(true);
    try {
      const list = await fetchShoppingList(listId!);
      setName(list.name);
      setItems(
        list.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unit_code: item.unit_code,
          product_id: item.product_id,
        }))
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar lista');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: '1',
        unit_code: 'un',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ListItem, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome para a lista');
      return;
    }

    const validItems = items.filter((item) => item.description.trim() && item.quantity);
    if (validItems.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item');
      return;
    }

    setSaving(true);
    try {
      const listData: ShoppingListItemCreate[] = validItems.map((item) => ({
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 1,
        unit_code: item.unit_code,
        product_id: item.product_id || null,
      }));

      await createShoppingList({
        name: name.trim(),
        items: listData,
      });

      await loadLists();
      Alert.alert('Sucesso', 'Lista criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar lista');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: ListItem }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemRow}>
        <TextInput
          style={[styles.itemInput, { color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Descrição do item"
          placeholderTextColor={colors.textSecondary}
          value={item.description}
          onChangeText={(text) => handleUpdateItem(item.id, 'description', text)}
        />
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={[styles.removeButtonText, { color: colors.textOnPrimary }]}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemRow}>
        <TextInput
          style={[styles.quantityInput, { color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Quantidade"
          placeholderTextColor={colors.textSecondary}
          value={item.quantity}
          onChangeText={(text) => handleUpdateItem(item.id, 'quantity', text)}
          keyboardType="numeric"
        />
        <View style={[styles.unitPicker, { borderColor: colors.border }]}>
          {units.map((unit) => (
            <TouchableOpacity
              key={unit.code}
              style={[
                styles.unitOption,
                {
                  backgroundColor: item.unit_code === unit.code ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => handleUpdateItem(item.id, 'unit_code', unit.code)}
            >
              <Text
                style={[
                  styles.unitOptionText,
                  {
                    color: item.unit_code === unit.code ? colors.textOnPrimary : colors.textPrimary,
                  },
                ]}
              >
                {unit.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
        <TextInput
          style={[styles.nameInput, { color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Nome da lista"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddItem}
        >
          <Text style={[styles.addButtonText, { color: colors.textOnPrimary }]}>+ Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum item adicionado. Toque em "Adicionar Item" para começar.
            </Text>
          </View>
        }
      />

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.textOnPrimary }]}>
              {listId ? 'Atualizar Lista' : 'Criar Lista'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  itemInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  unitPicker: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreateShoppingListScreen;

