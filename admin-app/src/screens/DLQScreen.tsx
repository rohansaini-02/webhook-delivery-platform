import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { RefreshCw, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDeliveries } from '../services/api';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';

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
      <View style={{ marginBottom: spacing.md }}>
        <GlassCard intensity={15}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.eventType}>{item.event?.type || 'unknown'}</Text>
                <StatusBadge status="FAILED" size="sm" />
              </View>
              <Text style={styles.dlqId}>{item.id?.slice(0, 10)}</Text>
            </View>
            <TouchableOpacity style={styles.replayBtn} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={14} color={colors.info} />
                <Text style={styles.replayText}>Replay</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.warningRow}>
            <AlertTriangle size={16} color={colors.warning} />
            <Text style={styles.warningText}>
              Maximum retry attempts exceeded ({item.attempts || 5})
            </Text>
          </View>

          <Text style={styles.timestamp}>
            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
          </Text>

          <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.detailsToggle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.detailsToggleText}>
                {isExpanded ? 'Hide Details' : 'View Details'}
              </Text>
              {isExpanded ? <ChevronUp size={16} color={colors.info} /> : <ChevronDown size={16} color={colors.info} />}
            </View>
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
        </GlassCard>
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
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search failed events..."
        />
      </View>

      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.xs, gap: spacing.sm }}>
        <AlertTriangle size={28} color={colors.textPrimary} />
        <Text style={[styles.mainTitle, { marginHorizontal: 0, marginBottom: 0 }]}>Dead Letter Queue</Text>
      </View>
      <Text style={styles.subtitle}>Events that failed after max retries</Text>

      {/* Total Count Card */}
      <GlassCard intensity={25} style={styles.countCard}>
        <View>
          <Text style={styles.countLabel}>Total Failed Events</Text>
          <Text style={styles.countValue}>{dlqItems.length}</Text>
        </View>
        <AlertTriangle size={40} color={colors.warning} />
      </GlassCard>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={colors.success} style={{ marginBottom: spacing.md }} />
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
  searchContainer: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  mainTitle: { ...typography.h1, color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  countCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  countLabel: { ...typography.captionBold, color: colors.warning, marginBottom: spacing.xs },
  countValue: { ...typography.metric, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventType: { ...typography.bodyBold, color: colors.textPrimary },
  dlqId: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  replayBtn: {
    backgroundColor: colors.infoBg, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: borderRadius.pill,
  },
  replayText: { ...typography.captionBold, color: colors.info },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
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
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12, color: colors.primary, lineHeight: 20,
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
