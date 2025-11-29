import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const settingsItems = [
    {
      title: 'Preferência de Tema',
      subtitle: 'Escolher tema claro ou escuro',
      onPress: () => {
        // TODO: Implementar toggle de tema
        console.log('Toggle tema');
      },
    },
    {
      title: 'Sobre',
      subtitle: 'Informações sobre o app',
      onPress: () => {
        // TODO: Navegar para tela de sobre
        console.log('Sobre');
      },
    },
    {
      title: 'Privacidade',
      subtitle: 'Política de privacidade',
      onPress: () => {
        // TODO: Navegar para tela de privacidade
        console.log('Privacidade');
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 90,
        }}
      >
      {settingsItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.item, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          onPress={item.onPress}
        >
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
  },
});

