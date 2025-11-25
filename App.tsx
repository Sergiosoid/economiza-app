import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ReceiptDetailScreen } from './src/screens/ReceiptDetailScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { TopItemsScreen } from './src/screens/TopItemsScreen';
import { CompareStoresScreen } from './src/screens/CompareStoresScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: true,
          }}
        >
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
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

