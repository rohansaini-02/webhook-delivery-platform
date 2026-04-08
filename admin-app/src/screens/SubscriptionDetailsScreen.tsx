import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
  Switch, Alert, Platform
} from 'react-native';
import { User, Search, Trash2, Plug, Copy, Eye, EyeOff, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchSubscription, updateSubscription, deleteSubscription } from '../services/api';

export default function SubscriptionDetailsScreen({ route, navigation }: any) {
  const { subscriptionId } = route.params;
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => { loadSub(); }, [subscriptionId]);

  const loadSub = async () => {
    try {
      const res = await fetchSubscription(subscriptionId);
      setSub(res.data.data);
    } catch (e) {
      console.error('Sub details load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    try {
      await updateSubscription(subscriptionId, { isActive: value });
      setSub((prev: any) => ({ ...prev, isActive: value }));
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Subscription', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscription(subscriptionId);
            navigation.goBack();
          } catch (e) {
            console.error('Delete error:', e);
          }
        },
      },
    ]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Use sub data if available, but render exactly like image
  const isActive = sub?.isActive !== false;
  const isEnabled = typeof sub?.isActive === 'boolean' ? sub.isActive : true;

  const payloadPreview = `{
  "id": "evt_9UX2mBXp4v1",
  "type": "order.completed",
  "status": "delivered",
  "timestamp": "2023-11-28T14:42:01Z",
  "metadata": {
    "node_id": "infra-84",
    "cluster": "aws-us-east"
  }
}`;

  const chartBars = [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 12];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
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

        {/* Title Area */}
        <View style={styles.titleArea}>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle} numberOfLines={2}>production-event-sync</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.subtitleText}>Subscription ID: sub_84928_px2</Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <View style={styles.actionLeft}>
            <Text style={styles.enabledText}>ENABLED</Text>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#3E3E40', true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#3E3E40"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={12} color="#FFA7A7" strokeWidth={2.5} style={{marginRight: 6}} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Metric Cards */}
        {/* 1. Performance History */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>PERFORMANCE HISTORY</Text>
            <Text style={[styles.cardHeaderLabelRight, { color: colors.primary }]}>+2.4% vs last 24h</Text>
          </View>
          <View style={styles.chartWrapper}>
            {chartBars.map((h, i) => (
              <View 
                key={i} 
                style={[
                  styles.chartBar, 
                  { height: h * 6 },
                  i === chartBars.length - 1 ? { backgroundColor: '#4ADE80' } : {}
                ]} 
              />
            ))}
          </View>
        </View>

        {/* 2. Success Rate */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>SUCCESS RATE</Text>
          <Text style={[styles.hugeMetric, { color: '#4ADE80' }]}>99.8%</Text>
          <Text style={styles.metricSubInfo}>12,402 delivered</Text>
        </View>

        {/* 3. Avg Latency */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>AVG LATENCY</Text>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <Text style={[styles.hugeMetric, { color: '#FFFFFF' }]}>142</Text>
            <Text style={styles.hugeMetricSuffix}>ms</Text>
          </View>
          <Text style={styles.metricSubInfo}>P95 distribution</Text>
        </View>

        {/* Delivery Endpoint */}
        <View style={[styles.card, { marginTop: spacing.md }]}>
          <View style={[styles.cardHeaderRow, { justifyContent: 'flex-start', marginBottom: spacing.lg }]}>
            <Plug size={16} color="#4ADE80" style={{marginRight: 8}} />
            <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>DELIVERY ENDPOINT</Text>
          </View>

          <Text style={styles.inputLabel}>DESTINATION URL</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputValueGreen} numberOfLines={1}>
              {sub?.url || "https://api.internal-inf."}
            </Text>
            <TouchableOpacity onPress={() => copyToClipboard(sub?.url || "https://api.internal-inf.")}>
              <Copy size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>SECRET KEY</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputValueWhite} numberOfLines={1}>
              {showSecret ? (sub?.secret || "sec_prod_kj8fXy") : "••••••••••••••••••••••••"}
            </Text>
            <TouchableOpacity onPress={() => setShowSecret(!showSecret)}>
              {showSecret ? <EyeOff size={14} color={colors.textSecondary}/> : <Eye size={14} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest Payload */}
        <View style={styles.payloadCardWrapper}>
          <View style={styles.payloadHeader}>
            <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>LATEST PAYLOAD</Text>
            <Text style={[styles.metricSubInfo, { marginBottom: 0, fontSize: 10 }]}>2 mins ago</Text>
          </View>
          <View style={styles.payloadBox}>
            <Text style={styles.payloadText}>{payloadPreview}</Text>
          </View>
        </View>

        {/* Event Filters */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>EVENT FILTERS</Text>
          <View style={styles.filterChipList}>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>order.created</Text>
              <X size={10} color={colors.textSecondary} />
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>order.updated</Text>
              <X size={10} color={colors.textSecondary} />
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>payment.success</Text>
              <X size={10} color={colors.textSecondary} />
            </View>
            <TouchableOpacity style={styles.addFilterPill}>
              <Text style={styles.addFilterPillText}>+ Add Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Logs */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>SUBSCRIPTION LOGS</Text>
          
          <View style={styles.miniLogItem}>
            <View style={[styles.logIndicator, { backgroundColor: '#4ADE80' }]} />
            <View style={styles.miniLogContent}>
              <Text style={styles.miniLogStatus}>200 OK</Text>
              <Text style={styles.miniLogTime}>Today, 2:42 PM • node-01</Text>
            </View>
          </View>

          <View style={styles.miniLogItem}>
            <View style={[styles.logIndicator, { backgroundColor: '#4ADE80' }]} />
            <View style={styles.miniLogContent}>
              <Text style={styles.miniLogStatus}>200 OK</Text>
              <Text style={styles.miniLogTime}>Today, 2:38 PM • node-01</Text>
            </View>
          </View>

          <View style={[styles.miniLogItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={[styles.logIndicator, { backgroundColor: '#F87171' }]} />
            <View style={styles.miniLogContent}>
              <Text style={styles.miniLogStatus}>504 GATEWAY TIMEOUT</Text>
              <Text style={styles.miniLogTime}>Today, 2:31 PM • node-03</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllBtnText}>VIEW ALL LOGS</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1316' }, // Matches dark background exactly
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingBottom: 60, paddingTop: 50 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: 30 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 167, 38, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13 },
  searchBtn: { padding: 4 },

  titleArea: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xs },
  pageTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 32, letterSpacing: -0.5, lineHeight: 38 },
  activeBadge: { borderWidth: 1, borderColor: '#1F5133', backgroundColor: 'rgba(0, 230, 118, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  activeBadgeText: { ...typography.captionBold, color: '#4ADE80', fontSize: 9, letterSpacing: 1 },
  subtitleText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, fontSize: 12 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: 30 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181C1F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.pill },
  enabledText: { ...typography.captionBold, color: colors.textSecondary, fontSize: 9, letterSpacing: 1, marginRight: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B1A1E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill },
  deleteBtnText: { ...typography.captionBold, color: '#FFA7A7', fontSize: 11 },

  card: { backgroundColor: '#181C1F', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.lg, marginBottom: spacing.md },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardHeaderLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 9, letterSpacing: 1.2, marginBottom: spacing.md },
  cardHeaderLabelRight: { ...typography.captionBold, fontSize: 9, letterSpacing: 0.5 },

  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 75, gap: 4, marginTop: spacing.sm },
  chartBar: { flex: 1, backgroundColor: '#21422E', borderRadius: 2, minHeight: 4 },

  hugeMetric: { fontWeight: '800', fontSize: 40, letterSpacing: -1, marginBottom: 4 },
  hugeMetricSuffix: { ...typography.body, color: colors.textMuted, fontSize: 20, marginLeft: 2, fontWeight: '500' },
  metricSubInfo: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },

  inputLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 9, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 2 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0F1316', borderRadius: borderRadius.md, 
    paddingHorizontal: spacing.lg, paddingVertical: 20, marginBottom: spacing.xl 
  },
  inputValueGreen: { ...typography.body, color: '#4ADE80', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, flex: 1, marginRight: spacing.md },
  inputValueWhite: { ...typography.body, color: '#FFFFFF', letterSpacing: 3, fontSize: 12, flex: 1, marginRight: spacing.md, paddingTop: 4 },

  payloadCardWrapper: { backgroundColor: '#181C1F', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, marginBottom: spacing.md },
  payloadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  payloadBox: { padding: spacing.lg, paddingTop: 0 },
  payloadText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: '#A0ADC0', lineHeight: 22 },

  filterChipList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22272A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.pill, gap: 6 },
  filterPillText: { ...typography.small, color: '#D1D5DB', fontSize: 11 },
  addFilterPill: { borderStyle: 'dotted', borderWidth: 1, borderColor: '#3E3E40', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.pill, justifyContent: 'center' },
  addFilterPillText: { ...typography.small, color: '#D1D5DB', fontSize: 10 },

  miniLogItem: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#22272A', paddingBottom: spacing.md, marginBottom: spacing.md },
  logIndicator: { width: 6, height: 6, borderRadius: 3, marginTop: 5, marginRight: spacing.sm },
  miniLogContent: { flex: 1 },
  miniLogStatus: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 12, marginBottom: 2 },
  miniLogTime: { ...typography.small, color: colors.textMuted, fontSize: 10 },

  viewAllBtn: { 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: '#1F5133', borderRadius: borderRadius.md, 
    paddingVertical: 14, marginTop: spacing.md 
  },
  viewAllBtnText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 10, letterSpacing: 0.5 },
});
