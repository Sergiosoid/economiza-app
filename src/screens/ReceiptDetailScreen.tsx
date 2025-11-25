import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getApi } from '../config/api';
import { DEV_TOKEN } from '../config/settings';
import { ReceiptDetailResponse } from '../types/api';

type ReceiptDetailRouteProp = RouteProp<{ ReceiptDetail: { receiptId: string } }, 'ReceiptDetail'>;

export const ReceiptDetailScreen = () => {
  const route = useRoute<ReceiptDetailRouteProp>();
  const { receiptId } = route.params;
  const [receipt, setReceipt] = useState<ReceiptDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [receiptId]);

  const loadReceipt = async () => {
    try {
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
    } catch (error: any) {
      console.error('Erro ao carregar receipt:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da nota fiscal.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nota fiscal não encontrada</Text>
      </View>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Card Principal - Supermercado e Totais */}
      <View style={styles.mainCard}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>
            {receipt.store_name || 'Loja não identificada'}
          </Text>
          {receipt.store_cnpj && (
            <Text style={styles.cnpj}>CNPJ: {receipt.store_cnpj}</Text>
          )}
        </View>
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(receipt.total_value)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.taxLabel}>Impostos:</Text>
            <Text style={styles.taxValue}>
              {formatCurrency(receipt.total_tax)}
            </Text>
          </View>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Data e Hora:</Text>
          <Text style={styles.dateValue}>{formatDate(receipt.emitted_at)}</Text>
        </View>
      </View>

      {/* Card de Informações */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chave de Acesso:</Text>
          <Text style={styles.infoValue}>{receipt.access_key}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data de Cadastro:</Text>
          <Text style={styles.infoValue}>{formatDate(receipt.created_at)}</Text>
        </View>
      </View>

      {/* Card de Itens */}
      <View style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Itens ({receipt.items.length})</Text>
        {receipt.items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.item,
              index === receipt.items.length - 1 && styles.itemLast,
            ]}
          >
            <Text style={styles.itemDescription}>{item.description}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQuantity}>
                {item.quantity} x {formatCurrency(item.unit_price)}
              </Text>
              <Text style={styles.itemTotal}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
            {item.tax_value > 0 && (
              <Text style={styles.itemTax}>
                Impostos: {formatCurrency(item.tax_value)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cnpj: {
    fontSize: 14,
    color: '#666',
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  taxLabel: {
    fontSize: 14,
    color: '#666',
  },
  taxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  dateSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  itemsCard: {
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
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  itemTax: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

