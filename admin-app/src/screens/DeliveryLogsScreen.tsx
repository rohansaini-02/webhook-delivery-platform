import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, Platform, TextInput, ScrollView,
  Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Search, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw, ChevronRight } from 'lucide-react-native';
import { fetchDeliveries, fetchEventTypes } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import UserAvatar from '../components/UserAvatar';
import FilterPicker from '../components/FilterPicker';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LogCard = React.memo(({ log, timeStr, dateStr, statusColor, statusBg, statusBorder, statusText, statusCode, onPress }: any) => {
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
        styles.logCardContainer,
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
          <BlurView intensity={20} tint="dark" style={styles.absoluteFill} />
        )}
        
        {/* Gradients */}
        <LinearGradient
          colors={['rgba(25,30,28,0.9)', 'rgba(15,18,17,0.85)']}
          style={styles.absoluteFill}
        />
        
        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventType} numberOfLines={1}>{log.event?.type}</Text>
              <Text style={styles.eventId}>{log.id.substring(0, 16).toUpperCase()}</Text>
            </View>
            <View style={styles.timeSection}>
              <Text style={styles.timeText}>{timeStr}</Text>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
          </View>

          <View style={styles.cardBotRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={[styles.statusPill, { backgroundColor: statusBg, borderColor: statusBorder }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor, shadowColor: statusColor, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }]} />
                <Text style={[styles.statusPillText, { color: statusColor }]}>{statusText}</Text>
              </View>
              <Text style={[styles.statusCodeText, { color: statusColor }]}>{statusCode}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={styles.retriesText}>{log.attempts ? log.attempts - 1 : 0} retries</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
});

export default function DeliveryLogsScreen({ route, navigation }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [activeEventFilter, setActiveEventFilter] = useState('All');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadData = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await fetchDeliveries(cursor);
      const { data, pagination } = res.data;

      if (cursor) {
        setLogs(prev => [...prev, ...(data || [])]);
      } else {
        setLogs(data || []);
      }

      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasMore || false);
    } catch (e) {
      console.error('Deliveries load error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  const loadTypes = async () => {
    try {
      const res = await fetchEventTypes();
      const types = res.data.data || [];

      setEventTypes(types);
    } catch (e) {
      console.error('Fetch types error:', e);
    }
  };

  useEffect(() => {
    loadData();
    loadTypes();
  }, [loadData]);

  const filteredLogs = logs.filter((log: any) => {
    // 1. Status Filter
    if (activeStatusFilter !== 'All') {
      const logStatus = log.status;
      const filterStatus = activeStatusFilter.toUpperCase();
      
      // If user filters for FAILED, show both FAILED and DLQ
      if (filterStatus === 'FAILED') {
        if (logStatus !== 'FAILED' && logStatus !== 'DLQ') return false;
      } else {
        if (logStatus !== filterStatus) return false;
      }
    }
    // 2. Event Type Filter
    if (activeEventFilter !== 'All') {
      if (log.event?.type !== activeEventFilter) return false;
    }
    // 3. Search Query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return log.id.toLowerCase().includes(q) || log.subscription?.url?.toLowerCase().includes(q);
  });

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadData(nextCursor);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '#4ADE80';
      case 'FAILED': return '#F87171';
      case 'PENDING': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const handleLogPress = (id: string) => {
    navigation.navigate('EventDetails', { deliveryId: id });
  };

  const payloadPreview = `{
  "id": "sub_1NzH9fL2uY8zQ8W2a4",
  "object": "subscription",
  "customer": "cus_OnUeBpLpZ4V2",
  "status": "active",
  "items": {
    "data": [
      { "id": "si_PnMB9z", "plan": "gold_tier" }
    ]
  }
}`;

  return (
    <View style={styles.container}>
      {/* Background with Dark Gradient and Diffusion Spots */}
      <LinearGradient
        colors={['#101512', '#0A0E11', '#060907']}
        style={StyleSheet.absoluteFill}
      />


      {/* Sticky Header Section */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <UserAvatar size={30} />
            <Text style={styles.headerTitleText}>Logs</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Search size={14} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by ID or URL..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterControlsRow}>
          <FilterPicker
            label="Status"
            value={activeStatusFilter}
            options={['All', 'SUCCESS', 'FAILED', 'PENDING']}
            onSelect={setActiveStatusFilter}
          />
          <FilterPicker
            label="Type"
            value={activeEventFilter}
            options={['All', ...eventTypes]}
            onSelect={setActiveEventFilter}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredLogs.map(log => {
          const timeStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

          let statusColor = '#4ADE80';
          let statusBg = 'rgba(0,255,150,0.08)';
          let statusBorder = 'rgba(0,255,150,0.2)';
          let statusText = log.status;
          let statusCode = log.lastStatusCode ? `${log.lastStatusCode} OK` : '---';

          if (log.status === 'SUCCESS') {
            statusColor = '#4ADE80';
            statusBg = 'rgba(0,255,150,0.08)';
            statusBorder = 'rgba(0,255,150,0.2)';
            statusCode = `${log.lastStatusCode || 200} OK`;
          } else if (log.status === 'FAILED' || log.status === 'DLQ') {
            statusColor = '#FF5252';
            statusBg = 'rgba(255,82,82,0.08)';
            statusBorder = 'rgba(255,82,82,0.2)';
            statusCode = `${log.lastStatusCode || 500} ERROR`;
          } else if (log.status === 'RETRYING' || log.status === 'PENDING') {
            statusColor = '#FFB300';
            statusBg = 'rgba(255,179,0,0.08)';
            statusBorder = 'rgba(255,179,0,0.2)';
            statusCode = log.lastStatusCode ? `${log.lastStatusCode} RETRY` : 'WAITING';
          }

          return (
            <LogCard
              key={log.id}
              log={log}
              timeStr={timeStr}
              dateStr={dateStr}
              statusColor={statusColor}
              statusBg={statusBg}
              statusBorder={statusBorder}
              statusText={statusText}
              statusCode={statusCode}
              onPress={() => handleLogPress(log.id)}
            />
          );
        })}

        {filteredLogs.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>No logs found matching your criteria.</Text>
        )}

        {hasMore && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.loadMoreBtn, loadingMore && { opacity: 0.7 }]}
            onPress={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <RotateCcw size={14} color={colors.textSecondary} />
                <Text style={styles.loadMoreText}>Load Previous Logs</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  lightSpot: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 255, 150, 0.04)',
    ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}),
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 60, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },

  stickyHeader: {
    backgroundColor: 'rgba(10, 14, 11, 0.85)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    paddingBottom: spacing.lg,
    zIndex: 10
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: colors.border
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: '#FFFFFF', padding: 0, fontSize: 16 },

  filterControlsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    gap: spacing.md
  },

  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },

  logCardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  glowLayer: {
    display: 'none',
  },
  glassContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    padding: spacing.lg,
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  eventType: { 
    ...typography.bodyBold, color: 'rgba(255,255,255,0.9)', fontSize: 17, marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  eventId: { 
    ...typography.small, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },

  timeSection: { alignItems: 'flex-end' },
  timeText: { 
    ...typography.bodyBold, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(255,255,255,0.9)', fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  dateText: { 
    ...typography.small, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontSize: 14, letterSpacing: 0.5,
  },

  cardBotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  statusPill: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { ...typography.small, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 13 },
  statusCodeText: { 
    ...typography.bodyBold, marginLeft: -4, fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  retriesText: { ...typography.small, color: 'rgba(255,255,255,0.6)', fontWeight: '500', fontSize: 14, letterSpacing: 0.5 },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 14, borderRadius: borderRadius.pill, backgroundColor: '#181C1A',
    marginTop: spacing.md, borderWidth: 1, borderColor: colors.border
  },
  loadMoreText: { ...typography.captionBold, color: colors.textSecondary }
});
