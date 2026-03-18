import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDeliveries } from '../services/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function DLQScreen() {
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetchDeliveries();
      const failed = (res.data.data || []).filter((d: any) => d.status === 'FAILED');
      setDlqItems(failed);
    } catch (e) {
      console.error('DLQ load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredItems = dlqItems.filter((d) => {
    if (!searchQuery) return true;
    return d.event?.type?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.eventType}>{item.event?.type || 'unknown'}</Text>
              <View style={styles.failedBadge}>
                <Text style={styles.failedText}>Failed</Text>
              </View>
            </View>
            <Text style={styles.dlqId}>{item.id?.slice(0, 10)}</Text>
          </View>
          <TouchableOpacity style={styles.replayBtn} activeOpacity={0.7}>
            <Text style={styles.replayText}>↻ Replay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningRow}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Maximum retry attempts exceeded ({item.attempts || 5})
          </Text>
        </View>

        <Text style={styles.timestamp}>
          {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
        </Text>

        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.detailsToggle}>
          <Text style={styles.detailsToggleText}>
            {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Retry History */}
            <Text style={styles.expandedTitle}>Retry History ({item.attempts || 0} attempts)</Text>
            {Array.from({ length: Math.min(item.attempts || 3, 5) }).map((_, i) => (
              <View key={i} style={styles.retryItem}>
                <View style={styles.retryNumCircle}>
                  <Text style={styles.retryNum}>#{i + 1}</Text>
                </View>
                <View style={styles.retryHttpBadge}>
                  <Text style={styles.retryHttpText}>HTTP {item.lastStatusCode || 500}</Text>
                </View>
                <Text style={styles.retryMeta}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                </Text>
              </View>
            ))}

            {/* Event Payload */}
            <Text style={[styles.expandedTitle, { marginTop: spacing.lg }]}>Event Payload</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {JSON.stringify(item.event?.payload || {}, null, 2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search failed events..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Title */}
      <Text style={styles.mainTitle}>⚠️ Dead Letter Queue</Text>
      <Text style={styles.subtitle}>Events that failed after max retries</Text>

      {/* Total Count Card */}
      <View style={styles.countCard}>
        <View>
          <Text style={styles.countLabel}>Total Failed Events</Text>
          <Text style={styles.countValue}>{dlqItems.length}</Text>
        </View>
        <Text style={styles.countIcon}>⚠️</Text>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>No failed events! Everything's running smoothly.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 50 },
  center: { alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated, borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  mainTitle: { ...typography.h1, color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  countCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.warningBg, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.warning + '30',
  },
  countLabel: { ...typography.captionBold, color: colors.warning, marginBottom: spacing.xs },
  countValue: { ...typography.metric, color: colors.textPrimary },
  countIcon: { fontSize: 36 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderCard, ...shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventType: { ...typography.bodyBold, color: colors.textPrimary },
  failedBadge: { backgroundColor: colors.errorBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.pill },
  failedText: { ...typography.small, color: colors.error, fontWeight: '600' },
  dlqId: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  replayBtn: {
    backgroundColor: colors.infoBg, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: borderRadius.pill,
  },
  replayText: { ...typography.captionBold, color: colors.info },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  warningIcon: { fontSize: 14 },
  warningText: { ...typography.caption, color: colors.textSecondary },
  timestamp: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  detailsToggle: { alignItems: 'center', marginTop: spacing.md },
  detailsToggleText: { ...typography.captionBold, color: colors.info },
  expandedSection: {
    marginTop: spacing.lg, paddingTop: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  expandedTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.md },
  retryItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  retryNumCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.errorBg,
    alignItems: 'center', justifyContent: 'center',
  },
  retryNum: { ...typography.small, color: colors.error, fontWeight: '700' },
  retryHttpBadge: { backgroundColor: colors.errorBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  retryHttpText: { ...typography.small, color: colors.error, fontWeight: '600' },
  retryMeta: { ...typography.small, color: colors.textMuted, flex: 1 },
  codeBlock: {
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12, color: colors.primary, lineHeight: 20,
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
