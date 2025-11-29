/**
 * Tela do Modo Empacotador - Ferramenta interna para treinar a IA
 * Permite corrigir classificação de itens de notas fiscais
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { getApi } from '../config/api';
import { DEV_TOKEN } from '../config/settings';
import { ReceiptDetailResponse, ReceiptItemResponse } from '../types/api';
import { classifyItem } from '../services/ai/classifier';
import type { ProductCategory, ClassifiedItem } from '../services/ai/classifier';
import type { EmpacotadorItem } from '../types/empacotador';
import { saveCorrection, initCorrectionDatabase } from '../services/storage/correctionStorage';
import { updateClassifierKnowledge } from '../services/ai/classifierKnowledge';
import type { RootStackParamList } from '../navigation/types';

type EmpacotadorRouteProp = RouteProp<{ Empacotador: { receiptId: string } }, 'Empacotador'>;
type EmpacotadorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Empacotador'>;

const CATEGORIES: ProductCategory[] = ['Alimentação', 'Limpeza', 'Higiene', 'Bebidas', 'Outros'];

export const EmpacotadorScreen = () => {
  const { colors } = useTheme();
  const route = useRoute<EmpacotadorRouteProp>();
  const navigation = useNavigation<EmpacotadorNavigationProp>();
  const { receiptId } = route.params;

  const [receipt, setReceipt] = useState<ReceiptDetailResponse | null>(null);
  const [items, setItems] = useState<EmpacotadorItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado do item atual sendo editado
  const [currentItem, setCurrentItem] = useState<EmpacotadorItem | null>(null);
  const [editedCategory, setEditedCategory] = useState<ProductCategory>('Outros');
  const [editedBrand, setEditedBrand] = useState<string>('');
  const [editedNormalizedName, setEditedNormalizedName] = useState<string>('');

  useEffect(() => {
    initializeScreen();
  }, [receiptId]);

  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      loadCurrentItem();
    }
  }, [currentIndex, items]);

  const initializeScreen = async () => {
    try {
      // Inicializar banco de dados
      await initCorrectionDatabase();

      // Carregar receipt
      await loadReceipt();
    } catch (error: any) {
      console.error('[EmpacotadorScreen] Erro ao inicializar:', error);
      Alert.alert('Erro', 'Não foi possível inicializar a tela.');
    }
  };

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const apiInstance = getApi();
      const response = await apiInstance.get<ReceiptDetailResponse>(
        `/api/v1/receipts/${receiptId}`,
        {
          headers: {
            Authorization: `Bearer ${DEV_TOKEN}`,
          },
        }
      );

      setReceipt(response.data);

      // Classificar todos os itens
      const classifiedItems: EmpacotadorItem[] = response.data.items.map((item) => {
        const classified = classifyItem({
          name: item.description,
          qty: item.quantity,
          price: item.unit_price,
          tax: item.tax_value,
        });

        return {
          receipt_item_id: item.id,
          original_name: item.description,
          normalized_name: classified.normalizedName,
          category: classified.category,
          brand: classified.brand,
          quantity: item.quantity,
          unit_price: item.unit_price,
        };
      });

      setItems(classifiedItems);
    } catch (error: any) {
      console.error('[EmpacotadorScreen] Erro ao carregar receipt:', error);
      Alert.alert('Erro', 'Não foi possível carregar a nota fiscal.');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentItem = () => {
    if (currentIndex >= items.length) return;

    const item = items[currentIndex];
    setCurrentItem(item);
    setEditedCategory(item.category);
    setEditedBrand(item.brand || '');
    setEditedNormalizedName(item.normalized_name);
  };

  const handleSave = async (goToNext: boolean = false) => {
    if (!currentItem) return;

    try {
      setSaving(true);

      // Criar correção
      const correction = {
        receipt_item_id: currentItem.receipt_item_id,
        original_name: currentItem.original_name,
        original_normalized_name: currentItem.normalized_name,
        original_category: currentItem.category,
        original_brand: currentItem.brand,
        corrected_normalized_name: editedNormalizedName.trim() || currentItem.normalized_name,
        corrected_category: editedCategory,
        corrected_brand: editedBrand.trim() || undefined,
      };

      // Salvar correção no banco local
      await saveCorrection(correction);

      // Atualizar conhecimento do classificador
      await updateClassifierKnowledge(correction);

      console.log('[EmpacotadorScreen] Correção salva:', correction);

      if (goToNext) {
        // Ir para próximo item
        if (currentIndex < items.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          Alert.alert('Concluído', 'Todos os itens foram revisados!');
          navigation.goBack();
        }
      } else {
        Alert.alert('Sucesso', 'Correção salva com sucesso!');
      }
    } catch (error: any) {
      console.error('[EmpacotadorScreen] Erro ao salvar correção:', error);
      Alert.alert('Erro', 'Não foi possível salvar a correção.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Concluído', 'Todos os itens foram revisados!');
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={40} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
      </View>
    );
  }

  if (!receipt || items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Nenhum item encontrado</Text>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Item não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 90 },
        ]}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Modo Empacotador</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Item {currentIndex + 1} de {items.length}
        </Text>
        {receipt.store_name && (
          <Text style={[styles.storeName, { color: colors.textSecondary }]}>{receipt.store_name}</Text>
        )}
      </View>

      {/* Card do Item */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Nome Original</Text>
        <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{currentItem.original_name}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Nome Normalizado (Atual)</Text>
        <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{currentItem.normalized_name}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Categoria (Atual)</Text>
        <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{currentItem.category}</Text>

        {currentItem.brand && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Marca (Atual)</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{currentItem.brand}</Text>
          </>
        )}
      </View>

      {/* Formulário de Edição */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Correções</Text>

        {/* Categoria */}
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Categoria *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                editedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setEditedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: colors.textSecondary },
                  editedCategory === category && { color: colors.textOnPrimary, fontWeight: '600' },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Marca */}
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Marca</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={editedBrand}
          onChangeText={setEditedBrand}
          placeholder="Ex: Coca-Cola, Nestlé..."
          placeholderTextColor={colors.textSecondary}
        />

        {/* Nome Normalizado */}
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Nome Normalizado (opcional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={editedNormalizedName}
          onChangeText={setEditedNormalizedName}
          placeholder="Deixe vazio para usar o atual"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Botões de Navegação */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.surface },
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>← Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.surface },
            currentIndex === items.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === items.length - 1}
        >
          <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>Próximo →</Text>
        </TouchableOpacity>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>Salvar Correção</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSave(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>Salvar e Próximo</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 14,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

