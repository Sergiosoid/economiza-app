import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { logout } from '../services/auth';
import { supabase } from '../services/supabase';
import { AppBar } from '../components/AppBar';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AuthStack' as never }],
                })
              );
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ]
    );
  };

  // Obter email do usuário atual
  const [email, setEmail] = React.useState<string>('');

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getUser();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="PROFILE" />
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: 120 }]}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.textOnPrimary }]}>
            {email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.email, { color: colors.textPrimary }]}>{email}</Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: colors.textOnPrimary }]}>
          Sair
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;

