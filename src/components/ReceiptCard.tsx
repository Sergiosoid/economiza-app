import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReceiptCardProps {
  storeName: string;
  date: string;
  total: number;
  onPress: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  storeName,
  date,
  total,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.storeName, { color: colors.textPrimary }]}>
          {storeName}
        </Text>
        <Text style={[styles.total, { color: colors.primary }]}>
          {formatCurrency(total)}
        </Text>
      </View>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatDate(date)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
});

