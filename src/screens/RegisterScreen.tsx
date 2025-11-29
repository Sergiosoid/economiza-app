import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Typography } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { register } from '../services/auth';

export const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Typography variant="h2" style={styles.logo}>Criar Conta</Typography>

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

      {/* Confirmar senha */}
      <TextInput
        placeholder="Confirmar senha"
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {/* Botão de cadastro */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={async () => {
          try {
            await register(email, password);
            navigation.reset({
              index: 0,
              routes: [{ name: "BottomTabs" as never }],
            });
          } catch (error: any) {
            alert(error.message || "Erro ao cadastrar");
          }
        }}
      >
        <Typography variant="button" style={{ color: colors.background }}>Cadastrar</Typography>
      </TouchableOpacity>

      {/* Voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Typography variant="body" color="primary">
          Já tenho conta →
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
