import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getCredits, CreditsResponse } from '../services/api';

interface CreditsBarProps {
  onPress?: () => void;
}

export const CreditsBar: React.FC<CreditsBarProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getCredits();
      setCredits(data);
    } catch (error) {
      console.error('[CreditsBar] Erro ao carregar créditos:', error);
      setCredits({ credits: 0, credits_purchased: 0, credits_used: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const creditsCount = credits?.credits || 0;
  const isLow = creditsCount < 5;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isLow ? colors.warning : colors.surface },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Créditos:
        </Text>
        <Text
          style={[
            styles.credits,
            {
              color: isLow ? colors.error : colors.primary,
              fontWeight: 'bold',
            },
          ]}
        >
          {creditsCount}
        </Text>
        {isLow && (
          <Text style={[styles.warning, { color: colors.error }]}>
            {' '}
            • Baixo
          </Text>
        )}
      </View>
      {onPress && (
        <Text style={[styles.buyText, { color: colors.primary }]}>
          Comprar →
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginRight: 8,
  },
  credits: {
    fontSize: 18,
  },
  warning: {
    fontSize: 12,
    marginLeft: 4,
  },
  buyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

