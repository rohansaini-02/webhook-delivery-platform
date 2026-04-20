import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, Platform, TextInput, ScrollView
} from 'react-native';
import { User, Search, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw, ChevronRight } from 'lucide-react-native';
import { fetchDeliveries, fetchEventTypes } from '../services/api';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import UserAvatar from '../components/UserAvatar';
import FilterPicker from '../components/FilterPicker';

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
      // Always include test.dlq if not present for discovery
      if (!types.includes('test.dlq')) types.push('test.dlq');
      setEventTypes(types);
    } catch (e) {
      console.error('Fetch types error:', e);
    }
  };

  useEffect(() => { 
    loadData();
    loadTypes();
  }, [loadData]);

  useEffect(() => {
    if (route.params?.status) {
      setActiveStatusFilter(route.params.status);
    }
  }, [route.params?.status]);

  const filteredLogs = logs.filter((log: any) => {
    // 1. Status Filter
    if (activeStatusFilter !== 'All') {
      if (log.status !== activeStatusFilter.toUpperCase()) return false;
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
            value={activeStatusFilter === 'All' ? 'All' : activeStatusFilter}
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
          
          let statusColor = colors.primary;
          let statusBg = 'rgba(74,222,128,0.1)';
          let statusText = log.status;
          let statusCode = log.lastStatusCode ? `${log.lastStatusCode} OK` : '---';

          if (log.status === 'SUCCESS') { 
            statusColor = colors.success; 
            statusBg = 'rgba(0,230,118,0.1)';
            statusCode = `${log.lastStatusCode || 200} OK`;
          } else if (log.status === 'FAILED' || log.status === 'DLQ') { 
            statusColor = colors.error; 
            statusBg = 'rgba(255,82,82,0.1)';
            statusCode = `${log.lastStatusCode || 500} ERROR`;
          } else if (log.status === 'RETRYING' || log.status === 'PENDING') {
            statusColor = colors.warning; 
            statusBg = 'rgba(255,179,0,0.1)';
            statusCode = log.lastStatusCode ? `${log.lastStatusCode} RETRY` : 'WAITING';
          }

          return (
            <TouchableOpacity key={log.id} activeOpacity={0.8} style={[styles.logCard, { borderLeftColor: statusColor }]} onPress={() => handleLogPress(log.id)}>
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.eventType} numberOfLines={1}>{log.event?.type}</Text>
                  <Text style={styles.eventId}>{log.id.substring(0, 16).toUpperCase()}</Text>
                </View>
                <View style={styles.timeSection}>
                  <Text style={styles.timeText}>{timeStr}</Text>
                  <Text style={styles.dateText}>{dateStr}</Text>
                </View>
              </View>

              <View style={styles.cardBotRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
                  <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]}/>
                    <Text style={[styles.statusPillText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                  <Text style={[styles.statusCodeText, { color: statusColor }]}>{statusCode}</Text>
                </View>
                
                <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.sm}}>
                  <Text style={styles.retriesText}>{log.attempts ? log.attempts - 1 : 0} retries</Text>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredLogs.length === 0 && (
           <Text style={{color: colors.textMuted, textAlign: 'center', marginTop: 40}}>No logs found matching your criteria.</Text>
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
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 60, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerTitleText: { ...typography.h3, color: colors.primary, fontWeight: '700' },
  
  stickyHeader: { 
    backgroundColor: colors.bg, 
    borderBottomWidth: 1, 
    borderColor: colors.border,
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
  
  logCard: { 
    padding: spacing.lg, 
    borderRadius: borderRadius.md, 
    backgroundColor: colors.bgElevated, 
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: colors.borderCard
  },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  eventType: { ...typography.bodyBold, color: '#FFFFFF', marginBottom: 2 },
  eventId: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 13, letterSpacing: 1 },
  
  timeSection: { alignItems: 'flex-end' },
  timeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  dateText: { ...typography.small, color: colors.textMuted, marginTop: 2 },

  cardBotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statusPillText: { ...typography.captionBold, letterSpacing: 0.5, textTransform: 'uppercase' },
  statusCodeText: { ...typography.captionBold, marginLeft: 2 },
  retriesText: { ...typography.small, color: colors.textMuted, fontWeight: '500' },

  loadMoreBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 14, borderRadius: borderRadius.pill, backgroundColor: '#181C1A', 
    marginTop: spacing.md, borderWidth: 1, borderColor: colors.border
  },
  loadMoreText: { ...typography.captionBold, color: colors.textSecondary }
});
 
 
