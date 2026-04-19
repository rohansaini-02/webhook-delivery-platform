import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { ChevronLeft, RotateCcw, Copy, UploadCloud, DownloadCloud } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDelivery, replayDlqItem } from '../services/api';

export default function EventDetailsScreen({ route, navigation }: any) {
  const { deliveryId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);

  useEffect(() => {
    loadDelivery();
  }, [deliveryId]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const res = await fetchDelivery(deliveryId);
      setData(res.data.data);
    } catch (e) {
      console.error('Fetch delivery error:', e);
      Alert.alert('Error', 'Failed to load delivery details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setReplaying(true);
      await replayDlqItem(deliveryId);
      Alert.alert('Success', 'Retry initiated successfully.');
      loadDelivery();
    } catch (e) {
      Alert.alert('Error', 'Failed to initiate retry.');
    } finally {
      setReplaying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Content copied to clipboard');
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) return null;

  // --- Helper Components ---
  const PropertyRow = ({ label, value, valueColor = colors.textPrimary, isMonospace = false, isLast = false }: any) => (
    <View style={[styles.propRow, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}>
      <Text style={styles.propLabel}>{label}:</Text>
      <Text style={[
        styles.propValue, 
        { color: valueColor },
        isMonospace && { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 }
      ]}>
        {value}
      </Text>
    </View>
  );

  const reqPayload = JSON.stringify(data.event?.payload || {}, null, 2);
  const resPayload = data.lastError ? `Error: ${data.lastError}` : "Success: Payload delivered successfully.";
  const statusCode = data.lastStatusCode || (data.status === 'SUCCESS' ? 200 : 500);
  const isFailed = data.status === 'FAILED' || data.status === 'DLQ';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Event Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Action Header Card */}
        <View style={styles.alertCard}>
          <View style={[styles.alertCardIndicator, { backgroundColor: isFailed ? '#F87171' : '#4ADE80' }]} />
          
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md}}>
            <View style={[styles.criticalDot, { backgroundColor: isFailed ? '#F87171' : '#4ADE80' }]} />
            <Text style={[styles.criticalText, { color: isFailed ? '#F87171' : '#4ADE80' }]}>
              {isFailed ? 'CRITICAL FAILURE' : 'DELIVERY SUCCESS'}
            </Text>
          </View>

          <Text style={styles.alertTitle}>
            {data.status} - {statusCode} {isFailed ? 'Error' : 'OK'}
          </Text>
          
          <Text style={styles.alertTargetLabel}>Target Destination:</Text>
          <Text style={styles.alertTargetVal} numberOfLines={1}>{data.subscription?.url || 'https://api.internal-infra.io'}</Text>

          <View style={styles.alertButtonsRow}>
            {isFailed && (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} disabled={replaying}>
                {replaying ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                   <>
                     <RotateCcw size={14} color="#D1D5DB" style={{marginRight: 6}} />
                     <Text style={styles.retryBtnText}>Retry Now</Text>
                   </>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.viewLogsBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.viewLogsBtnText}>Back to Logs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATA GRID */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardHeaderLabel}>BASIC INFORMATION</Text>
          <PropertyRow label="EVENT ID" value={deliveryId} isMonospace />
          <PropertyRow label="TIMESTAMP" value={new Date(data.createdAt).toLocaleString()} />
          <PropertyRow 
            label="STATUS" 
            value={`${data.status} (${statusCode})`} 
            valueColor={isFailed ? colors.error : colors.success} 
          />
          <PropertyRow label="PROTOCOL" value="HTTP/1.1 (JSON)" isLast />
        </View>

        {/* RETRIES Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardHeaderLabel}>DELIVERY ATTEMPTS</Text>
          <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md}}>
            <Text style={styles.hugeNumber}>{data.attempts}</Text>
            <Text style={styles.hugeNumberSub}> / {data.maxAttempts} max retries</Text>
          </View>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${(data.attempts / data.maxAttempts) * 100}%`, backgroundColor: isFailed ? colors.error : colors.success }]} />
          </View>
        </View>

        {/* REQUEST PAYLOAD Block */}
        <View style={{ marginTop: spacing.md, paddingHorizontal: spacing.xl }}>
          <View style={styles.payloadHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
               <UploadCloud size={14} color={colors.textSecondary} />
               <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>REQUEST PAYLOAD</Text>
            </View>
            <Text style={styles.payloadSizeText}>2.4 KB</Text>
          </View>
          <View style={styles.payloadBox}>
            <View style={[styles.leftAccent, { backgroundColor: '#F472B6' }]} />
            <Text style={styles.payloadCodeText}>{reqPayload}</Text>
          </View>
        </View>

        {/* RESPONSE BODY Block */}
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.xl }}>
          <View style={styles.payloadHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
               <DownloadCloud size={14} color={colors.textSecondary} />
               <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>EXECUTION CONTEXT</Text>
            </View>
          </View>
          <View style={styles.payloadBox}>
            <View style={[styles.leftAccent, { backgroundColor: isFailed ? '#F87171' : '#4ADE80' }]} />
            <Text style={[styles.payloadCodeText, { color: isFailed ? '#F87171' : '#4ADE80' }]}>{resPayload}</Text>
          </View>
        </View>

        {/* METRICS / PERFORMANCE Block */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardHeaderLabel}>PERFORMANCE METRICS</Text>
          
          <PropertyRow 
            label="LATENCY" 
            value={`${data.latencyMs || 0} ms`} 
            valueColor={data.latencyMs > 500 ? colors.warning : colors.success} 
          />
          <PropertyRow label="EVENT TYPE" value={data.event?.type} />
          <PropertyRow label="DESTINATION" value={data.subscription?.url} isMonospace isLast />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 60 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: 30 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitleText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 20 },
 
  alertCard: { 
    backgroundColor: colors.bgElevated, 
    borderRadius: borderRadius.lg, 
    marginHorizontal: spacing.xl, 
    padding: spacing.xl, 
    marginBottom: spacing.md, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card
  },
  alertCardIndicator: { position: 'absolute', left: 0, right: 0, top: 0, height: 3 },
  
  criticalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  criticalText: { ...typography.captionBold, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' },
  alertTitle: { ...typography.h2, color: '#FFFFFF', marginBottom: spacing.md },
  
  alertTargetLabel: { ...typography.small, color: colors.textSecondary, marginBottom: 4 },
  alertTargetVal: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 13, marginBottom: spacing.xl },
  
  alertButtonsRow: { flexDirection: 'row', gap: spacing.md },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgInput, paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.borderCard },
  retryBtnText: { ...typography.small, fontWeight: '700', color: colors.textSecondary },
  viewLogsBtn: { alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill },
  viewLogsBtnText: { ...typography.small, fontWeight: '700', color: colors.textInverse },
 
  dataCard: { 
    backgroundColor: colors.bgElevated, 
    borderRadius: borderRadius.lg, 
    marginHorizontal: spacing.xl, 
    padding: spacing.xl, 
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card
  },
  metricsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card
  },
  cardHeaderLabel: { ...typography.small, color: colors.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.xl, textTransform: 'uppercase' },
  
  propRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  propLabel: { ...typography.small, color: colors.textSecondary, fontWeight: '500' },
  propValue: { ...typography.small, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: spacing.xl },
 
  hugeNumber: { ...typography.h1, color: '#FFFFFF' },
  hugeNumberSub: { ...typography.body, color: colors.textMuted, fontSize: 14 },
  progressBarBg: { height: 6, backgroundColor: colors.bgInput, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
 
  payloadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  payloadSizeText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  payloadBox: { 
    backgroundColor: '#0A0D0C', 
    borderRadius: borderRadius.lg, 
    padding: spacing.xl, 
    paddingLeft: 24, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  leftAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  payloadCodeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: colors.primary, lineHeight: 18 },
});
