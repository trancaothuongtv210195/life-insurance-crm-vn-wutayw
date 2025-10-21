
import React, { useEffect } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SystemBars } from 'react-native-edge-to-edge';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const customLightTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#1976D2',
      background: '#F5F7FA',
      card: '#FFFFFF',
      text: '#212121',
      border: '#E0E0E0',
    },
  };

  const customDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#1976D2',
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      border: '#333333',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
        <WidgetProvider>
          <AuthProvider>
            <DataProvider>
              <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="customer/add" />
                <Stack.Screen name="customer/[id]" />
              </Stack>
            </DataProvider>
          </AuthProvider>
        </WidgetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
