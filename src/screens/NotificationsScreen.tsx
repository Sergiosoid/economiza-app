/**
 * Tela de Notificações
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNotificationsStore } from '../stores/notificationsStore';
import { NotificationResponse } from '../types/notification';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { notifications, loading, loadNotifications, markAsRead } = useNotificationsStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead([id]);
  };

  const getNotificationTitle = (type: string) => {
    const titles: Record<string, string> = {
      SYNC_COMPLETED: 'Sincronização Concluída',
      PRICE_ALERT: 'Alerta de Preço',
      ITEM_MISSING: 'Itens Faltantes',
    };
    return titles[type] || type;
  };

  const getNotificationMessage = (notification: NotificationResponse) => {
    const { type, payload } = notification;
    if (type === 'SYNC_COMPLETED') {
      return `Sincronização realizada. Total: R$ ${payload?.real_total?.toFixed(2) || 'N/A'}`;
    }
    if (type === 'PRICE_ALERT') {
      return `Diferença de preço: ${payload?.difference_percent?.toFixed(2) || 'N/A'}%`;
    }
    if (type === 'ITEM_MISSING') {
      return `${payload?.missing_count || 0} item(ns) não foram comprados`;
    }
    return 'Nova notificação';
  };

  const renderItem = ({ item }: { item: NotificationResponse }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.is_read ? colors.surface : colors.primary + '10',
          borderColor: colors.border,
        },
      ]}
      onPress={() => !item.is_read && handleMarkRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
          {getNotificationTitle(item.type)}
        </Text>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
          {getNotificationMessage(item)}
        </Text>
        <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleString('pt-BR')}
        </Text>
      </View>
      {!item.is_read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: colors.primary }]}
            onPress={handleMarkAllRead}
          >
            <Text style={[styles.markAllText, { color: colors.textOnPrimary }]}>
              Marcar todas como lidas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => loadNotifications()} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma notificação
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default NotificationsScreen;

