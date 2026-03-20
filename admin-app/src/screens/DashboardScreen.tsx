import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, Dimensions, Animated, Easing
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, Clock, RefreshCw, Package, TrendingUp, AlertTriangle, BarChart2, Inbox, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchMetrics, fetchDeliveries } from '../services/api';
import SearchBar from '../components/SearchBar';

interface MetricsData {
  totals: { subscriptions: number; events: number; deliveries: number };
  deliveryStatuses: { success: number; failed: number; pending: number; retrying: number };
}

export default function DashboardScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values for the dynamic chart
  const growAnim = React.useRef(new Animated.Value(0)).current;

  // Filter the recent activity list
  const filteredActivity = recentActivity.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.event?.type?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.subscription?.url?.toLowerCase().includes(q)
    );
  });

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

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // Trigger chart animation every time dashboard fetches data successfully
  useEffect(() => {
    if (!loading && metrics) {
      growAnim.setValue(0);
      Animated.timing(growAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    }
  }, [loading, metrics]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const getStatusIcon = (status: string, size: number = 20, color: string = colors.textPrimary) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle size={size} color={color} />;
      case 'FAILED': return <XCircle size={size} color={color} />;
      case 'PENDING': return <Clock size={size} color={color} />;
      case 'RETRYING': return <RefreshCw size={size} color={color} />;
      default: return <Package size={size} color={color} />;
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
      {/* Background ambient glow effect */}
      <View style={styles.ambientGlow} />

      {/* Fixed Sticky Header */}
      <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>System performance & deliveries</Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events, logs, or webhooks..."
          />
        </View>
      </BlurView>
      
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity activeOpacity={0.8} style={{ width: '47%' }} onPress={() => navigation.navigate('LogsStack', { screen: 'DeliveryLogs', params: { initialFilter: 'ALL' } })}>
            <GlassCard style={styles.glowInfo} intensity={25}>
              <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: colors.info }]}>Total Events</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.info + '20' }]}>
                  <TrendingUp size={18} color={colors.info} />
                </View>
              </View>
              <Text style={styles.metricValue}>{metrics?.totals.events?.toLocaleString() || '0'}</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={{ width: '47%' }} onPress={() => navigation.navigate('LogsStack', { screen: 'DeliveryLogs', params: { initialFilter: 'SUCCESS' } })}>
            <GlassCard style={styles.glowSuccess} intensity={25}>
              <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: colors.success }]}>Successful</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                  <CheckCircle size={18} color={colors.success} />
                </View>
              </View>
              <Text style={styles.metricValue}>{metrics?.deliveryStatuses.success?.toLocaleString() || '0'}</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={{ width: '47%' }} onPress={() => navigation.navigate('LogsStack', { screen: 'DeliveryLogs', params: { initialFilter: 'FAILED' } })}>
            <GlassCard style={styles.glowError} intensity={25}>
              <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: colors.error }]}>Failed</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.error + '20' }]}>
                  <XCircle size={18} color={colors.error} />
                </View>
              </View>
              <Text style={styles.metricValue}>{metrics?.deliveryStatuses.failed?.toLocaleString() || '0'}</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={{ width: '47%' }} onPress={() => navigation.navigate('DLQTab')}>
            <GlassCard style={styles.glowWarning} intensity={25}>
              <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: colors.warning }]}>DLQ Count</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.warning + '20' }]}>
                  <AlertTriangle size={18} color={colors.warning} />
                </View>
              </View>
              <Text style={styles.metricValue}>{dlqCount.toLocaleString()}</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Dynamic Delivery Trends Chart */}
        <GlassCard intensity={20}>
          <View style={styles.chartTitleRow}>
            <View style={styles.iconBoxPrimary}>
              <BarChart2 size={20} color={colors.primary} />
            </View>
            <Text style={styles.chartTitle}>Delivery Trends (7 Days)</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBar}>
              {[120, 80, 110, 90, 85, 78, 60].map((h, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <Animated.View style={[styles.chartBarFillWrapper, { height: growAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h]}) }]}>
                     <LinearGradient 
                       colors={['#A855F7', colors.primarySoft]} 
                       style={styles.chartBarFill} 
                     />
                  </Animated.View>
                  <Text style={styles.chartBarLabel}>{['M','T','W','T','F','S','S'][i]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Deliveries Sent</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {filteredActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={40} color={colors.border} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          ) : (
            filteredActivity.map((item: any, index: number) => (
              <GlassCard key={item.id || index} intensity={15} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  {getStatusIcon(item.status, 20, getStatusColor(item.status))}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {item.event?.type || 'Webhook'} Delivery
                  </Text>
                  <Text style={styles.activityMeta}>
                    {item.subscription?.url ? new URL(item.subscription.url).hostname : 'Unknown'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.activityTime}>
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  ambientGlow: {
    position: 'absolute', top: -150, left: -50, width: width + 100, height: 300,
    backgroundColor: colors.primary, opacity: 0.15, borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    zIndex: 10,
    paddingBottom: spacing.sm,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  glowInfo: { shadowColor: colors.info, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  glowSuccess: { shadowColor: colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  glowError: { shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  glowWarning: { shadowColor: colors.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  metricLabel: { ...typography.captionBold, opacity: 0.9 },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricValue: { ...typography.h1, color: colors.textPrimary },
  chartCard: {
    borderRadius: borderRadius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    ...shadows.card,
  },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  iconBoxPrimary: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  chartTitle: { ...typography.h3, color: colors.textPrimary },
  chartPlaceholder: { alignItems: 'center' },
  chartBar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', height: 140, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  chartBarCol: { alignItems: 'center', width: 34, justifyContent: 'flex-end' },
  chartBarFillWrapper: { width: '100%', overflow: 'hidden', borderRadius: 6, opacity: 0.9 },
  chartBarFill: { width: '100%', height: '100%' },
  chartBarLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  chartLegend: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...typography.caption, color: colors.textSecondary },
  activitySection: {
    marginTop: spacing.xl,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  activityItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, marginBottom: spacing.sm,
    // Removed old border mapping since GlassCard handles it automatically
  },
  activityIconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  activityContent: { flex: 1 },
  activityTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 2 },
  activityMeta: { ...typography.caption, color: colors.textSecondary },
  activityTime: { ...typography.small, color: colors.textMuted, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { ...typography.small, fontWeight: '700', fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, backgroundColor: colors.bgCard, borderRadius: borderRadius.lg },
  emptyText: { ...typography.body, color: colors.textMuted },
});
