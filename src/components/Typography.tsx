import React, { ReactNode } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

interface TypographyProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info';
  style?: TextStyle;
  numberOfLines?: number;
  bold?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  style,
  numberOfLines,
  bold = false,
}) => {
  const { colors } = useTheme();

  const getVariantStyle = (): TextStyle => {
    const variantStyles: Record<TypographyVariant, TextStyle> = {
      h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
      h2: { fontSize: 28, fontWeight: 'bold', lineHeight: 36 },
      h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
      h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
      body: { fontSize: 16, lineHeight: 24 },
      body2: { fontSize: 14, lineHeight: 20 },
      caption: { fontSize: 12, lineHeight: 16 },
      button: { fontSize: 16, fontWeight: '600' },
      overline: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },
    };

    return variantStyles[variant];
  };

  const getColorStyle = (): TextStyle => {
    const colorMap: Record<string, string> = {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
      error: colors.error,
      success: colors.success,
      warning: colors.warning,
      info: colors.info,
    };

    return { color: colorMap[color] };
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        getColorStyle(),
        bold && { fontWeight: 'bold' },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

