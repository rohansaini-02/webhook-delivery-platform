import React from 'react';
import { View, StyleSheet, Platform, Animated, Pressable, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius } from '../styles/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  glowColor?: string;
  intensity?: number;
}

export default function PremiumCard({ 
  children, 
  style, 
  onPress, 
  glowColor = 'rgba(0, 255, 150, 0.08)',
  intensity = 25
}: PremiumCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  // If no onPress is provided, glow is stronger implicitly since it doesn't pulse.
  const glowOpacity = React.useRef(new Animated.Value(onPress ? 0.3 : 0.4)).current;

  const animateIn = () => {
    if (!onPress) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.01, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: -2, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 250, useNativeDriver: true })
    ]).start();
  };

  const animateOut = () => {
    if (!onPress) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.3, duration: 250, useNativeDriver: true })
    ]).start();
  };

  const Wrapper = onPress ? AnimatedPressable : View;
  
  const transformStyle = onPress ? { transform: [{ scale }, { translateY }] } : {};
  const webHover = Platform.OS === 'web' && onPress ? { onHoverIn: animateIn, onHoverOut: animateOut } : {};

  return (
    <Wrapper
      onPress={onPress}
      onPressIn={animateIn}
      onPressOut={animateOut}
      {...(webHover as any)}
      style={[styles.container, transformStyle]}
    >
      <Animated.View style={[styles.glowLayer, { opacity: glowOpacity, shadowColor: glowColor, backgroundColor: glowColor }]} />
      
      <View style={[styles.glassContainer, style]}>
        
        {Platform.OS === 'web' ? (
          <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,25,22,0.7)', backdropFilter: `blur(${intensity}px)` } as any]} />
        ) : (
          <BlurView intensity={intensity} tint="dark" style={styles.absoluteFill} />
        )}
        
        <LinearGradient
          colors={['rgba(20,25,22,0.9)', 'rgba(24,20,28,0.88)', 'rgba(10,15,12,0.85)']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(120, 255, 180, 0.08)', 'transparent', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.absoluteFill}
        />
        
        {children}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 0,
  },
  glassContainer: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 4,
  },
});
