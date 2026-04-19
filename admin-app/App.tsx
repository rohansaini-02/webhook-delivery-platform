import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/styles/theme';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0F0D' }}>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.primary,
              background: '#0A0F0D',
              card: colors.tabBar,
              text: colors.textPrimary,
              border: colors.border,
              notification: colors.primary,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' as const },
              medium: { fontFamily: 'System', fontWeight: '500' as const },
              bold: { fontFamily: 'System', fontWeight: '700' as const },
              heavy: { fontFamily: 'System', fontWeight: '800' as const },
            },
          }}
        >
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
