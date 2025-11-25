import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { testConnection } from '../services/testConnection';

export const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testConnection();
      Alert.alert(
        result.success ? 'Sucesso!' : 'Erro',
        result.message,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro inesperado ao testar conexão',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScanner = () => {
    navigation.navigate('Scanner' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Economiza!</Text>
      <Text style={styles.subtitle}>Seu app de economia está pronto para começar.</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleOpenScanner}
      >
        <Text style={styles.buttonText}>Escanear QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleTestConnection}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Testar Conexão com Backend</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#34C759',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

