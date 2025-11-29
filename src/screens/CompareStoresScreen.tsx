import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getStoreComparison } from '../services/api';
import { StoreComparisonResponse } from '../types/api';
import { formatCurrency } from '../utils/formatters';

export const CompareStoresScreen = () => {
  const { colors } = useTheme();
  const [productId, setProductId] = useState('');
  const [comparison, setComparison] = useState<StoreComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!productId.trim()) {
      Alert.alert('Erro', 'Por favor, informe o ID do produto');
      return;
    }

    setLoading(true);
    try {
      const data = await getStoreComparison(productId.trim());
      setComparison(data);
    } catch (error: any) {
      console.error('Erro ao comparar preços:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível comparar preços. Verifique se o produto existe.'
      );
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 90,
        }}
      >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Comparar Preços</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Compare preços de um produto em diferentes supermercados
        </Text>
      </View>

      <View style={[styles.searchCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.searchLabel, { color: colors.textPrimary }]}>ID do Produto</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={productId}
          onChangeText={setProductId}
          placeholder="Digite o ID do produto"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleCompare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.searchButtonText, { color: colors.textOnPrimary }]}>Comparar</Text>
          )}
        </TouchableOpacity>
      </View>

      {comparison && (
        <>
          {/* Card Principal - Produto e Menor Preço */}
          <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.productName, { color: colors.textPrimary }]}>{comparison.product_name}</Text>
            {comparison.menor_preco_encontrado !== null && (
              <>
                <View style={[styles.bestPriceSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.bestPriceLabel, { color: colors.textSecondary }]}>Menor Preço Encontrado</Text>
                  <Text style={[styles.bestPriceValue, { color: colors.success }]}>
                    {formatCurrency(comparison.menor_preco_encontrado)}
                  </Text>
                  {comparison.loja_menor_preco && (
                    <Text style={[styles.bestPriceStore, { color: colors.textSecondary }]}>
                      em {comparison.loja_menor_preco}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Lista de Supermercados */}
          {comparison.preco_medio_por_supermercado.length > 0 ? (
            <View style={[styles.storesCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Preços por Supermercado ({comparison.total_comparacoes})
              </Text>
              {comparison.preco_medio_por_supermercado.map((store, index) => (
                <View
                  key={index}
                  style={[
                    styles.storeRow,
                    { borderBottomColor: colors.border },
                    index === comparison.preco_medio_por_supermercado.length - 1 &&
                      styles.storeRowLast,
                  ]}
                >
                  <View style={styles.storeInfo}>
                    <Text style={[styles.storeName, { color: colors.textPrimary }]}>{store.store_name}</Text>
                    <Text style={[styles.storeDetails, { color: colors.textSecondary }]}>
                      {store.purchase_count} compras • Mín: {formatCurrency(store.min_price)} • Máx:{' '}
                      {formatCurrency(store.max_price)}
                    </Text>
                  </View>
                  <View style={styles.storePrice}>
                    <Text style={[styles.storePriceLabel, { color: colors.textSecondary }]}>Média</Text>
                    <Text style={[styles.storePriceValue, { color: colors.primary }]}>
                      {formatCurrency(store.avg_price)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhuma comparação disponível para este produto
              </Text>
            </View>
          )}

          {/* Card de Economia Estimada */}
          {comparison.preco_medio_por_supermercado.length > 1 &&
            comparison.menor_preco_encontrado !== null && (
              <View style={[styles.economyCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.economyTitle, { color: colors.textSecondary }]}>Economia Estimada</Text>
                <Text style={[styles.economyValue, { color: colors.success }]}>
                  {formatCurrency(
                    (comparison.preco_medio_por_supermercado[0]?.avg_price || 0) -
                      (comparison.menor_preco_encontrado || 0)
                  )}
                </Text>
                <Text style={[styles.economyNote, { color: colors.textSecondary }]}>
                  Diferença entre maior e menor preço médio
                </Text>
              </View>
            )}
        </>
      )}

      {!comparison && !loading && (
        <View style={[styles.placeholderCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Digite o ID de um produto e clique em "Comparar" para ver os preços em diferentes
            supermercados
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  searchButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bestPriceSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  bestPriceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  bestPriceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bestPriceStore: {
    fontSize: 14,
  },
  storesCard: {
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
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  storeRowLast: {
    borderBottomWidth: 0,
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeDetails: {
    fontSize: 12,
  },
  storePrice: {
    alignItems: 'flex-end',
  },
  storePriceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  storePriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  economyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  economyTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  economyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  economyNote: {
    fontSize: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderCard: {
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

