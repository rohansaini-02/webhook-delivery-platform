import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

type StatusType = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING' | 'ACTIVE' | 'DISABLED';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string; }> = {
  SUCCESS: { label: 'Success', color: colors.success, bgColor: colors.successBg },
  FAILED: { label: 'Failed', color: colors.error, bgColor: colors.errorBg },
  PENDING: { label: 'Pending', color: colors.warning, bgColor: colors.warningBg },
  RETRYING: { label: 'Retrying', color: colors.info, bgColor: colors.infoBg },
  ACTIVE: { label: 'Active', color: colors.success, bgColor: colors.successBg },
  DISABLED: { label: 'Disabled', color: colors.textMuted, bgColor: colors.bgInput },
};

/**
 * Reusable StatusBadge component for the Admin Dashboard.
 * Supports multiple delivery and subscription states with consistent coloring.
 */
export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...typography.captionBold,
    fontSize: 12,
  },
  textSm: {
    fontSize: 10,
  },
});
