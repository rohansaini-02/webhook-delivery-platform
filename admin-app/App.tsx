import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/styles/theme';
import ErrorBoundary from './src/components/ErrorBoundary';

const AppTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: '#0A0F0D',
    card: colors.tabBar,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0F0D' }}>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer theme={AppTheme}>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

