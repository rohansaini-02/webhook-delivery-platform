import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform, Dimensions, Animated, Easing
} from 'react-native';
import { User, Search, Star, CheckCircle, AlertTriangle, Inbox } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchMetrics, fetchDeliveries } from '../services/api';
import UserAvatar from '../components/UserAvatar';

const { width } = Dimensions.get('window');

const AnimatedBar = ({ height, isLatest, delay, percentage }: { height: number, isLatest: boolean, delay: number, percentage: number }) => {
  const animHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animHeight.setValue(0);
    opacity.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animHeight, {
          toValue: height,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
      ]),
    ]).start();
  }, [height]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
      <Animated.Text style={[styles.chartPercText, { opacity }, isLatest && { color: '#4ADE80' }]}>
        {percentage}%
      </Animated.Text>
      <Animated.View style={[styles.chartBar, { height: animHeight }, isLatest && { backgroundColor: '#4ADE80' }]} />
    </View>
  );
};

export default function DashboardScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Set up 15s polling for dashboard metrics
    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, deliveriesRes] = await Promise.all([
        fetchMetrics(),
        fetchDeliveries()
      ]);
      setMetrics(metricsRes.data.data);
      setRecentDeliveries(deliveriesRes.data.data?.slice(0, 5) || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPress = (id: string) => {
    navigation.navigate('EventDetails', { deliveryId: id });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const t = metrics?.totals;
  const s = metrics?.deliveryStatuses;
  const successRate = t?.deliveries > 0 ? ((s?.success / t?.deliveries) * 100).toFixed(1) + '%' : '0.0%';

  const m = {
    events: t?.events?.toString() || "0",
    success: successRate,
    failed: s?.failed?.toString() || "0",
    dlq: s?.dlq?.toString() || "0",
  };

  const chartBars = metrics?.chartData || [0, 0, 0, 0, 0, 0, 0]; // Heights for past 7 days
  const maxChartValue = Math.max(...chartBars, 1); // Avoid division by zero
  const today = new Date().getDay();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const chartDays = Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <UserAvatar size={30} />
          <Text style={styles.headerTitleText}>Dashboard</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Search Input */}
        <View style={styles.searchWrap}>
          <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search event IDs or types..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Top 2x2 Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {/* TOTAL EVENTS */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>TOTAL EVENTS</Text>
                <Star size={12} color="#4ADE80" />
              </View>
              <Text style={styles.hugeMetricLeft}>{m.events}</Text>
              <Text style={[styles.metricSubInfo, { color: '#4ADE80' }]}>+12.5% from peak</Text>
            </View>

            {/* SUCCESSFUL */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>SUCCESSFUL</Text>
                <CheckCircle size={12} color="#4ADE80" />
              </View>
              <Text style={styles.hugeMetricLeft}>{m.success}</Text>
              <View style={{ height: 3, backgroundColor: '#4ADE80', borderRadius: 2, marginTop: 10, width: '90%' }} />
            </View>
          </View>

          <View style={styles.gridRow}>
            {/* FAILED */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>FAILED</Text>
                <AlertTriangle size={12} color="#F87171" />
              </View>
              <Text style={styles.hugeMetricLeft}>{m.failed}</Text>
              <Text style={[styles.metricSubInfo, { color: '#F87171' }]}>-5% from avg</Text>
            </View>

            {/* DLQ COUNT */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>DLQ COUNT</Text>
                <Inbox size={12} color="#A78BFA" />
              </View>
              <Text style={styles.hugeMetricLeft}>{m.dlq}</Text>
              <Text style={[styles.metricSubInfo, { color: colors.textSecondary }]}>Pending action</Text>
            </View>
          </View>
        </View>

        {/* System Throughput */}
        <View style={styles.cardSection}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>System Throughput</Text>
              <Text style={styles.sectionSubtitle}>LAST 7 DAYS ACTIVE PROCESSING</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={[styles.dotLegend, { backgroundColor: '#4ADE80' }]} />
              <View style={[styles.dotLegend, { backgroundColor: '#A78BFA' }]} />
            </View>
          </View>

          <View style={styles.chartWrapper}>
            {chartBars.map((h: number, i: number) => {
              const isLatest = i === 6; // index 6 is today
              const percentage = Math.round((h / maxChartValue) * 100);
              // Max height is ~80px for the visual chart bar
              const barHeight = h === 0 ? 4 : Math.max(4, (h / maxChartValue) * 80);
              return (
                <View key={i} style={styles.chartCol}>
                  <AnimatedBar height={barHeight} isLatest={isLatest} percentage={percentage} delay={i * 70} />
                  <Text style={[styles.chartDayText, isLatest && { color: '#4ADE80', marginTop: 8 }]}>{chartDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Recent Deliveries</Text>
          <Text style={styles.sectionSubtitle}>LIVE INGEST MONITORING</Text>

          <View style={styles.streamList}>
            {recentDeliveries.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 20 }}>No deliveries recorded today.</Text>
            ) : null}
            {recentDeliveries.filter(d => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return d.event?.type?.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
            }).map((delivery, index, filteredArr) => {
              const isLast = index === filteredArr.length - 1;
              const date = new Date(delivery.createdAt);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              let statusColor = '#A78BFA';
              let statusBg = 'rgba(167,139,250,0.15)';
              if (delivery.status === 'SUCCESS') { statusColor = '#4ADE80'; statusBg = 'rgba(74,222,128,0.15)'; }
              else if (delivery.status === 'FAILED' || delivery.status === 'DLQ') { statusColor = '#F87171'; statusBg = 'rgba(248,113,113,0.15)'; }

              return (
                <TouchableOpacity
                  key={delivery.id}
                  style={[styles.streamItem, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}
                  onPress={() => handleLogPress(delivery.id)}
                >
                  {delivery.status === 'RETRYING' && (
                    <View style={{ position: 'absolute', left: -16, top: 0, bottom: 0, width: 2, backgroundColor: '#A78BFA' }} />
                  )}
                  <View style={styles.streamLeft}>
                    <Text style={styles.streamIdText}>{delivery.event?.id?.substring(0, 12)}</Text>
                    <Text style={styles.streamNameText}>{delivery.event?.type}</Text>
                  </View>
                  <View style={styles.streamRight}>
                    <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusPillText, { color: statusColor }]}>{delivery.status}</Text>
                    </View>
                    <Text style={styles.streamTimeText}>{timeStr}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* View All Streams Footer */}
          <TouchableOpacity style={styles.viewAllDarkBtn} onPress={() => navigation.getParent()?.navigate('Logs')}>
            <Text style={styles.viewAllDarkBtnText}>VIEW ALL STREAMS</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 80 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 167, 38, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  searchBtn: { padding: 4 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)'
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: 4 },

  gridContainer: { marginHorizontal: spacing.xl, marginBottom: spacing.xl, gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  gridCard: { flex: 1, backgroundColor: '#141718', borderRadius: borderRadius.md, padding: spacing.md, paddingVertical: spacing.lg },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardHeaderLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 13, letterSpacing: 1 },
  hugeMetricLeft: { fontWeight: '800', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 2 },
  metricSubInfo: { ...typography.caption, fontSize: 14 },

  cardSection: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.lg, marginBottom: spacing.md },

  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  sectionTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16, marginBottom: 2 },
  sectionSubtitle: { ...typography.captionBold, color: colors.textMuted, fontSize: 12, letterSpacing: 1 },
  dotLegend: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingHorizontal: spacing.sm, paddingTop: spacing.md },
  chartCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', height: '100%' },
  chartBar: { width: 22, backgroundColor: '#333A36', borderRadius: 4 },
  chartDayText: { ...typography.captionBold, color: colors.textMuted, fontSize: 12, marginTop: 8 },
  chartPercText: { ...typography.captionBold, color: colors.textMuted, fontSize: 10, letterSpacing: 0, marginBottom: 4 },

  streamList: { marginTop: spacing.lg },
  streamItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.lg, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#1F2422' },
  streamLeft: { flex: 1 },
  streamIdText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#FFFFFF', fontSize: 15, marginBottom: 4 },
  streamNameText: { ...typography.caption, color: colors.textSecondary },

  streamRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  statusPillText: { ...typography.captionBold, fontSize: 12, letterSpacing: 0.5 },
  streamTimeText: { ...typography.caption, color: colors.textSecondary, fontSize: 14 },

  viewAllDarkBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0A0D0C', borderRadius: borderRadius.md,
    paddingVertical: 14, marginTop: spacing.md
  },
  viewAllDarkBtnText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 14, letterSpacing: 0.5 },
  emptyState: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  emptyStateText: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xxl },
});



