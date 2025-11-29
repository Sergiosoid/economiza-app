/**
 * HomeScreen - Dashboard Moderno do Economiza
 * 
 * Exibe:
 * - HeroCard: Total mensal + variação
 * - MiniChart: Gráfico de gastos
 * - Lista horizontal de Categorias
 * - Últimas 5 compras usando ReceiptCard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { listReceipts, getMonthlySummary } from '../services/api';
import { ReceiptListItem } from '../types/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HeroCard } from '../components/HeroCard';
import { MiniChart } from '../components/MiniChart';
import { ReceiptCard } from '../components/ReceiptCard';
import { AppBar } from '../components/AppBar';
import { CreditsBar } from '../components/CreditsBar';

// Mapeamento de palavras-chave para categorias
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': ['arroz', 'feijão', 'açúcar', 'macarrão', 'farinha', 'óleo', 'sal', 'pão', 'leite', 'ovo', 'carne', 'frango', 'peixe', 'queijo', 'manteiga', 'iogurte', 'fruta', 'verdura', 'legume'],
  'Limpeza': ['sabão', 'detergente', 'esponja', 'água sanitária', 'desinfetante', 'limpa vidros', 'lustra móveis', 'saco de lixo', 'papel toalha', 'alvejante'],
  'Higiene': ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova', 'papel higiênico', 'absorvente', 'desodorante', 'perfume'],
  'Bebidas': ['refrigerante', 'suco', 'água', 'cerveja', 'vinho', 'café', 'chá', 'energético'],
  'Outros': [],
};

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [monthlyVariation, setMonthlyVariation] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState([
    { name: 'Alimentação', icon: '🍔', amount: 0 },
    { name: 'Limpeza', icon: '🧹', amount: 0 },
    { name: 'Higiene', icon: '🧴', amount: 0 },
    { name: 'Bebidas', icon: '🥤', amount: 0 },
    { name: 'Outros', icon: '📦', amount: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função para categorizar item baseado na descrição
  const categorizeItem = (description: string): string => {
    const descLower = description.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => descLower.includes(keyword))) {
        return category;
      }
    }
    return 'Outros';
  };

  const loadData = async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11, backend espera 1-12

      // Buscar resumo mensal do backend
      try {
        const monthlySummary = await getMonthlySummary(currentYear, currentMonth, true);
        setMonthlyTotal(monthlySummary.total_mes);
        setMonthlyVariation(monthlySummary.variacao_vs_mes_anterior);

        // Calcular categorias a partir do total_por_categoria
        const categoryMap = new Map<string, number>();
        Object.entries(monthlySummary.total_por_categoria).forEach(([cat, amount]) => {
          categoryMap.set(cat, amount);
        });

        setCategories([
          { name: 'Alimentação', icon: '🍔', amount: categoryMap.get('Alimentação') || 0 },
          { name: 'Limpeza', icon: '🧹', amount: categoryMap.get('Limpeza') || 0 },
          { name: 'Higiene', icon: '🧴', amount: categoryMap.get('Higiene') || 0 },
          { name: 'Bebidas', icon: '🥤', amount: categoryMap.get('Bebidas') || 0 },
          { name: 'Outros', icon: '📦', amount: categoryMap.get('Outros') || 0 },
        ]);
      } catch (error) {
        console.warn('[HomeScreen] Erro ao buscar resumo mensal, calculando localmente:', error);
        // Fallback: calcular localmente se o backend falhar
        const response = await listReceipts(100, 0);
        const allReceipts = response.receipts;

        const monthlyReceipts = allReceipts.filter((receipt) => {
          const receiptDate = receipt.emitted_at 
            ? new Date(receipt.emitted_at) 
            : receipt.created_at 
            ? new Date(receipt.created_at)
            : null;
          
          if (!receiptDate) return false;
          
          return (
            receiptDate.getFullYear() === currentYear &&
            receiptDate.getMonth() + 1 === currentMonth
          );
        });

        const total = monthlyReceipts.reduce((sum, receipt) => sum + receipt.total_value, 0);
        setMonthlyTotal(total);

        // Calcular categorias a partir dos itens
        const categoryAmounts = new Map<string, number>();
        monthlyReceipts.forEach(receipt => {
          receipt.items.forEach(item => {
            const category = categorizeItem(item.description);
            const current = categoryAmounts.get(category) || 0;
            categoryAmounts.set(category, current + item.total_price);
          });
        });

        setCategories([
          { name: 'Alimentação', icon: '🍔', amount: categoryAmounts.get('Alimentação') || 0 },
          { name: 'Limpeza', icon: '🧹', amount: categoryAmounts.get('Limpeza') || 0 },
          { name: 'Higiene', icon: '🧴', amount: categoryAmounts.get('Higiene') || 0 },
          { name: 'Bebidas', icon: '🥤', amount: categoryAmounts.get('Bebidas') || 0 },
          { name: 'Outros', icon: '📦', amount: categoryAmounts.get('Outros') || 0 },
        ]);
      }

      // Buscar últimas 5 notas para exibir
      const response = await listReceipts(5, 0);
      const last5Receipts = response.receipts
        .sort((a, b) => {
          const dateA = a.emitted_at || a.created_at || '';
          const dateB = b.emitted_at || b.created_at || '';
          return dateB.localeCompare(dateA);
        });

      setReceipts(last5Receipts);
    } catch (error) {
      console.error('[HomeScreen] Erro ao carregar dados:', error);
      setReceipts([]);
      setMonthlyTotal(0);
      setMonthlyVariation(undefined);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleReceiptPress = (receiptId: string) => {
    navigation.navigate('ReceiptDetail', { receiptId });
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="HOME" />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={40} color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="HOME" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 180,
        }}
        contentInset={{ bottom: 140 }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
      {/* CreditsBar */}
      <CreditsBar onPress={() => navigation.navigate('Settings' as never)} />

      {/* HeroCard */}
      <HeroCard total={monthlyTotal} variation={monthlyVariation} />

      {/* MiniChart */}
      <MiniChart title="Gastos por Semana" />

      {/* Lista Horizontal de Categorias */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categorias</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.categoryAmount, { color: colors.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Últimas Compras */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Últimas Compras</Text>
        {receipts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma compra registrada ainda
            </Text>
          </View>
        ) : (
          receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              storeName={receipt.store_name || 'Loja não identificada'}
              date={receipt.emitted_at || receipt.created_at || ''}
              total={receipt.total_value}
              onPress={() => handleReceiptPress(receipt.id)}
            />
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  categoryCard: {
    width: 120,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    flexWrap: 'nowrap',
    maxWidth: 100,
    includeFontPadding: false,
    lineHeight: 16,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
