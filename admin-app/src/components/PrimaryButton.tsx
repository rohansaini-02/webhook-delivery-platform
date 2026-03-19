import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, typography } from '../styles/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
  icon?: string;
  style?: ViewStyle;
}

export default function PrimaryButton({
  title, onPress, loading, disabled, variant = 'primary', icon, style,
}: PrimaryButtonProps) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.outlineBtn, disabled && styles.disabled, style]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.outlineBtnText}>
            {icon ? `${icon} ` : ''}{title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  const gradientColors: [string, string] = variant === 'danger'
    ? [colors.error, '#FF7043']
    : [colors.primary, colors.primarySoft];

  const textColor = variant === 'danger' ? colors.textPrimary : colors.textInverse;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBtn}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[styles.gradientBtnText, { color: textColor }]}>
            {icon ? `${icon} ` : ''}{title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  gradientBtnText: {
    ...typography.bodyBold,
  },
  outlineBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
