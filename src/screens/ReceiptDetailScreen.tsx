import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { getReceiptDetail } from '../services/api';
import { ReceiptDetailResponse } from '../types/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { RootStackParamList } from '../navigation/types';

type ReceiptDetailRouteProp = RouteProp<{ ReceiptDetail: { receiptId: string } }, 'ReceiptDetail'>;
type ReceiptDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReceiptDetail'>;

export const ReceiptDetailScreen = () => {
  const { colors } = useTheme();
  const route = useRoute<ReceiptDetailRouteProp>();
  const navigation = useNavigation<ReceiptDetailNavigationProp>();
  const { receiptId } = route.params;
  const [receipt, setReceipt] = useState<ReceiptDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const handleOpenEmpacotador = () => {
    navigation.navigate('Empacotador', { receiptId });
  };

  useEffect(() => {
    loadReceipt();
  }, [receiptId]);

  const loadReceipt = async () => {
    try {
      const receiptData = await getReceiptDetail(receiptId);
      setReceipt(receiptData);
    } catch (error: any) {
      console.error('Erro ao carregar receipt:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.detail || 'Não foi possível carregar os detalhes da nota fiscal.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Nota fiscal não encontrada</Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 90,
        }}
      >
      {/* Card Principal - Supermercado e Totais */}
      <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.storeHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.storeName, { color: colors.textPrimary }]}>
            {receipt.store_name || 'Loja não identificada'}
          </Text>
          {receipt.store_cnpj && (
            <Text style={[styles.cnpj, { color: colors.textSecondary }]}>CNPJ: {receipt.store_cnpj}</Text>
          )}
        </View>
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Subtotal:</Text>
            <Text style={[styles.subtotalValue, { color: colors.textPrimary }]}>
              {formatCurrency(receipt.subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>Impostos:</Text>
            <Text style={[styles.taxValue, { color: colors.warning }]}>
              {formatCurrency(receipt.total_tax)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(receipt.total_value)}
            </Text>
          </View>
        </View>

        <View style={[styles.dateSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Data e Hora:</Text>
          <Text style={[styles.dateValue, { color: colors.textPrimary }]}>{formatDate(receipt.emitted_at, true)}</Text>
        </View>
      </View>

      {/* Card de Informações */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Informações</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Chave de Acesso:</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{receipt.access_key}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Data de Cadastro:</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatDate(receipt.created_at, true)}</Text>
        </View>
      </View>

      {/* Botão Modo Empacotador (Interno) */}
      <View style={styles.empacotadorCard}>
        <TouchableOpacity 
          style={[styles.empacotadorButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenEmpacotador}
        >
          <Text style={[styles.empacotadorButtonText, { color: colors.textOnPrimary }]}>📦 Modo Empacotador</Text>
          <Text style={[styles.empacotadorButtonSubtext, { color: colors.textOnPrimary }]}>Corrigir classificação dos itens</Text>
        </TouchableOpacity>
      </View>

      {/* Card de Itens */}
      <View style={[styles.itemsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Itens ({receipt.items.length})</Text>
        {receipt.items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.item,
              { borderBottomColor: colors.border },
              index === receipt.items.length - 1 && styles.itemLast,
            ]}
          >
            <Text style={[styles.itemDescription, { color: colors.textPrimary }]}>{item.description}</Text>
            <View style={styles.itemDetails}>
              <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                {item.quantity} x {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
            {item.tax_value > 0 && (
              <Text style={[styles.itemTax, { color: colors.textSecondary }]}>
                Impostos: {formatCurrency(item.tax_value)}
              </Text>
            )}
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainCard: {
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
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cnpj: {
    fontSize: 14,
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
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  taxLabel: {
    fontSize: 14,
  },
  taxValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateSection: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  itemsCard: {
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
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemTax: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  empacotadorCard: {
    margin: 16,
    marginTop: 0,
  },
  empacotadorButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  empacotadorButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  empacotadorButtonSubtext: {
    fontSize: 14,
    opacity: 0.9,
  },
});

