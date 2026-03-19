import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../styles/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  intensity?: 'soft' | 'medium' | 'strong';
}

export default function GlassCard({ children, style, borderColor, intensity = 'medium' }: GlassCardProps) {
  const bgOpacity = intensity === 'soft' ? 0.6 : intensity === 'strong' ? 0.95 : 0.85;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: `rgba(19, 26, 22, ${bgOpacity})` },
        borderColor ? { borderColor } : {},
        intensity === 'strong' ? shadows.card : shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
});
