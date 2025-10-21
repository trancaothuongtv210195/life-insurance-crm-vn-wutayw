
import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: 'dashboard',
      route: '/(tabs)/dashboard',
      icon: 'chart.bar.fill',
      label: 'Dashboard',
    },
    {
      name: 'customers',
      route: '/(tabs)/customers',
      icon: 'person.3.fill',
      label: 'Khách hàng',
    },
    {
      name: 'learning',
      route: '/(tabs)/learning',
      icon: 'book.fill',
      label: 'Đào tạo',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.circle.fill',
      label: 'Cá nhân',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="learning" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
