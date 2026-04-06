import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform, Dimensions
} from 'react-native';
import { User, Search, Star, CheckCircle, AlertTriangle, Inbox, Plus } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchMetrics, fetchDeliveries } from '../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes] = await Promise.all([
        fetchMetrics()
      ]);
      setMetrics(metricsRes.data.data);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Fallback metrics matching the image design
  const m = {
    events: "1.2M",
    success: "99.8%",
    failed: "412",
    dlq: "24",
  };

  const chartBars = [40, 30, 45, 40, 55, 50, 45]; // Heights for Mon -> Sun
  const chartDays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
             <User size={16} color={colors.primary} />
          </View>
          <Text style={styles.headerTitleText}>The Orchestrator</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Search Input Placeholder */}
        <View style={styles.searchWrap}>
          <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
          <Text style={styles.searchInputPlaceholder} numberOfLines={1}>Search event IDs, timestamps, or sy...</Text>
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
            <View style={{flexDirection: 'row', gap: 6}}>
              <View style={[styles.dotLegend, { backgroundColor: '#4ADE80' }]}/>
              <View style={[styles.dotLegend, { backgroundColor: '#A78BFA' }]}/>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            {chartBars.map((h, i) => {
              const isSat = i === 5; // index 5 is SAT
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: h * 2 }, isSat && { backgroundColor: '#4ADE80' }]} />
                  <Text style={[styles.chartDayText, isSat && { color: '#4ADE80' }]}>{chartDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stream Activity */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Stream Activity</Text>
          <Text style={styles.sectionSubtitle}>LIVE INGEST MONITORING</Text>
          
          <View style={styles.streamList}>
            {/* Stream 1 */}
            <View style={styles.streamItem}>
              <View style={styles.streamLeft}>
                <Text style={styles.streamIdText}>evt_8ix_9sL2</Text>
                <Text style={styles.streamNameText}>Stripe Webhook Hook</Text>
              </View>
              <View style={styles.streamRight}>
                <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                  <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
                </View>
                <Text style={styles.streamTimeText}>12:04:12</Text>
              </View>
            </View>

            {/* Stream 2 */}
            <View style={styles.streamItem}>
              <View style={styles.streamLeft}>
                <Text style={styles.streamIdText}>evt_2iz_0nP9</Text>
                <Text style={styles.streamNameText}>User Auth Signup</Text>
              </View>
              <View style={styles.streamRight}>
                <View style={[styles.statusPill, { backgroundColor: 'rgba(248,113,113,0.15)' }]}>
                  <Text style={[styles.statusPillText, { color: '#F87171' }]}>FAILED</Text>
                </View>
                <Text style={styles.streamTimeText}>12:03:59</Text>
              </View>
            </View>

            {/* Stream 3 */}
            <View style={styles.streamItem}>
              <View style={styles.streamLeft}>
                <Text style={styles.streamIdText}>evt_5Sj_3oR1</Text>
                <Text style={styles.streamNameText}>Email Dispatch API</Text>
              </View>
              <View style={styles.streamRight}>
                <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                  <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
                </View>
                <Text style={styles.streamTimeText}>12:02:18</Text>
              </View>
            </View>
            
            {/* Stream 4 */}
            <View style={styles.streamItem}>
              {/* Highlight strip for retrying */}
              <View style={{position: 'absolute', left: -16, top: 0, bottom: 0, width: 2, backgroundColor: '#A78BFA'}} />
              <View style={styles.streamLeft}>
                <Text style={styles.streamIdText}>evt_0fa_7vT4</Text>
                <Text style={styles.streamNameText}>Database Sync Global</Text>
              </View>
              <View style={styles.streamRight}>
                <View style={[styles.statusPill, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
                  <Text style={[styles.statusPillText, { color: '#A78BFA' }]}>RETRYING</Text>
                </View>
                <Text style={styles.streamTimeText}>11:59:44</Text>
              </View>
            </View>

            {/* Stream 5 */}
            <View style={[styles.streamItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={styles.streamLeft}>
                <Text style={styles.streamIdText}>evt_12k_5hR0</Text>
                <Text style={styles.streamNameText}>Payment Capture Confrm</Text>
              </View>
              <View style={styles.streamRight}>
                <View style={[styles.statusPill, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                  <Text style={[styles.statusPillText, { color: '#4ADE80' }]}>SUCCESS</Text>
                </View>
                <Text style={styles.streamTimeText}>11:58:02</Text>
              </View>
            </View>

          </View>
          
          {/* View All Streams Footer */}
          <TouchableOpacity style={styles.viewAllDarkBtn}>
            <Text style={styles.viewAllDarkBtnText}>VIEW ALL STREAMS</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding allowance for the floating button */}
        <View style={{height: 100}} />

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Plus color="#0A0D0C" strokeWidth={3} size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101314' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 80 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 167, 38, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 13 },
  searchBtn: { padding: 4 },

  searchWrap: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' 
  },
  searchIcon: { marginRight: spacing.sm },
  searchInputPlaceholder: { ...typography.body, color: colors.textMuted },

  gridContainer: { marginHorizontal: spacing.xl, marginBottom: spacing.xl, gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  gridCard: { flex: 1, backgroundColor: '#141718', borderRadius: borderRadius.md, padding: spacing.md, paddingVertical: spacing.lg },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardHeaderLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 9, letterSpacing: 1 },
  hugeMetricLeft: { fontWeight: '800', fontSize: 28, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 2 },
  metricSubInfo: { ...typography.caption, fontSize: 10 },

  cardSection: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.lg, marginBottom: spacing.md },
  
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  sectionTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13, marginBottom: 2 },
  sectionSubtitle: { ...typography.captionBold, color: colors.textMuted, fontSize: 8, letterSpacing: 1 },
  dotLegend: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingHorizontal: spacing.sm, paddingTop: spacing.md },
  chartCol: { alignItems: 'center', gap: 8, flex: 1 },
  chartBar: { width: 22, backgroundColor: '#333A36', borderRadius: 4 },
  chartDayText: { ...typography.captionBold, color: colors.textMuted, fontSize: 8 },

  streamList: { marginTop: spacing.lg },
  streamItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.lg, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#1F2422' },
  streamLeft: { flex: 1 },
  streamIdText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#FFFFFF', fontSize: 12, marginBottom: 4 },
  streamNameText: { ...typography.caption, color: colors.textSecondary },
  
  streamRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  statusPillText: { ...typography.captionBold, fontSize: 8, letterSpacing: 0.5 },
  streamTimeText: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },

  viewAllDarkBtn: { 
    alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#0A0D0C', borderRadius: borderRadius.md, 
    paddingVertical: 14, marginTop: spacing.md 
  },
  viewAllDarkBtnText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 10, letterSpacing: 0.5 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30, // Usually placed slightly above navigation bar
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: '#4ADE80',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }
});
 
