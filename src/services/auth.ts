import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const TOKEN_KEY = "economiza_token";

export async function register(email: string, password: string) {
  // URL de redirect para verificação de email
  const redirectUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`;
  
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
  if (error) throw error;
  const session = data.session;
  if (session?.access_token) {
    await SecureStore.setItemAsync(TOKEN_KEY, session.access_token);
  }
  return data.user;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const token = data.session?.access_token;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  return data.user;
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function logout() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await supabase.auth.signOut();
}

