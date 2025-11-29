import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { Loading } from './src/components/Loading';
import { getToken } from './src/services/auth';
import { supabase } from './src/services/supabase';
import * as SecureStore from 'expo-secure-store';

// Auth Stack Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

// App Screens
import { BottomTabs } from './src/navigation/BottomTabs';
import ScannerScreen from './src/screens/ScannerScreen';
import ReceiptProcessingScreen from './src/screens/ReceiptProcessingScreen';
import { ReceiptDetailScreen } from './src/screens/ReceiptDetailScreen';
import { CompareStoresScreen } from './src/screens/CompareStoresScreen';
import { EmpacotadorScreen } from './src/screens/EmpacotadorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import ShoppingListsScreen from './src/screens/ShoppingListsScreen';
import ShoppingListDetailsScreen from './src/screens/ShoppingListDetailsScreen';
import ShoppingListExecutionsScreen from './src/screens/ShoppingListExecutionsScreen';
import ExecutionReportScreen from './src/screens/ExecutionReportScreen';
import CreateShoppingListScreen from './src/screens/CreateShoppingListScreen';
import SelectReceiptScreen from './src/screens/SelectReceiptScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente LoadingScreen
function LoadingScreen() {
  return <Loading message="Carregando..." />;
}

// Auth Stack Navigator
function AuthStack() {
  const { colors } = useTheme();
  const AuthStackNavigator = createNativeStackNavigator();

  return (
    <AuthStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AuthStackNavigator.Screen name="Login" component={LoginScreen} />
      <AuthStackNavigator.Screen name="Register" component={RegisterScreen} />
    </AuthStackNavigator.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { colors, colorScheme } = useTheme();
  
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Verificar autenticação inicial e monitorar mudanças
  useEffect(() => {
    // Verificar token inicial
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setInitializing(false);
    };

    checkAuth();

    // Listener para mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        await SecureStore.setItemAsync("economiza_token", session.access_token);
        setIsAuthenticated(true);
      } else {
        await SecureStore.deleteItemAsync("economiza_token");
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Renderizar baseado no estado
  if (initializing) {
    return <LoadingScreen />;
  }

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          ...baseTheme,
          colors: {
            ...baseTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen 
                name="BottomTabs" 
                component={BottomTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Scanner" 
                component={ScannerScreen}
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen 
                name="ReceiptProcessing"
                component={ReceiptProcessingScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'PROCESSANDO',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="ReceiptDetail" 
                component={ReceiptDetailScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'DETALHES DA NOTA',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="CompareStores" 
                component={CompareStoresScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'COMPARAR PREÇOS',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="Empacotador" 
                component={EmpacotadorScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'MODO EMPACOTADOR',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'CONFIGURAÇÕES',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="ShoppingLists" 
                component={ShoppingListsScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'LISTAS DE COMPRAS',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="ShoppingListDetails" 
                component={ShoppingListDetailsScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'DETALHES DA LISTA',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="ShoppingListExecutions" 
                component={ShoppingListExecutionsScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'HISTÓRICO',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="ExecutionReport" 
                component={ExecutionReportScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'RELATÓRIO',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="CreateShoppingList" 
                component={CreateShoppingListScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'NOVA LISTA',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="SelectReceipt" 
                component={SelectReceiptScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'SELECIONAR NOTA',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationsScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'NOTIFICAÇÕES',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: colors.surface,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'PERFIL',
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                }}
              />
            </>
          ) : (
            <Stack.Screen 
              name="AuthStack" 
              component={AuthStack}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
