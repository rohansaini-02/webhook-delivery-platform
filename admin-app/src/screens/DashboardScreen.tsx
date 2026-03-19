import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchMetrics, fetchDeliveries } from '../services/api';
import SearchBar from '../components/SearchBar';

interface MetricsData {
  totals: { subscriptions: number; events: number; deliveries: number };
  deliveryStatuses: { success: number; failed: number; pending: number; retrying: number };
}

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [metricsRes, deliveriesRes] = await Promise.all([
        fetchMetrics(),
        fetchDeliveries(),
      ]);
      setMetrics(metricsRes.data.data);
      setRecentActivity(deliveriesRes.data.data?.slice(0, 10) || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '✅';
      case 'FAILED': return '❌';
      case 'PENDING': return '⏳';
      case 'RETRYING': return '🔄';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return colors.success;
      case 'FAILED': return colors.error;
      case 'PENDING': return colors.warning;
      case 'RETRYING': return colors.info;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dlqCount = metrics?.deliveryStatuses.failed || 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events, logs, or webhooks..."
        />

        {/* Title */}
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Monitor webhook delivery metrics</Text>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderColor: colors.info }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.info }]}>Total Events</Text>
              <Text style={styles.metricBadge}>📈</Text>
            </View>
            <Text style={styles.metricValue}>{metrics?.totals.events?.toLocaleString() || '0'}</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: colors.success }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.success }]}>Successful</Text>
              <Text style={styles.metricBadge}>✅</Text>
            </View>
            <Text style={styles.metricValue}>{metrics?.deliveryStatuses.success?.toLocaleString() || '0'}</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: colors.error }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.error }]}>Failed</Text>
              <Text style={styles.metricBadge}>❌</Text>
            </View>
            <Text style={styles.metricValue}>{metrics?.deliveryStatuses.failed?.toLocaleString() || '0'}</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: colors.warning }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.warning }]}>DLQ Count</Text>
              <Text style={styles.metricBadge}>⚠️</Text>
            </View>
            <Text style={styles.metricValue}>{dlqCount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Delivery Trends Chart placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Delivery Trends (7 Days)</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBar}>
              {[65, 80, 72, 90, 85, 78, 60].map((h, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View style={[styles.chartBarFill, { height: h, backgroundColor: colors.primary }]} />
                  <Text style={styles.chartBarLabel}>{['M','T','W','T','F','S','S'][i]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Successful</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendText}>Failed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No recent deliveries yet</Text>
            </View>
          ) : (
            recentActivity.map((item: any, index: number) => (
              <View key={item.id || index} style={styles.activityItem}>
                <Text style={styles.activityIcon}>{getStatusIcon(item.status)}</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {item.event?.type || 'Webhook'} delivery {item.status?.toLowerCase()}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {item.subscription?.url ? new URL(item.subscription.url).hostname : 'Unknown'}
                    {' • '}
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : ''}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated, borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: {
    width: '47%', backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg, padding: spacing.lg,
    borderWidth: 1, ...shadows.card,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  metricLabel: { ...typography.captionBold },
  metricBadge: { fontSize: 18 },
  metricValue: { ...typography.metric, color: colors.textPrimary },
  chartCard: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginTop: spacing.xl,
    borderWidth: 1, borderColor: colors.borderCard, ...shadows.card,
  },
  chartTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
  chartPlaceholder: { alignItems: 'center' },
  chartBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, height: 100, marginBottom: spacing.lg },
  chartBarCol: { alignItems: 'center' },
  chartBarFill: { width: 24, borderRadius: borderRadius.sm },
  chartBarLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  chartLegend: { flexDirection: 'row', gap: spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...typography.caption, color: colors.textSecondary },
  activitySection: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginTop: spacing.xl,
    borderWidth: 1, borderColor: colors.borderCard, ...shadows.card,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
  activityItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  activityIcon: { fontSize: 20, marginRight: spacing.md },
  activityContent: { flex: 1 },
  activityTitle: { ...typography.bodyBold, color: colors.textPrimary },
  activityMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
