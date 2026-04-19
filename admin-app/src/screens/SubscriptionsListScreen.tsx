import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput,
  RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { User, Search, Plus, MoreVertical, Link, Sliders, ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchSubscriptions } from '../services/api';
import UserAvatar from '../components/UserAvatar';

export default function SubscriptionsListScreen({ navigation }: any) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadData = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetchSubscriptions(cursor);
      const { data, pagination } = res.data;
      
      if (cursor) {
        setSubscriptions(prev => [...prev, ...(data || [])]);
      } else {
        setSubscriptions(data || []);
      }
      
      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasMore || false);
    } catch (e) {
      console.error('Subscriptions load error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const renderCard = ({ item, index }: any) => {
    let successRateStr = '-- %';
    if (item._count && item._count.deliveries > 0) {
      const total = item._count.deliveries;
      const fails = item.failCount || 0;
      successRateStr = ((1 - fails / total) * 100).toFixed(2) + '%';
    }
    const isActive = item.isActive;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.cardWrapper, { borderLeftColor: isActive ? colors.success : '#333333' }]}
        onPress={() => navigation.navigate('SubscriptionDetails', { subscriptionId: item.id })}
      >
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{extractName(item.url)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.1)' }]}>
                <Text style={[styles.statusText, { color: isActive ? colors.success : '#AAAAAA' }]}>
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.urlRow}>
            <Text style={styles.infinityIcon}>∞</Text>
            <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.footerLabel}>SUCCESS RATE</Text>
            <Text style={[styles.metricValue, { color: isActive ? colors.success : '#888888' }]}>
              {successRateStr}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>LAST DELIVERY</Text>
              <Text style={styles.footerValuePrimary}>
                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '2m 14s ago'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
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

  const displayData = subscriptions.filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.url?.toLowerCase().includes(q) || extractName(s.url).toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>

      <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <UserAvatar size={36} />
            <View>
              <Text style={styles.headerTitle}>Subscriptions</Text>
            </View>
          </View>
        </View>
      </BlurView>

      <FlatList
        data={displayData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Active Subscriptions</Text>
            <Text style={styles.pageSubtitle}>Manage high-availability webhooks and data stream listeners.</Text>
            
            <View style={styles.searchContainer}>
              <Search size={18} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by endpoint name or destination..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        }
        ListFooterComponent={
          <>
            {loadingMore && (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            {displayData.length > 0 && !hasMore ? (
              <View style={styles.listFooter}>
                <View style={styles.footerIconContainer}>
                  <Sliders size={32} color="#444" strokeWidth={1.5} />
                </View>
                <Text style={styles.listFooterText}>
                  Orchestrating 124,592 deliveries in{'\n'}the last 24 hours
                </Text>
              </View>
            ) : null}
          </>
        }
        onEndReached={() => {
          if (hasMore && !loadingMore && !searchQuery) {
            loadData(nextCursor!);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Link size={48} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CreateSubscription')}
      >
        <View style={styles.fabInner}>
          <Plus size={28} color="#000" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function extractName(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host.includes('payments')) return 'Main Payment Gateway';
    if (host.includes('marketing')) return 'User Onboarding Stream';
    if (host.includes('inventory')) return 'Legacy Inventory Sync';
    if (host.includes('bigquery')) return 'Real-time Analytics Dump';

    const parts = host.split('.');
    return parts.length > 1
      ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) + ' Server'
      : host;
  } catch {
    return 'Stream Target';
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E11' },
  headerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 65,
    paddingBottom: spacing.md,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A2120', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.primary, fontWeight: '700' },
  searchBtnTop: { padding: 4 },
  center: { alignItems: 'center', justifyContent: 'center' },
  
  pageHeader: { marginBottom: spacing.lg, marginTop: spacing.xs },
  pageTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: 6, fontSize: 28, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 15, color: '#A0A0A0', lineHeight: 18, marginBottom: spacing.xl },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181C1A', borderRadius: 12, paddingHorizontal: 16, height: 48 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF', padding: 0 },

  list: { paddingHorizontal: spacing.xl, paddingBottom: 140, paddingTop: spacing.xs },
  
  cardWrapper: { marginBottom: spacing.md, borderRadius: 12, overflow: 'hidden', backgroundColor: '#161B19', borderLeftWidth: 4 },
  cardInner: { padding: spacing.lg, paddingLeft: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.textPrimary, fontSize: 16 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { ...typography.small, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  infinityIcon: { color: '#888', fontSize: 15, fontWeight: '800' },
  cardUrl: { ...typography.caption, color: '#8A9A8E', fontFamily: 'monospace', flex: 1, opacity: 0.8, fontSize: 14 },
  
  statsSection: { marginBottom: spacing.md },
  metricValue: { fontSize: 22, fontWeight: '700', marginTop: 4, letterSpacing: -0.5 },
  
  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerItem: { gap: 4 },
  footerLabel: { ...typography.small, color: '#5A6A5E', fontSize: 12, letterSpacing: 1, fontWeight: '600' },
  footerValuePrimary: { fontSize: 14, color: '#FFFFFF' },
  menuBtn: { padding: 4, marginRight: -8, marginBottom: 4 },

  listFooter: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl, paddingBottom: 60 },
  footerIconContainer: { marginBottom: 16, opacity: 0.8 },
  listFooterText: { fontSize: 16, color: '#8A9A8E', textAlign: 'center', lineHeight: 20 },
  
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },
  
  fab: { position: 'absolute', bottom: 90, right: spacing.xl, ...shadows.glow },
  fabInner: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
