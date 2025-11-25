import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ReceiptDetailScreen } from './src/screens/ReceiptDetailScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { TopItemsScreen } from './src/screens/TopItemsScreen';
import { CompareStoresScreen } from './src/screens/CompareStoresScreen';
import { OnboardingScreen, checkOnboardingCompleted } from './src/screens/OnboardingScreen';
import { Loading } from './src/components/Loading';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const { colors, colorScheme } = useTheme();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await checkOnboardingCompleted();
    setIsOnboardingCompleted(completed);
  };

  if (isOnboardingCompleted === null) {
    return <Loading message="Carregando..." />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: colorScheme === 'dark',
        colors: {
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
        initialRouteName={isOnboardingCompleted ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Minhas Compras' }}
        />
        <Stack.Screen 
          name="Scanner" 
          component={ScannerScreen}
          options={{ title: 'Escanear QR Code' }}
        />
        <Stack.Screen 
          name="ReceiptDetail" 
          component={ReceiptDetailScreen}
          options={{ title: 'Detalhes da Nota' }}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{ title: 'Resumo de Gastos' }}
        />
        <Stack.Screen 
          name="TopItems" 
          component={TopItemsScreen}
          options={{ title: 'Itens Mais Comprados' }}
        />
        <Stack.Screen 
          name="CompareStores" 
          component={CompareStoresScreen}
          options={{ title: 'Comparar Preços' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

