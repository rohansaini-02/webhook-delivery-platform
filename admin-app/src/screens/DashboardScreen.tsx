import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform, Dimensions, Animated, Easing, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Star, CheckCircle, AlertTriangle, Inbox, ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchMetrics, fetchDeliveries } from '../services/api';
import UserAvatar from '../components/UserAvatar';

const { width } = Dimensions.get('window');

const AnimatedBar = ({ height, delay, percentage }: { height: number, delay: number, percentage: number }) => {
  const animHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (percentage > 0) {
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
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [height, percentage]);

  if (percentage === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1, height: 100 }} />
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
      <Animated.Text style={[styles.chartPercText, { opacity }]}>
        {percentage}%
      </Animated.Text>
      <View style={styles.chartBarWrapper}>
        <Animated.View style={[styles.chartBar, { height: animHeight }]} />
      </View>
    </View>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassSubCard = ({ label, value, subInfo, subInfoColor, icon: Icon, color }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.02, useNativeDriver: true }),
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
      onPressIn={animateIn}
      onPressOut={animateOut}
      style={[styles.gridCardContainer, { transform: [{ scale }, { translateY }] }]}
    >
      <Animated.View style={[styles.glowLayer, { opacity: glowOpacity, shadowColor: color }]} />
      <View style={styles.glassInner}>
        {Platform.OS === 'web' ? (
          <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,25,22,0.7)', backdropFilter: 'blur(20px)' } as any]} />
        ) : (
          <BlurView intensity={20} tint="dark" style={styles.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(25,30,28,0.9)', 'rgba(15,18,17,0.85)']}
          style={styles.absoluteFill}
        />
        <View style={styles.subCardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>{label}</Text>
            <Icon size={14} color={color} />
          </View>
          <Text style={styles.hugeMetricLeft}>{value}</Text>
          <Text style={[styles.metricSubInfo, { color: subInfoColor }]}>{subInfo}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const GlassSection = ({ children, title, subtitle, showHeader = true, style }: any) => {
  return (
    <View style={[styles.sectionWrapper, style]}>
      {Platform.OS === 'web' ? (
        <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,25,22,0.6)', backdropFilter: 'blur(25px)', borderRadius: 16 } as any]} />
      ) : (
        <BlurView intensity={15} tint="dark" style={[styles.absoluteFill, { borderRadius: 16 }]} />
      )}
      <LinearGradient
        colors={['rgba(25,30,28,0.8)', 'rgba(10,12,11,0.9)']}
        style={[styles.absoluteFill, { borderRadius: 16 }]}
      />
      <View style={styles.sectionInner}>
        {showHeader && (
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={[styles.dotLegend, { backgroundColor: '#4ADE80' }]} />
              <View style={[styles.dotLegend, { backgroundColor: '#A78BFA' }]} />
            </View>
          </View>
        )}
        {children}
      </View>
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

  const chartBars = metrics?.chartData || [0, 0, 0, 0, 0, 0, 0];
  const maxChartValue = Math.max(...chartBars, 1);
  const chartDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <UserAvatar size={30} />
          <Text style={styles.headerTitleText}>Dashboard</Text>
        </View>
      </View>

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top 2x2 Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <GlassSubCard 
              label="TOTAL EVENTS" 
              value={m.events} 
              subInfo="+12.5% from peak" 
              subInfoColor="#4ADE80" 
              icon={Star} 
              color="#4ADE80" 
            />
            <GlassSubCard 
              label="SUCCESSFUL" 
              value={m.success} 
              subInfo="98.2% avg" 
              subInfoColor="#4ADE80" 
              icon={CheckCircle} 
              color="#4ADE80" 
            />
          </View>

          <View style={styles.gridRow}>
            <GlassSubCard 
              label="FAILED" 
              value={m.failed} 
              subInfo="-5% from avg" 
              subInfoColor="#F87171" 
              icon={AlertTriangle} 
              color="#F87171" 
            />
            <GlassSubCard 
              label="DLQ COUNT" 
              value={m.dlq} 
              subInfo="Pending action" 
              subInfoColor={colors.textSecondary} 
              icon={Inbox} 
              color="#A78BFA" 
            />
          </View>
        </View>

        {/* System Throughput */}
        <GlassSection 
          title="System Throughput" 
          subtitle="WEEKLY PROCESSING TRENDS"
        >
          <View style={styles.chartWrapper}>
            {chartBars.map((h: number, i: number) => {
              const percentage = Math.round((h / maxChartValue) * 100);
              const barHeight = (h / maxChartValue) * 80;
              return (
                <View key={i} style={styles.chartCol}>
                  <AnimatedBar height={barHeight} percentage={percentage} delay={i * 70} />
                  <Text style={styles.chartDayText}>{chartDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </GlassSection>

        {/* Recent Deliveries */}
        <GlassSection 
          title="Recent Deliveries" 
          subtitle="LIVE INGEST MONITORING"
          style={{ marginTop: spacing.md }}
        >
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
              let statusBg = 'rgba(167,139,250,0.1)';
              if (delivery.status === 'SUCCESS') { statusColor = '#4ADE80'; statusBg = 'rgba(74,222,128,0.1)'; }
              else if (delivery.status === 'FAILED' || delivery.status === 'DLQ') { statusColor = '#F87171'; statusBg = 'rgba(248,113,113,0.1)'; }

              return (
                <TouchableOpacity
                  key={delivery.id}
                  style={[styles.streamItem, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}
                  onPress={() => handleLogPress(delivery.id)}
                >
                  <View style={styles.streamLeft}>
                    <Text style={styles.streamIdText}>{delivery.event?.id?.substring(0, 12)}</Text>
                    <Text style={styles.streamNameText}>{delivery.event?.type}</Text>
                  </View>
                  <View style={styles.streamRight}>
                    <View style={[styles.statusPillSmall, { backgroundColor: statusBg, borderColor: statusColor + '20' }]}>
                      <Text style={[styles.statusPillTextSmall, { color: statusColor }]}>{delivery.status}</Text>
                    </View>
                    <Text style={styles.streamTimeText}>{timeStr}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity style={styles.viewAllDarkBtn} onPress={() => navigation.getParent()?.navigate('Logs')}>
            <Text style={styles.viewAllDarkBtnText}>VIEW ALL STREAMS</Text>
            <ChevronRight size={14} color="#4ADE80" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </GlassSection>

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
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, padding: 0, fontSize: 16 },

  gridContainer: { marginHorizontal: spacing.xl, marginBottom: spacing.md, gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  
  gridCardContainer: {
    flex: 1,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  glassInner: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  subCardContent: {
    padding: spacing.md,
    paddingVertical: spacing.lg,
  },
  absoluteFill: { ...StyleSheet.absoluteFillObject },

  sectionWrapper: {
    marginHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  sectionInner: {
    padding: spacing.lg,
  },

  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardHeaderLabel: { ...typography.captionBold, color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 1.5 },
  hugeMetricLeft: { fontWeight: '800', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 2 },
  metricSubInfo: { ...typography.caption, fontSize: 13, fontWeight: '600' },

  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  sectionTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 17, marginBottom: 2 },
  sectionSubtitle: { ...typography.captionBold, color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1.5 },
  dotLegend: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingHorizontal: spacing.sm, paddingTop: spacing.md },
  chartCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', height: '100%' },
  chartBarWrapper: { width: 14, height: 80, justifyContent: 'flex-end', alignItems: 'center' },
  chartBar: { 
    width: 14, 
    backgroundColor: '#4ADE80', 
    borderRadius: 20,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  chartDayText: { ...typography.captionBold, color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 8 },
  chartPercText: { ...typography.captionBold, color: '#4ADE80', fontSize: 10, letterSpacing: 0.5, marginBottom: 4 },

  streamList: { marginTop: spacing.md },
  streamItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  streamLeft: { flex: 1 },
  streamIdText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 4 },
  streamNameText: { ...typography.caption, color: 'rgba(255,255,255,0.5)', fontSize: 13 },

  streamRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusPillSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginBottom: 4 },
  statusPillTextSmall: { ...typography.captionBold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  streamTimeText: { ...typography.caption, color: 'rgba(255,255,255,0.4)', fontSize: 13 },

  viewAllDarkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    paddingVertical: 14, marginTop: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  viewAllDarkBtnText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 13, letterSpacing: 1 },
  emptyState: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  emptyStateText: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xxl },
});
