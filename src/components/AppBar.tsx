import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNotificationsStore } from '../stores/notificationsStore';

interface AppBarProps {
  title: string;
}

export const AppBar: React.FC<AppBarProps> = ({ title }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationsStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top, paddingBottom: 6, height: insets.top + 56 }]}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Profile' as never)}
        accessible={true}
        accessibilityLabel="Abrir perfil"
      >
        <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title.toUpperCase()}
      </Text>
      
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Notifications' as never)}
        accessible={true}
        accessibilityLabel="Abrir notificações"
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: '#F44336' }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

