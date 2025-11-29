import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Typography } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/auth';

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Logo Placeholder */}
      <Typography variant="h2" style={styles.logo}>ECONOMIZA</Typography>

      {/* Email */}
      <TextInput
        placeholder="E-mail"
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Senha */}
      <TextInput
        placeholder="Senha"
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botão de Login */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={async () => {
          try {
            await login(email, password);
            navigation.reset({
              index: 0,
              routes: [{ name: "BottomTabs" as never }],
            });
          } catch (error: any) {
            alert(error.message || "Erro ao fazer login");
          }
        }}
      >
        <Typography variant="button" style={{ color: colors.background }}>Entrar</Typography>
      </TouchableOpacity>

      {/* Criar conta */}
      <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
        <Typography variant="body" color="primary">
          Criar uma conta →
        </Typography>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    marginBottom: 40,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
});
