import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  vertical = false,
  spacing = 0,
}) => {
  const { colors } = useTheme();

  const dividerStyle: ViewStyle = {
    backgroundColor: colors.divider,
  };

  if (vertical) {
    dividerStyle.width = 1;
    dividerStyle.height = '100%';
    dividerStyle.marginHorizontal = spacing;
  } else {
    dividerStyle.height = 1;
    dividerStyle.width = '100%';
    dividerStyle.marginVertical = spacing;
  }

  return <View style={[dividerStyle, style]} />;
};

