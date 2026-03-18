import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDeliveries } from '../services/api';

type FilterType = 'ALL' | 'SUCCESS' | 'FAILED';

export default function DeliveryLogsScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetchDeliveries();
      setDeliveries(res.data.data || []);
    } catch (e) {
      console.error('Deliveries load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeFilter !== 'ALL' && d.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.event?.type?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return colors.success;
      case 'FAILED': return colors.error;
      default: return colors.warning;
    }
  };

  const getHttpCodeColor = (code: number | null) => {
    if (!code) return colors.textMuted;
    if (code >= 200 && code < 300) return colors.success;
    if (code >= 400 && code < 500) return colors.warning;
    return colors.error;
  };

  const renderDeliveryCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('EventDetails', { deliveryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.eventType}>{item.event?.type || 'unknown.event'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      <Text style={styles.logId}>{item.id?.slice(0, 8) || 'log'}</Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>HTTP Code</Text>
          <View style={[styles.httpBadge, { borderColor: getHttpCodeColor(item.lastStatusCode) }]}>
            <Text style={[styles.httpCode, { color: getHttpCodeColor(item.lastStatusCode) }]}>
              {item.lastStatusCode || '—'}
            </Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Retries</Text>
          <Text style={styles.metaValue}>{item.attempts || 0}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Time</Text>
          <Text style={styles.metaValue}>
            {item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            }) : '—'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          placeholder="Search logs, events..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Delivery Logs</Text>
      <Text style={styles.subtitle}>Track webhook delivery status</Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'SUCCESS', 'FAILED'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterBtn,
              activeFilter === f && styles.filterBtnActive,
            ]}
            activeOpacity={0.7}
          >
            {f === 'SUCCESS' && <View style={[styles.filterDot, { backgroundColor: colors.success }]} />}
            {f === 'FAILED' && <View style={[styles.filterDot, { backgroundColor: colors.error }]} />}
            <Text style={[
              styles.filterText,
              activeFilter === f && styles.filterTextActive,
            ]}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredDeliveries}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No delivery logs found</Text>
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
  title: { ...typography.h1, color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { ...typography.captionBold, color: colors.textMuted },
  filterTextActive: { color: colors.textPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderCard, ...shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  eventType: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typography.small },
  chevron: { fontSize: 22, color: colors.textMuted, marginLeft: spacing.sm },
  logId: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: {},
  metaLabel: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  metaValue: { ...typography.bodyBold, color: colors.textPrimary },
  httpBadge: { borderWidth: 1, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  httpCode: { ...typography.bodyBold },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
