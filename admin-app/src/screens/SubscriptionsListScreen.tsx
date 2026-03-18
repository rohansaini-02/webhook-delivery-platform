import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchSubscriptions } from '../services/api';

export default function SubscriptionsListScreen({ navigation }: any) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetchSubscriptions();
      setSubscriptions(res.data.data || []);
    } catch (e) {
      console.error('Subscriptions load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = subscriptions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.url?.toLowerCase().includes(q) || s.events?.join(',').toLowerCase().includes(q);
  });

  const renderCard = ({ item }: any) => {
    const successRate = 98.5; // Placeholder until per-subscription metrics are added
    const isActive = item.isActive !== false;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SubscriptionDetails', { subscriptionId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{extractName(item.url)}</Text>
            <Text style={styles.cardUrl}>{item.url}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.textMuted }]} />
          <Text style={[styles.statusLabel, { color: isActive ? colors.success : colors.textMuted }]}>
            {isActive ? 'Active' : 'Disabled'}
          </Text>
          <Text style={styles.metaText}>Success Rate: <Text style={styles.metaBold}>{successRate}%</Text></Text>
          <Text style={styles.metaText}>Last: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        {/* Success Rate Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${successRate}%` }]} />
        </View>
      </TouchableOpacity>
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
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.title}>Subscriptions</Text>
      <Text style={styles.subtitle}>Manage webhook endpoints</Text>

      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function extractName(url: string): string {
  try {
    const host = new URL(url).hostname;
    const parts = host.split('.');
    return parts.length > 1
      ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) + ' Service'
      : host;
  } catch {
    return 'Webhook Endpoint';
  }
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
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderCard, ...shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { ...typography.bodyBold, color: colors.textPrimary },
  cardUrl: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { ...typography.captionBold },
  metaText: { ...typography.small, color: colors.textMuted },
  metaBold: { fontWeight: '700', color: colors.textSecondary },
  progressBar: {
    height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  fab: {
    position: 'absolute', bottom: 90, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadows.glow,
  },
  fabIcon: { fontSize: 28, color: colors.textInverse, marginTop: -2 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
