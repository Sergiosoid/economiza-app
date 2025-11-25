import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, ScrollViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ScreenContainerProps extends ScrollViewProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  ...scrollProps
}) => {
  const { colors } = useTheme();

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={[containerStyle, style]}
        contentContainerStyle={styles.contentContainer}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});

