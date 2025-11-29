import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabParamList } from './types';

// Screens - Todos devem ter export default
import HomeScreen from '../screens/HomeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TopItemsScreen from '../screens/TopItemsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BlankScreen from '../screens/BlankScreen';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';

// Log de verificação para garantir que nenhum componente está undefined
console.log('BOTTOM TABS CHECK', {
  HomeScreen,
  AnalyticsScreen,
  TopItemsScreen,
  ProfileScreen,
  BlankScreen,
  ShoppingListsScreen,
});

const Tab = createBottomTabNavigator<BottomTabParamList>();

// FAB Component - Configurado fora do Navigator
const FAB: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate('Scanner');
  };

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary }]}
      onPress={handlePress}
      accessible={true}
      accessibilityLabel="Escanear nota fiscal"
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      <Ionicons name="camera" size={32} color={colors.textOnPrimary} />
    </TouchableOpacity>
  );
};

export const BottomTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          elevation: 25,
          zIndex: 999,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ShoppingLists"
        component={ShoppingListsScreen}
        options={{
          tabBarLabel: 'Listas',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Scan"
        component={BlankScreen}
        listeners={{
          tabPress: (e: any) => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarButton: () => <FAB />,
          tabBarLabel: '',
        }}
      />

      <Tab.Screen
        name="Products"
        component={TopItemsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
});
