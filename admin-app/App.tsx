import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/styles/theme';

const customTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.bg,
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
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0F0D' }}>
      <ImageBackground 
        source={require('./assets/background.jpg')} 
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ opacity: 0.65 }}
        resizeMode="cover"
        blurRadius={20}
      >
        <AuthProvider>
          <NavigationContainer theme={customTheme as any}>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </AuthProvider>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}
 
