import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDelivery } from '../services/api';

export default function EventDetailsScreen({ route, navigation }: any) {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelivery();
  }, [deliveryId]);

  const loadDelivery = async () => {
    try {
      const res = await fetchDelivery(deliveryId);
      setDelivery(res.data.data);
    } catch (e) {
      console.error('Event details load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Delivery not found</Text>
      </View>
    );
  }

  const isSuccess = delivery.status === 'SUCCESS';
  const statusColor = isSuccess ? colors.success : colors.error;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event Details</Text>
        <Text style={styles.logId}>{delivery.id?.slice(0, 12)}</Text>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: statusColor }]}>
          <Text style={styles.statusIcon}>{isSuccess ? '✅' : '❌'}</Text>
          <Text style={styles.eventType}>{delivery.event?.type || 'unknown.event'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{delivery.status}</Text>
          </View>
        </View>

        {/* Event Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Metadata</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Timestamp</Text>
              <Text style={styles.metaValue}>
                {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString() : '—'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>HTTP Code</Text>
              <View style={[styles.httpBadge, { borderColor: statusColor }]}>
                <Text style={[styles.httpCode, { color: statusColor }]}>
                  {delivery.lastStatusCode || '—'}
                </Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Retry Count</Text>
              <Text style={styles.metaValue}>{delivery.attempts || 0}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>—</Text>
            </View>
          </View>
        </View>

        {/* Request Payload */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Request Payload</Text>
            <TouchableOpacity><Text style={styles.copyBtn}>📋 Copy</Text></TouchableOpacity>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {JSON.stringify(delivery.event?.payload || {}, null, 2)}
            </Text>
          </View>
        </View>

        {/* Response Body */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response Body</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {delivery.lastResponseBody
                ? JSON.stringify(JSON.parse(delivery.lastResponseBody), null, 2)
                : '{ "message": "No response recorded" }'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  backBtn: { marginBottom: spacing.md },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  logId: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xl },
  statusCard: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, marginBottom: spacing.xl,
    ...shadows.card,
  },
  statusIcon: { fontSize: 24, marginBottom: spacing.sm },
  eventType: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  statusText: { ...typography.captionBold },
  section: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.borderCard,
    marginBottom: spacing.lg, ...shadows.soft,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
  copyBtn: { ...typography.captionBold, color: colors.textSecondary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  metaItem: { width: '45%' },
  metaLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  metaValue: { ...typography.bodyBold, color: colors.textPrimary },
  httpBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 3 },
  httpCode: { ...typography.bodyBold },
  codeBlock: {
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: colors.primary, lineHeight: 20 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
