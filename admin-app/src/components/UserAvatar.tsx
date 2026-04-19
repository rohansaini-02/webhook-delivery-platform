import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { colors, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react-native';

interface Props {
  style?: ViewStyle;
  size?: number;
}

export default function UserAvatar({ style, size = 30 }: Props) {
  const { userEmail } = useAuth();
  const radius = size / 2;

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: radius },
      style
    ]}>
      <View style={styles.fallback}>
        <User size={size * 0.6} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    overflow: 'hidden'
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyBold,
    color: colors.primary,
  }
});
