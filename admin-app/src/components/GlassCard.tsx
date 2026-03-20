import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, shadows } from '../styles/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export default function GlassCard({ children, style, intensity = 40, tint = 'dark' }: GlassCardProps) {
  // Multiply or force a minimum intensity to ensure strong frosted effect
  const finalIntensity = Math.max(intensity * 2.5, 45);

  return (
    <View style={[styles.wrapper, style]}>
      {/* 
        We use an absolute positioned BlurView for true frosted glass,
        alongside a soft LinearGradient overlay to give it that "shine".
      */}
      <BlurView intensity={finalIntensity} tint={tint} style={StyleSheet.absoluteFillObject} />
      {/* Dark translucent backdrop to improve text contrast over bright images */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10, 15, 13, 0.45)' }]} />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.4)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...shadows.soft,
  },
});
