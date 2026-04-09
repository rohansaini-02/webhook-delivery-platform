import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, Platform, TextInput, ScrollView
} from 'react-native';
import { User, Search, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react-native';
import { fetchDeliveries } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function DeliveryLogsScreen({ route }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('sub_1NzH9fL2uY8zQ8W2a4');

  const loadData = useCallback(async () => {
    try {
      const res = await fetchDeliveries();
      setLogs(res.data.data || []);
    } catch (e) {
      console.error('Deliveries load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredLogs = logs.filter((log: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return log.event?.type?.toLowerCase().includes(q) || log.subscription?.url?.toLowerCase().includes(q) || log.id.toLowerCase().includes(q);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '#4ADE80';
      case 'FAILED': return '#F87171';
      case 'PENDING': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { borderColor: '#3B82F6', borderWidth: 1 }]}>
             <User size={16} color="#3B82F6" />
          </View>
          <Text style={styles.headerTitleText}>The Orchestrator</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Search size={14} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput 
          placeholder="Search logs..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={styles.filterChipTextActive}>Status: All</Text>
          <ChevronDown size={12} color="#4ADE80" style={{marginLeft: 4}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Today</Text>
          <Calendar size={12} color={colors.textSecondary} style={{marginLeft: 4}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Type</Text>
          <Filter size={12} color={colors.textSecondary} style={{marginLeft: 4}} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        
        {/* Card 1 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.eventType}>checkout.session.completed</Text>
            <Text style={styles.timeText}>14:22:31</Text>
          </View>
          <View style={styles.cardMidRow}>
            <Text style={styles.eventId}>evt_1MzI8FL2uY8zQ8W2z9</Text>
            <Text style={styles.dateText}>Oct 24</Text>
          </View>
          <View style={styles.cardBotRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                 <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]}/>
                 <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
              </View>
              <Text style={styles.statusCodeText}>200 OK</Text>
            </View>
            <Text style={styles.retriesText}>0 retries</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.eventType}>payment_intent.payment_failed</Text>
            <Text style={styles.timeText}>14:21:05</Text>
          </View>
          <View style={styles.cardMidRow}>
            <Text style={styles.eventId}>pi_3NvY8fL2uY8zQ8W2a0</Text>
            <Text style={styles.dateText}>Oct 24</Text>
          </View>
          <View style={styles.cardBotRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(248,113,113,0.1)' }]}>
                 <View style={[styles.statusDot, { backgroundColor: '#F87171' }]}/>
                 <Text style={[styles.statusPillText, { color: '#F87171' }]}>FAILED</Text>
              </View>
              <Text style={[styles.statusCodeText, { color: '#F87171' }]}>402 ERROR</Text>
            </View>
            <Text style={styles.retriesText}>3 retries</Text>
          </View>
        </TouchableOpacity>

        {/* Card 3 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.eventType}>customer.subscription.deleted</Text>
            <Text style={styles.timeText}>14:19:12</Text>
          </View>
          <View style={styles.cardMidRow}>
            <Text style={styles.eventId}>sub_2PzK1fL9uY2z9SW2z9</Text>
            <Text style={styles.dateText}>Oct 24</Text>
          </View>
          <View style={styles.cardBotRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(156,163,175,0.1)' }]}>
                 <View style={[styles.statusDot, { backgroundColor: '#9CA3AF' }]}/>
                 <Text style={[styles.statusPillText, { color: '#9CA3AF' }]}>PENDING</Text>
              </View>
              <Text style={styles.statusCodeText}>---</Text>
            </View>
            <Text style={styles.retriesText}>0 retries</Text>
          </View>
        </TouchableOpacity>

        {/* Card 4 (Expanded) */}
        <View style={[styles.logCard, { borderColor: '#4ADE80' }]}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.eventType, { color: '#4ADE80' }]}>customer.subscription.updated</Text>
            <Text style={styles.timeText}>14:18:44</Text>
          </View>
          <View style={styles.cardMidRow}>
            <Text style={styles.eventId}>sub_1NzH9fL2uY8zQ8W2a4</Text>
            <Text style={styles.dateText}>Oct 24</Text>
          </View>
          <View style={[styles.cardBotRow, { marginBottom: spacing.lg }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                 <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]}/>
                 <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
              </View>
              <Text style={[styles.statusCodeText, { color: '#4ADE80' }]}>200 OK</Text>
            </View>
            <ChevronUp size={16} color={colors.textSecondary} />
          </View>

          {/* Payload Block */}
          <View style={styles.payloadBox}>
            <Text style={styles.payloadText}>{payloadPreview}</Text>
          </View>
        </View>

        {/* Card 5 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.eventType}>invoice.paid</Text>
            <Text style={styles.timeText}>14:15:20</Text>
          </View>
          <View style={styles.cardMidRow}>
            <Text style={styles.eventId}>in_1NzG7fL2uY8zQ8W2n1</Text>
            <Text style={styles.dateText}>Oct 24</Text>
          </View>
          <View style={styles.cardBotRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                 <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]}/>
                 <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
              </View>
              <Text style={[styles.statusCodeText, { color: '#4ADE80' }]}>200 OK</Text>
            </View>
            <Text style={styles.retriesText}>0 retries</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity activeOpacity={0.8} style={styles.loadMoreBtn}>
          <RotateCcw size={14} color={colors.textSecondary} />
          <Text style={styles.loadMoreText}>Load Previous Logs</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1316' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  searchBtn: { padding: 4 },
  
  searchWrap: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: 'transparent' 
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: '#FFFFFF', padding: 0, fontSize: 16 },
  
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xl, gap: spacing.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.pill, backgroundColor: '#1D2421' },
  filterChipActive: { backgroundColor: 'rgba(74,222,128,0.1)' },
  filterChipText: { ...typography.caption, color: colors.textSecondary, fontSize: 14 },
  filterChipTextActive: { ...typography.caption, color: '#4ADE80', fontSize: 14 },

  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  
  logCard: { 
    padding: spacing.xl, borderRadius: borderRadius.md, 
    backgroundColor: '#151918', borderWidth: 1, borderColor: 'transparent',
    marginBottom: spacing.md
  },
  
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  eventType: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 15 },
  timeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textSecondary, fontSize: 14 },

  cardMidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  eventId: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 14 },
  dateText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 13 },

  cardBotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusDot: { width: 4, height: 4, borderRadius: 2, marginRight: 4 },
  statusPillText: { ...typography.captionBold, fontSize: 13, letterSpacing: 0.5 },
  statusCodeText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 14 },
  retriesText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 13 },

  payloadBox: { backgroundColor: '#0A0D0C', padding: spacing.lg, borderRadius: borderRadius.md },
  payloadText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#A0ADC0', fontSize: 14, lineHeight: 20 },
  
  loadMoreBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 14, borderRadius: borderRadius.pill, backgroundColor: '#1D2421', 
    marginTop: spacing.md
  },
  loadMoreText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 15 }
});
 
 
