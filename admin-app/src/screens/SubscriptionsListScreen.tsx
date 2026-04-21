import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  RefreshControl, ActivityIndicator, Dimensions, Platform,
  Animated, Pressable, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Plus, Link, Sliders, ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchSubscriptions } from '../services/api';
import UserAvatar from '../components/UserAvatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SubscriptionCard = React.memo(({ item, successRateStr, onPress }: any) => {
  const isActive = item.isActive;
  const statusColor = isActive ? '#4ADE80' : '#888888';

  const scale = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const glowOpacity = React.useRef(new Animated.Value(0.3)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.01, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: -2, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 250, useNativeDriver: true })
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.3, duration: 250, useNativeDriver: true })
    ]).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={animateIn}
      onPressOut={animateOut}
      {...(Platform.OS === 'web' ? { onHoverIn: animateIn, onHoverOut: animateOut } : {})}
      style={[
        styles.cardContainer,
        { transform: [{ scale }, { translateY }] }
      ]}
    >
      {/* Glow Layer */}
      <Animated.View style={[styles.glowLayer, { opacity: glowOpacity, shadowColor: statusColor }]} />

      {/* Base Glass Layer */}
      <View style={styles.glassContainer}>
        {Platform.OS === 'web' ? (
          <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,25,22,0.7)', backdropFilter: 'blur(20px)' } as any]} />
        ) : (
          <BlurView intensity={25} tint="dark" style={styles.absoluteFill} />
        )}

        {/* Gradients */}
        <LinearGradient
          colors={['rgba(20,25,22,0.9)', 'rgba(24,20,28,0.88)', 'rgba(10,15,12,0.85)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(120, 255, 180, 0.08)', 'transparent', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.absoluteFill}
        />

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{extractName(item.url)}</Text>
              <View style={[styles.statusPill, {
                backgroundColor: isActive ? 'rgba(0,255,150,0.08)' : 'rgba(150,150,150,0.08)',
                borderColor: isActive ? 'rgba(0,255,150,0.2)' : 'rgba(150,150,150,0.2)'
              }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusPillText, { color: statusColor }]}>
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
            <Text style={[styles.metricValue, { color: statusColor }]}>
              {successRateStr}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>LAST DELIVERY</Text>
              <Text style={styles.footerValuePrimary}>
                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2m 14s ago'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
});

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
        setSubscriptions((prev: any[]) => [...prev, ...(data || [])]);
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

  const renderCard = ({ item }: any) => {
    let successRateStr = '-- %';
    if (item._count && item._count.deliveries > 0) {
      const total = item._count.deliveries;
      const fails = item.failCount || 0;
      successRateStr = ((1 - fails / total) * 100).toFixed(2) + '%';
    }

    return (
      <SubscriptionCard
        item={item}
        successRateStr={successRateStr}
        onPress={() => navigation.navigate('SubscriptionDetails', { subscriptionId: item.id })}
      />
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
                placeholder="Search by endpoint name or dest..."
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
  headerTitle: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  searchBtnTop: { padding: 4 },
  center: { alignItems: 'center', justifyContent: 'center' },

  pageHeader: { marginBottom: spacing.md, marginTop: spacing.xs },
  pageTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 2, fontSize: 22 },
  pageSubtitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg, fontSize: 14 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#181C1A',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: 10
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 16, color: '#FFFFFF', padding: 0 },

  list: { paddingHorizontal: spacing.xl, paddingBottom: 140, paddingTop: spacing.xs },

  cardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 8,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  glassContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    padding: spacing.lg,
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitle: {
    ...typography.bodyBold, color: 'rgba(255,255,255,0.9)', fontSize: 17,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { ...typography.small, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 13 },

  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  infinityIcon: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '800' },
  cardUrl: {
    ...typography.small, color: 'rgba(255,255,255,0.6)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1, fontSize: 13, letterSpacing: 0.5
  },

  statsSection: { marginBottom: spacing.md },
  metricValue: {
    ...typography.h3, fontWeight: '700', marginTop: 2, letterSpacing: -0.5, fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },

  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 },
  footerItem: { gap: 2 },
  footerLabel: { ...typography.captionBold, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 },
  footerValuePrimary: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 14 },

  listFooter: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl, paddingBottom: 60 },
  footerIconContainer: { marginBottom: 16, opacity: 0.8 },
  listFooterText: { ...typography.caption, color: '#8A9A8E', textAlign: 'center', fontSize: 13 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },

  fab: { position: 'absolute', bottom: 90, right: spacing.xl, ...shadows.glow },
  fabInner: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
