import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/formatters';

interface HeroCardProps {
  total: number;
  variation?: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({ total, variation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Total do Mês</Text>
      <Text style={[styles.total, { color: colors.textPrimary }]}>
        {formatCurrency(total)}
      </Text>
      {variation !== undefined && (
        <Text style={[
          styles.variation,
          { color: variation >= 0 ? colors.success : colors.error }
        ]}>
          {variation >= 0 ? '+' : ''}{variation.toFixed(1)}% vs mês anterior
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  total: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variation: {
    fontSize: 14,
    fontWeight: '600',
  },
});

