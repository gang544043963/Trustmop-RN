import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role, switchRole, logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerTitle: 'Trustmop',
        headerRight: () => (
          <TouchableOpacity onPress={switchRole} style={styles.switchButton}>
            <Text style={styles.switchButtonText}>
              Switch to {role === 'user' ? 'Cleaner' : 'User'}
            </Text>
          </TouchableOpacity>
        ),
        tabBarButton: HapticTab,
      }}>
      {role === 'user' ? (
        <>
          <Tabs.Screen
            name="user/home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="user/tasks"
            options={{
              title: 'Tasks',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
            }}
          />
          <Tabs.Screen
            name="user/profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="cleaner/home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="cleaner/tasks"
            options={{
              title: 'Tasks',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
            }}
          />
          <Tabs.Screen
            name="cleaner/profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  switchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  switchButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
