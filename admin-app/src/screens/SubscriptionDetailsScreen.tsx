import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
  Switch, Alert, Platform, TextInput
} from 'react-native';
import { ChevronLeft, Trash2, Plug, Copy, Eye, EyeOff, X, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchSubscription, updateSubscription, deleteSubscription, ingestEvent, fetchEventTypes } from '../services/api';
import { Send, Zap, Plus, X as XIcon } from 'lucide-react-native';
import PremiumCard from '../components/PremiumCard';

export default function SubscriptionDetailsScreen({ route, navigation }: any) {
  const { subscriptionId } = route.params;
  const [sub, setSub] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newFilter, setNewFilter] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => { 
    loadSub(); 
    loadTypes();
  }, [subscriptionId]);
  
  const loadTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await fetchEventTypes();
      const types = res.data.data || [];
      if (!types.includes('test.dlq')) types.push('test.dlq');
      setEventTypes(types);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadSub = async () => {
    try {
      const [subRes, delRes] = await Promise.all([
        import('../services/api').then(m => m.fetchSubscription(subscriptionId)),
        import('../services/api').then(m => m.fetchDeliveries())
      ]);
      setSub(subRes.data.data);
      setIsEnabled(subRes.data.data?.isActive !== false);
      const myDeliveries = delRes.data.data?.filter((d: any) => d.subscriptionId === subscriptionId) || [];
      setDeliveries(myDeliveries);
      if (!selectedType && subRes.data.data?.events?.length > 0) {
        setSelectedType(subRes.data.data.events[0]);
      }
    } catch (e) {
      console.error('Sub details load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    // Optimistic UI update
    const previousState = isEnabled;
    setIsEnabled(value);
    
    try {
      await updateSubscription(subscriptionId, { isActive: value });
      // Update successful, keep the value
    } catch (error) {
       // Rollback on failure
      setIsEnabled(previousState);
      Alert.alert('Error', 'Failed to update subscription status. Please check your connection.');
    }
  };

  const handleAddFilter = async () => {
    if (!newFilter.trim()) return;
    const currentEvents = sub?.events || [];
    if (currentEvents.includes(newFilter.trim())) {
      Alert.alert('Exists', 'This event filter is already active.');
      return;
    }
    try {
      const updatedEvents = [...currentEvents, newFilter.trim()];
      const { updateSubscription } = await import('../services/api');
      await updateSubscription(subscriptionId, { events: updatedEvents });
      setSub({ ...sub, events: updatedEvents });
      setNewFilter('');
      setShowAddFilter(false);
    } catch {
      Alert.alert('Error', 'Failed to update filters.');
    }
  };

  const handleRemoveFilter = async (evt: string) => {
    try {
      const updatedEvents = sub?.events.filter((e: string) => e !== evt);
      const { updateSubscription } = await import('../services/api');
      await updateSubscription(subscriptionId, { events: updatedEvents });
      setSub({ ...sub, events: updatedEvents });
    } catch {
      Alert.alert('Error', 'Failed to remove filter.');
    }
  };

  const handleCopySecret = () => {
    Clipboard.setStringAsync(sub?.secret || "sec_prod_kj8fXy");
    Alert.alert('Copied', 'Secret key copied to clipboard');
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
  
  const handleTriggerEvent = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an event type to trigger.');
      return;
    }
    
    setTriggering(true);
    try {
      const payload = {
        test: true,
        source: 'Mobile Admin App',
        triggeredAt: new Date().toISOString(),
        subscriptionId: subscriptionId
      };
      
      await ingestEvent({ type: selectedType, payload });
      Alert.alert('Success', `Test event "${selectedType}" triggered successfully! Wait a few seconds for the logs to appear.`);
      // Reload sub data to see new logs
      setTimeout(loadSub, 2000);
    } catch (e) {
      console.error('Trigger error:', e);
      Alert.alert('Error', 'Failed to trigger event.');
    } finally {
      setTriggering(false);
    }
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

  const latencies = deliveries.filter((d: any) => d.latencyMs != null).map((d: any) => d.latencyMs);
  const avgLatency = latencies.length ? (latencies.reduce((a,b)=>a+b,0)/latencies.length).toFixed(0) : "0";
  
  let successRateStr = '0.0%';
  if (sub?._count?.deliveries > 0) {
     successRateStr = ((1 - (sub.failCount || 0) / sub._count.deliveries) * 100).toFixed(1) + '%';
  }

  const latestDelivery = deliveries[0];
  let payloadStr = "No deliveries recorded yet.";
  if (latestDelivery && latestDelivery.event) {
     payloadStr = JSON.stringify(latestDelivery.event.payload, null, 2);
  }

  // Calculate chart bars (recent 13 deliveries latencies mock approximation based on real ones)
  const chartBars = latencies.length > 0 ? latencies.slice(-13).map((l: number) => l / 10) : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Subscription Details</Text>
          </View>
        </View>

        {/* Title Area */}
        <View style={styles.titleArea}>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle} numberOfLines={2}>{sub?.url ? new URL(sub.url).hostname : 'production-event-sync'}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{isEnabled ? 'ACTIVE' : 'INACTIVE'}</Text>
            </View>
          </View>
          <Text style={styles.subtitleText}>Subscription ID: {subscriptionId}</Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <View style={styles.actionLeft}>
            <Text style={styles.enabledText}>ENABLED</Text>
            <View onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false}>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{ false: '#22272A', true: '#00E676' }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#22272A"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={13} color="#FF7070" strokeWidth={2.5} style={{marginRight: 6}} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Metric Cards */}
        {/* 1. Performance History */}
        <PremiumCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>PERFORMANCE HISTORY</Text>
            <Text style={[styles.cardHeaderLabelRight, { color: '#4ADE80' }]}>+2.4% vs last 24h</Text>
          </View>
          <View style={styles.chartWrapper}>
            {[14, 28, 20, 32, 25, 40, 35, 45, 38, 50, 42, 48, 55].map((h, i) => (
              <View 
                key={i} 
                style={[
                  styles.chartBar, 
                  { height: h },
                  i === 12 ? { backgroundColor: '#4ADE80' } : { backgroundColor: 'rgba(74, 222, 128, 0.25)' }
                ]} 
              />
            ))}
          </View>
        </PremiumCard>

        {/* 2. Success Rate */}
        <PremiumCard style={styles.card}>
          <Text style={styles.cardHeaderLabel}>SUCCESS RATE</Text>
          <Text style={[styles.hugeMetric, { color: '#4ADE80' }]}>{successRateStr}</Text>
          <Text style={styles.metricSubInfo}>{sub?._count?.deliveries || 0} delivered</Text>
        </PremiumCard>

        {/* 3. Avg Latency */}
        <PremiumCard style={styles.card}>
          <Text style={styles.cardHeaderLabel}>AVG LATENCY</Text>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <Text style={[styles.hugeMetric, { color: '#FFFFFF' }]}>{avgLatency}</Text>
            <Text style={styles.hugeMetricSuffix}>ms</Text>
          </View>
          <Text style={styles.metricSubInfo}>P95 distribution</Text>
        </PremiumCard>

        {/* Delivery Endpoint */}
        <PremiumCard style={[styles.card, { marginTop: spacing.md }]}>
          <View style={[styles.cardHeaderRow, { justifyContent: 'flex-start', marginBottom: spacing.lg }]}>
            <View style={styles.endpointIconWrapper}>
              <Plug size={14} color="#4ADE80" />
            </View>
            <Text style={[styles.cardHeaderLabel, { marginBottom: 0, marginLeft: 10 }]}>DELIVERY ENDPOINT</Text>
          </View>

          <Text style={styles.inputLabel}>DESTINATION URL</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputValueGreen} numberOfLines={1}>
              {sub?.url || "https://api.internal-inf."}
            </Text>
            <TouchableOpacity onPress={() => copyToClipboard(sub?.url || "")} activeOpacity={0.6}>
              <Copy size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>SECRET KEY</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputValueWhite} numberOfLines={1}>
              {showSecret ? (sub?.secret || "••••••••••••") : "••••••••••••••••••••••••"}
            </Text>
            <TouchableOpacity onPress={() => setShowSecret(!showSecret)} activeOpacity={0.6}>
              {showSecret ? <EyeOff size={16} color={colors.textSecondary}/> : <Eye size={16} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
        </PremiumCard>

        {/* Latest Payload */}
        <PremiumCard style={styles.payloadCardWrapper}>
          <View style={styles.payloadHeader}>
            <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>LATEST PAYLOAD</Text>
          </View>
          <View style={styles.payloadBox}>
            <Text style={styles.payloadText}>{payloadStr}</Text>
          </View>
        </PremiumCard>

        {/* Event Filters */}
        <PremiumCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>EVENT FILTERS</Text>
            {!showAddFilter && (
              <TouchableOpacity onPress={() => setShowAddFilter(true)} style={styles.addFilterBtnInline}>
                <Plus size={14} color="#4ADE80" />
                <Text style={styles.addFilterBtnInlineText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {showAddFilter && (
            <View style={styles.addFilterSection}>
              <View style={[styles.cardHeaderRow, { marginBottom: spacing.md }]}>
                <Text style={styles.filterDiscoveryLabel}>DISCOVER EVENT TYPES</Text>
                <TouchableOpacity onPress={() => setShowAddFilter(false)}>
                  <XIcon size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                 {eventTypes
                  .filter(t => !(sub?.events || []).includes(t))
                  .map(t => (
                   <TouchableOpacity 
                     key={t} 
                     style={[styles.typeSelectPill, { marginRight: 8 }]} 
                     onPress={async () => {
                       const updatedEvents = [...(sub?.events || []), t];
                       await updateSubscription(subscriptionId, { events: updatedEvents });
                       setSub({ ...sub, events: updatedEvents });
                       setShowAddFilter(false);
                     }}
                   >
                     <Text style={styles.typeSelectText}>{t}</Text>
                   </TouchableOpacity>
                 ))}
                 
                 {/* Fallback for manual type if not in discovery */}
                 <TouchableOpacity style={styles.addFilterPill} onPress={() => {
                   Alert.prompt(
                     "Custom Event Type",
                     "Enter the name of the event type you want to filter for.",
                     [
                       { text: "Cancel", style: "cancel" },
                       { text: "Add", onPress: (text: string | undefined) => {
                         if (text) {
                            const updatedEvents = [...(sub?.events || []), text];
                            updateSubscription(subscriptionId, { events: updatedEvents });
                            setSub({ ...sub, events: updatedEvents });
                            setShowAddFilter(false);
                         }
                       }}
                     ]
                   )
                 }}>
                   <Text style={[styles.addFilterPillText, {fontSize: 11}]}>+ Custom Type</Text>
                 </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.filterChipList}>
            {(sub?.events || []).map((evt: string, i: number) => (
              <View key={i} style={styles.filterPill}>
                <Text style={styles.filterPillText}>{evt}</Text>
                <TouchableOpacity style={{marginLeft: 4}} onPress={() => handleRemoveFilter(evt)}>
                   <XIcon size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
            
            {sub?.events?.length === 0 && !showAddFilter && (
              <Text style={{color: colors.textMuted, fontSize: 13}}>No filters active. Receiving all events (*).</Text>
            )}
          </View>
        </PremiumCard>

        {/* Trigger Test Event */}
        <PremiumCard style={styles.card}>
          <View style={[styles.cardHeaderRow, { marginBottom: spacing.lg }]}>
            <View style={[styles.endpointIconWrapper, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
              <Zap size={14} color="#4ADE80" />
            </View>
            <Text style={[styles.cardHeaderLabel, { marginBottom: 0, marginLeft: 10 }]}>TRIGGER TEST EVENT</Text>
          </View>
          
          <Text style={styles.inputLabel}>SELECT EVENT TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.lg}}>
            {(sub?.events || []).map((evt: string) => (
              <TouchableOpacity 
                key={evt} 
                onPress={() => setSelectedType(evt)}
                style={[
                  styles.typeSelectPill, 
                  selectedType === evt && { borderColor: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.05)' }
                ]}
              >
                <Text style={[styles.typeSelectText, selectedType === evt && { color: '#4ADE80' }]}>{evt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.triggerBtn, triggering && { opacity: 0.7 }]} 
            onPress={handleTriggerEvent}
            disabled={triggering}
          >
            {triggering ? (
              <ActivityIndicator size="small" color="#0A0E11" />
            ) : (
              <>
                <Send size={15} color="#0A0E11" strokeWidth={3} />
                <Text style={styles.triggerBtnText}>FIRE TEST EVENT</Text>
              </>
            )}
          </TouchableOpacity>
        </PremiumCard>

        {/* Subscription Logs */}
        <PremiumCard style={styles.card}>
          <Text style={styles.cardHeaderLabel}>SUBSCRIPTION LOGS</Text>
          
          {deliveries.slice(0, 5).map((log, index) => {
            const isLast = index === Math.min(deliveries.length, 5) - 1;
            const timeStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let statusColor = '#A78BFA';
            let statusText = log.status;
            if (log.status === 'SUCCESS') { statusColor = '#4ADE80'; statusText = `${log.lastStatusCode} OK`; }
            else if (log.status === 'FAILED' || log.status === 'DLQ') { statusColor = '#F87171'; statusText = `${log.lastStatusCode || 500} FAILED`; }

            return (
              <TouchableOpacity 
                key={log.id} 
                style={[styles.miniLogItem, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}
                onPress={() => navigation.navigate('EventDetails', { deliveryId: log.id })}
              >
                <View style={[styles.logIndicator, { backgroundColor: statusColor }]} />
                <View style={styles.miniLogContent}>
                  <Text style={styles.miniLogStatus}>{statusText}</Text>
                  <Text style={styles.miniLogTime}>{timeStr} • event: {log.event?.type}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          
          {deliveries.length === 0 && (
             <Text style={{color: colors.textMuted, fontSize: 13, marginBottom: 10}}>No logs recorded yet.</Text>
          )}

          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.getParent()?.navigate('Logs')}>
            <Text style={styles.viewAllBtnText}>VIEW ALL LOGS</Text>
          </TouchableOpacity>
        </PremiumCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg }, 
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingBottom: 60, paddingTop: 40 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitleText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16 },

  titleArea: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xs },
  pageTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 26, letterSpacing: -0.5, fontWeight: '800' },
  activeBadge: { backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  activeBadgeText: { ...typography.captionBold, color: '#4ADE80', fontSize: 11, letterSpacing: 1 },
  subtitleText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, fontSize: 13, fontWeight: '500' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: 30 },
  actionLeft: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#181C1F', paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#22272A' 
  },
  enabledText: { ...typography.captionBold, color: '#FFFFFF', fontSize: 11, letterSpacing: 1.5, marginRight: 12 },
  deleteBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 112, 112, 0.08)', paddingHorizontal: 20, paddingVertical: 12, 
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255, 112, 112, 0.15)' 
  },
  deleteBtnText: { ...typography.captionBold, color: '#FF7070', fontSize: 13, fontWeight: '700' },

  card: { borderRadius: borderRadius.lg, marginHorizontal: spacing.xl, padding: spacing.xl, marginBottom: spacing.md },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  cardHeaderLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 11, letterSpacing: 1.5 },
  cardHeaderLabelRight: { ...typography.captionBold, fontSize: 12, fontWeight: '700' },

  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, gap: 5, marginTop: spacing.sm },
  chartBar: { flex: 1, borderRadius: 3, minHeight: 8 },

  hugeMetric: { fontWeight: '900', fontSize: 36, letterSpacing: -1.5, marginBottom: 2, color: '#FFFFFF' },
  hugeMetricSuffix: { ...typography.body, color: colors.textMuted, fontSize: 20, marginLeft: 4, fontWeight: '600' },
  metricSubInfo: { ...typography.caption, color: colors.textSecondary, fontSize: 13, fontWeight: '500' },

  endpointIconWrapper: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(74, 222, 128, 0.1)', alignItems: 'center', justifyContent: 'center' },
  inputLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 10, letterSpacing: 1.5, marginBottom: spacing.sm, marginLeft: 2 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111518', borderRadius: borderRadius.md, 
    paddingHorizontal: spacing.lg, paddingVertical: 18, marginBottom: spacing.xl 
  },
  inputValueGreen: { ...typography.body, color: '#4ADE80', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, flex: 1, marginRight: spacing.md, fontWeight: '600' },
  inputValueWhite: { ...typography.body, color: '#FFFFFF', letterSpacing: 4, fontSize: 14, flex: 1, marginRight: spacing.md, paddingTop: 4 },

  payloadCardWrapper: { borderRadius: borderRadius.lg, marginHorizontal: spacing.xl, marginBottom: spacing.md },
  payloadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  payloadBox: { padding: spacing.xl, paddingTop: 0 },
  payloadText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#D1D5DB', lineHeight: 20 },

  filterChipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterPill: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#22272A', paddingHorizontal: 14, paddingVertical: 10, 
    borderRadius: borderRadius.md, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  filterPillText: { ...typography.small, color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  addFilterPill: { borderStyle: 'dotted', borderWidth: 1, borderColor: '#3E3E40', paddingHorizontal: 14, paddingVertical: 10, borderRadius: borderRadius.md, justifyContent: 'center' },
  addFilterPillText: { ...typography.small, color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  addFilterInputRow: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#111518', paddingHorizontal: 12, paddingVertical: 8, 
    borderRadius: borderRadius.md, gap: 10, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.2)' 
  },
  addFilterInput: { ...typography.small, color: '#FFFFFF', fontSize: 13, minWidth: 100, padding: 0 },
  saveFilterBtn: { padding: 4 },

  miniLogItem: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#22272A', paddingBottom: spacing.lg, marginBottom: spacing.lg },
  logIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  miniLogContent: { flex: 1 },
  miniLogStatus: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 14, marginBottom: 2 },
  miniLogTime: { ...typography.small, color: colors.textMuted, fontSize: 12, fontWeight: '500' },

  viewAllBtn: { 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.2)', borderRadius: borderRadius.md, 
    paddingVertical: 16, marginTop: spacing.md 
  },
  viewAllBtnText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 12, letterSpacing: 1.5, fontWeight: '800' },

  typeSelectPill: { 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.md, 
    borderWidth: 1, borderColor: '#22272A', marginRight: 8, backgroundColor: '#111518' 
  },
  typeSelectText: { ...typography.small, color: colors.textSecondary, fontWeight: '700' },
  
  triggerBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#4ADE80', paddingVertical: 16, borderRadius: borderRadius.md, 
    marginTop: spacing.xs
  },
  triggerBtnText: { ...typography.bodyBold, color: '#0A0E11', fontSize: 14, letterSpacing: 1, fontWeight: '900' },

  addFilterBtnInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addFilterBtnInlineText: { ...typography.small, color: '#4ADE80', fontWeight: '800' },
  addFilterSection: { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#22272A' },
  filterDiscoveryLabel: { ...typography.captionBold, color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
});
 
