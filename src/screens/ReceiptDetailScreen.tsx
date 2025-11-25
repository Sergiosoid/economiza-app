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
      const api = getApi();
      const response = await api.get<ReceiptDetailResponse>(
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
      <View style={styles.header}>
        <Text style={styles.title}>Nota Fiscal</Text>
        <Text style={styles.storeName}>{receipt.store_name || 'Loja não identificada'}</Text>
        {receipt.store_cnpj && (
          <Text style={styles.cnpj}>CNPJ: {receipt.store_cnpj}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chave de Acesso:</Text>
          <Text style={styles.infoValue}>{receipt.access_key}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data de Emissão:</Text>
          <Text style={styles.infoValue}>{formatDate(receipt.emitted_at)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data de Cadastro:</Text>
          <Text style={styles.infoValue}>{formatDate(receipt.created_at)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Totais</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(receipt.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Impostos:</Text>
          <Text style={styles.totalValue}>{formatCurrency(receipt.total_tax)}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalRowFinal]}>
          <Text style={[styles.totalLabel, styles.totalLabelFinal]}>Total:</Text>
          <Text style={[styles.totalValue, styles.totalValueFinal]}>
            {formatCurrency(receipt.total_value)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itens ({receipt.items.length})</Text>
        {receipt.items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQuantity}>
                {item.quantity} x {formatCurrency(item.unit_price)}
              </Text>
              <Text style={styles.itemTotal}>{formatCurrency(item.total_price)}</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  cnpj: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRowFinal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    marginBottom: 5,
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
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

