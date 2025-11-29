/**
 * Paleta de cores oficial do app Economiza
 * Usa a mesma paleta para light e dark mode por enquanto
 * 
 * Guia de uso:
 * - Botões: usar primary (#B9FF00)
 * - Inputs: usar surface (#111111) + border (#1F1F1F)
 * - Textos: usar textPrimary (#FFFFFF) ou textSecondary (#B3B3B3)
 * - Headers: usar surface (#111111)
 * - Background geral: usar background (#0A0A0A)
 * 
 * As transições de cores são suaves por padrão no React Native
 */

const officialPalette = {
  primary: '#B9FF00',
  background: '#0A0A0A',
  surface: '#111111',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#1F1F1F',
  error: '#FF4D4F',
  success: '#65FF8F',
};

export const lightColors = {
  // Cores primárias
  primary: officialPalette.primary,
  primaryDark: '#9ACC00',
  primaryLight: '#D4FF33',
  
  // Cores secundárias (derivadas do primary)
  secondary: officialPalette.primary,
  secondaryDark: '#9ACC00',
  secondaryLight: '#D4FF33',
  
  // Backgrounds
  background: officialPalette.background,
  surface: officialPalette.surface,
  surfaceVariant: '#1A1A1A',
  
  // Textos
  textPrimary: officialPalette.textPrimary,
  textSecondary: officialPalette.textSecondary,
  textTertiary: '#808080',
  textOnPrimary: officialPalette.background,
  
  // Estados
  success: officialPalette.success,
  warning: '#FFB84D',
  error: officialPalette.error,
  info: '#4D9FFF',
  
  // Bordas e divisores
  border: officialPalette.border,
  divider: officialPalette.border,
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors = {
  // Cores primárias
  primary: officialPalette.primary,
  primaryDark: '#9ACC00',
  primaryLight: '#D4FF33',
  
  // Cores secundárias (derivadas do primary)
  secondary: officialPalette.primary,
  secondaryDark: '#9ACC00',
  secondaryLight: '#D4FF33',
  
  // Backgrounds
  background: officialPalette.background,
  surface: officialPalette.surface,
  surfaceVariant: '#1A1A1A',
  
  // Textos
  textPrimary: officialPalette.textPrimary,
  textSecondary: officialPalette.textSecondary,
  textTertiary: '#808080',
  textOnPrimary: officialPalette.background,
  
  // Estados
  success: officialPalette.success,
  warning: '#FFB84D',
  error: officialPalette.error,
  info: '#4D9FFF',
  
  // Bordas e divisores
  border: officialPalette.border,
  divider: officialPalette.border,
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors;
