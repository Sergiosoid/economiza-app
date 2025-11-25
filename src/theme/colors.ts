/**
 * Paleta de cores do app Economiza
 * Suporta modo claro e escuro
 */

export const lightColors = {
  // Cores primárias
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Cores secundárias
  secondary: '#81C784',
  secondaryDark: '#66BB6A',
  secondaryLight: '#A5D6A7',
  
  // Backgrounds
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F9F9F9',
  
  // Textos
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textOnPrimary: '#FFFFFF',
  
  // Estados
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Bordas e divisores
  border: '#E0E0E0',
  divider: '#E0E0E0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const darkColors = {
  // Cores primárias
  primary: '#66BB6A',
  primaryDark: '#4CAF50',
  primaryLight: '#81C784',
  
  // Cores secundárias
  secondary: '#81C784',
  secondaryDark: '#66BB6A',
  secondaryLight: '#A5D6A7',
  
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  
  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#757575',
  textOnPrimary: '#FFFFFF',
  
  // Estados
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Bordas e divisores
  border: '#333333',
  divider: '#333333',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors;

