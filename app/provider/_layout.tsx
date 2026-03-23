import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';

export default function ProviderLayout() {
  const session = useAuthStore((s) => s.session);
  const providerId = session?.providerId ?? '';
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useFocusEffect(
    useCallback(() => {
      if (providerId) fetchNotifications(providerId, 'provider');
    }, [providerId, fetchNotifications])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: { backgroundColor: Colors.white },
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.gray800,
      }}
    >
      <Tabs.Screen
        name="task-hall"
        options={{
          title: 'Task Hall',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'My Services',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'My Orders',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
