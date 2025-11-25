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
import { getStoreComparison } from '../services/api';
import { StoreComparisonResponse } from '../types/api';

export const CompareStoresScreen = () => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comparar Preços</Text>
        <Text style={styles.subtitle}>
          Compare preços de um produto em diferentes supermercados
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>ID do Produto</Text>
        <TextInput
          style={styles.input}
          value={productId}
          onChangeText={setProductId}
          placeholder="Digite o ID do produto"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.buttonDisabled]}
          onPress={handleCompare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Comparar</Text>
          )}
        </TouchableOpacity>
      </View>

      {comparison && (
        <>
          {/* Card Principal - Produto e Menor Preço */}
          <View style={styles.mainCard}>
            <Text style={styles.productName}>{comparison.product_name}</Text>
            {comparison.menor_preco_encontrado !== null && (
              <>
                <View style={styles.bestPriceSection}>
                  <Text style={styles.bestPriceLabel}>Menor Preço Encontrado</Text>
                  <Text style={styles.bestPriceValue}>
                    {formatCurrency(comparison.menor_preco_encontrado)}
                  </Text>
                  {comparison.loja_menor_preco && (
                    <Text style={styles.bestPriceStore}>
                      em {comparison.loja_menor_preco}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Lista de Supermercados */}
          {comparison.preco_medio_por_supermercado.length > 0 ? (
            <View style={styles.storesCard}>
              <Text style={styles.cardTitle}>
                Preços por Supermercado ({comparison.total_comparacoes})
              </Text>
              {comparison.preco_medio_por_supermercado.map((store, index) => (
                <View
                  key={index}
                  style={[
                    styles.storeRow,
                    index === comparison.preco_medio_por_supermercado.length - 1 &&
                      styles.storeRowLast,
                  ]}
                >
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.store_name}</Text>
                    <Text style={styles.storeDetails}>
                      {store.purchase_count} compras • Mín: {formatCurrency(store.min_price)} • Máx:{' '}
                      {formatCurrency(store.max_price)}
                    </Text>
                  </View>
                  <View style={styles.storePrice}>
                    <Text style={styles.storePriceLabel}>Média</Text>
                    <Text style={styles.storePriceValue}>
                      {formatCurrency(store.avg_price)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Nenhuma comparação disponível para este produto
              </Text>
            </View>
          )}

          {/* Card de Economia Estimada */}
          {comparison.preco_medio_por_supermercado.length > 1 &&
            comparison.menor_preco_encontrado !== null && (
              <View style={styles.economyCard}>
                <Text style={styles.economyTitle}>Economia Estimada</Text>
                <Text style={styles.economyValue}>
                  {formatCurrency(
                    (comparison.preco_medio_por_supermercado[0]?.avg_price || 0) -
                      (comparison.menor_preco_encontrado || 0)
                  )}
                </Text>
                <Text style={styles.economyNote}>
                  Diferença entre maior e menor preço médio
                </Text>
              </View>
            )}
        </>
      )}

      {!comparison && !loading && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Digite o ID de um produto e clique em "Comparar" para ver os preços em diferentes
            supermercados
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 14,
    color: '#666',
  },
  searchCard: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 20,
  },
  bestPriceSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bestPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bestPriceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  bestPriceStore: {
    fontSize: 14,
    color: '#666',
  },
  storesCard: {
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
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 4,
  },
  storeDetails: {
    fontSize: 12,
    color: '#666',
  },
  storePrice: {
    alignItems: 'flex-end',
  },
  storePriceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  storePriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  economyCard: {
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
    alignItems: 'center',
  },
  economyTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  economyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  economyNote: {
    fontSize: 12,
    color: '#999',
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

