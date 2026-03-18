import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
  Switch, Alert, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchSubscription, updateSubscription, deleteSubscription } from '../services/api';

export default function SubscriptionDetailsScreen({ route, navigation }: any) {
  const { subscriptionId } = route.params;
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => { loadSub(); }, [subscriptionId]);

  const loadSub = async () => {
    try {
      const res = await fetchSubscription(subscriptionId);
      setSub(res.data.data);
    } catch (e) {
      console.error('Sub details load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    try {
      await updateSubscription(subscriptionId, { isActive: value });
      setSub((prev: any) => ({ ...prev, isActive: value }));
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Subscription', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscription(subscriptionId);
            navigation.goBack();
          } catch (e) {
            console.error('Delete error:', e);
          }
        },
      },
    ]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch {
      // fallback silently
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!sub) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Subscription not found</Text>
      </View>
    );
  }

  const isActive = sub.isActive !== false;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{extractName(sub.url)}</Text>
          <View style={[styles.activeBadge, { backgroundColor: isActive ? colors.successBg : colors.errorBg }]}>
            <Text style={[styles.activeText, { color: isActive ? colors.success : colors.error }]}>
              {isActive ? '● Active' : '● Disabled'}
            </Text>
          </View>
        </View>

        <View style={styles.healthBadge}>
          <Text style={styles.healthText}>✅ Healthy</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Success</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>—</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Failed</Text>
            <Text style={[styles.statValue, { color: colors.error }]}>—</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fail Rate</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>0.0%</Text>
          </View>
        </View>

        {/* 7-Day Performance placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 7-Day Performance</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBar}>
              {[40, 48, 45, 50, 42, 38, 44].map((h, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View style={[styles.chartBarFill, { height: h, backgroundColor: colors.primary }]} />
                  <Text style={styles.chartBarLabel}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Last Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Delivery</Text>
          <View style={styles.lastDelivery}>
            <Text style={styles.lastIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lastStatus}>Successful</Text>
              <Text style={styles.lastMeta}>
                {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '—'}
              </Text>
            </View>
            <View style={styles.httpBadge}>
              <Text style={styles.httpCode}>HTTP 200</Text>
            </View>
          </View>
        </View>

        {/* Endpoint URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endpoint URL</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{sub.url}</Text>
          </View>
          <TouchableOpacity style={styles.copyRow} onPress={() => copyToClipboard(sub.url)}>
            <Text style={styles.copyText}>📋 Copy URL</Text>
          </TouchableOpacity>
        </View>

        {/* Secret Key */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secret Key</Text>
          <View style={styles.secretRow}>
            <Text style={styles.secretValue}>
              {showSecret ? sub.secret : '••••••••••••••••••••••••••••'}
            </Text>
            <TouchableOpacity onPress={() => setShowSecret(!showSecret)}>
              <Text style={styles.eyeIcon}>{showSecret ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.secretActions}>
            <TouchableOpacity style={styles.secretBtn} onPress={() => copyToClipboard(sub.secret || '')}>
              <Text style={styles.secretBtnText}>📋 Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secretBtn}>
              <Text style={styles.secretBtnText}>🔄 Rotate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscribed Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscribed Events</Text>
          <View style={styles.tagsRow}>
            {(sub.events || []).map((ev: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{ev}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Enable Subscription</Text>
              <Text style={styles.settingMeta}>Receive webhook events</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={isActive ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={styles.deleteBtnText}>Delete Subscription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function extractName(url: string): string {
  try {
    const host = new URL(url).hostname;
    const parts = host.split('.');
    return parts.length > 1
      ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) + ' Gateway'
      : host;
  } catch {
    return 'Webhook Endpoint';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, flex: 1 },
  activeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  activeText: { ...typography.captionBold },
  healthBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.successBg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill, marginBottom: spacing.xl,
  },
  healthText: { ...typography.captionBold, color: colors.success },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderCard,
  },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  statValue: { ...typography.h2 },
  section: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.borderCard,
    marginBottom: spacing.lg, ...shadows.soft,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
  chartPlaceholder: { alignItems: 'center' },
  chartBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 60 },
  chartBarCol: { alignItems: 'center' },
  chartBarFill: { width: 20, borderRadius: borderRadius.sm },
  chartBarLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs, fontSize: 9 },
  lastDelivery: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lastIcon: { fontSize: 20 },
  lastStatus: { ...typography.bodyBold, color: colors.textPrimary },
  lastMeta: { ...typography.caption, color: colors.textSecondary },
  httpBadge: {
    borderWidth: 1, borderColor: colors.success, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  httpCode: { ...typography.captionBold, color: colors.success },
  codeBlock: {
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  copyRow: {
    alignItems: 'center', paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md,
  },
  copyText: { ...typography.captionBold, color: colors.textSecondary },
  secretRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  secretValue: { ...typography.body, color: colors.textPrimary, letterSpacing: 2 },
  eyeIcon: { fontSize: 18 },
  secretActions: { flexDirection: 'row', gap: spacing.md },
  secretBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  secretBtnText: { ...typography.captionBold, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    backgroundColor: colors.bgElevated, borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  tagText: { ...typography.caption, color: colors.textSecondary },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  settingLabel: { ...typography.bodyBold, color: colors.textPrimary },
  settingMeta: { ...typography.caption, color: colors.textSecondary },
  deleteBtn: {
    backgroundColor: colors.errorBg, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.error,
  },
  deleteBtnText: { ...typography.bodyBold, color: colors.error },
  emptyText: { ...typography.body, color: colors.textMuted },
});
