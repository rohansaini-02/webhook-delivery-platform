import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { ChevronRight, Radio, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchSubscriptions } from '../services/api';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';

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
        activeOpacity={0.7}
        style={{ marginBottom: spacing.md }}
        onPress={() => navigation.navigate('SubscriptionDetails', { subscriptionId: item.id })}
      >
        <GlassCard intensity={15}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{extractName(item.url)}</Text>
              <Text style={styles.cardUrl}>{item.url}</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </View>

          <View style={styles.cardFooter}>
            <StatusBadge status={isActive ? 'ACTIVE' : 'DISABLED'} size="sm" />
            <Text style={styles.metaText}>Success Rate: <Text style={styles.metaBold}>{successRate}%</Text></Text>
            <Text style={styles.metaText}>Last: {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          {/* Success Rate Bar */}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[colors.primary, colors.primarySoft]}
              style={[styles.progressFill, { width: `${successRate}%` }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </View>
        </GlassCard>
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
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
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
            <Radio size={48} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateSubscription')}
      >
        <Plus size={32} color={colors.textInverse} />
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
  searchContainer: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { ...typography.bodyBold, color: colors.textPrimary },
  cardUrl: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  metaText: { ...typography.small, color: colors.textMuted },
  metaBold: { fontWeight: '700', color: colors.textSecondary },
  progressBar: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  fab: {
    position: 'absolute', bottom: 90, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadows.glow,
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
