import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform
} from 'react-native';
import { ChevronLeft, RotateCcw, Copy, UploadCloud, DownloadCloud } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function EventDetailsScreen({ route, navigation }: any) {
  // Use either the passed ID or a fallback mock to display layout identically to design.
  const deliveryId = route?.params?.deliveryId || 'evt_9k2L_x9132z_01';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated network delay to show loading state if needed.
    setTimeout(() => setLoading(false), 300);
  }, [deliveryId]);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch {
      // Fallback silently
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const reqPayload = `{
  "action": "DEPLOY_ORCHESTRATION",
  "cluster_id": "us-east-4-main",
  "params": {
    "replication": 12,
    "strategy": "rolling_update",
    "canary": true
  },
  "metadata": {
    "triggered_by": "ci-pipeline-882",
    "version": "2.4.1-stable"
  }
}`;

  const resPayload = `{
  "error": "INTERNAL_SERVER_ERROR",
  "code": 500,
  "message": "Failed to connect to upstre",
  "trace_id": "trc_882199021zx"
}`;

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

        {/* Action Header Card - The 500 Error Box */}
        <View style={styles.alertCard}>
          {/* Subtle red indicator at top */}
          <View style={styles.alertCardIndicator} />
          
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md}}>
            <View style={styles.criticalDot} />
            <Text style={styles.criticalText}>CRITICAL FAILURE</Text>
          </View>

          <Text style={styles.alertTitle}>Failed - 500 Internal Server Error</Text>
          
          <Text style={styles.alertTargetLabel}>Target:</Text>
          <Text style={styles.alertTargetVal}>api.production.orchestrator.io/v1/deplo</Text>

          <View style={styles.alertButtonsRow}>
            <TouchableOpacity style={styles.retryBtn}>
              <RotateCcw size={14} color="#D1D5DB" style={{marginRight: 6}} />
              <Text style={styles.retryBtnText}>Retry Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.viewLogsBtn}>
              <Text style={styles.viewLogsBtnText}>View Logs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EVENT ID Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardHeaderLabel}>EVENT ID</Text>
          <View style={styles.copyRow}>
            <Text style={styles.copyRowText}>{deliveryId}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(deliveryId)}>
              <Copy size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TIMESTAMP Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardHeaderLabel}>TIMESTAMP</Text>
          <Text style={styles.dataText}>2023-10-24 14:02:11.492</Text>
          <Text style={styles.subText}>GMT-0400</Text>
        </View>

        {/* RETRIES Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardHeaderLabel}>RETRIES</Text>
          <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: 12}}>
            <Text style={styles.hugeNumber}>3</Text>
            <Text style={styles.hugeNumberSub}> / 5 max</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
        </View>

        {/* PROTOCOL Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardHeaderLabel}>PROTOCOL</Text>
          <View style={{flexDirection: 'row', gap: spacing.sm}}>
             <View style={styles.protocolPillGreen}>
               <Text style={styles.protocolPillGreenText}>HTTPS/2</Text>
             </View>
             <View style={styles.protocolPillDark}>
               <Text style={styles.protocolPillDarkText}>JSON</Text>
             </View>
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
               <Text style={[styles.cardHeaderLabel, { marginBottom: 0 }]}>RESPONSE BODY</Text>
            </View>
            <Text style={styles.payloadSizeText}>156 B</Text>
          </View>
          <View style={styles.payloadBox}>
            <View style={[styles.leftAccent, { backgroundColor: '#F87171' }]} />
            <Text style={[styles.payloadCodeText, { color: '#F87171' }]}>{resPayload}</Text>
          </View>
        </View>

        {/* EXECUTION CONTEXT LOGS Block */}
        <View style={styles.contextContainer}>
          <Text style={[styles.cardHeaderLabel, { marginBottom: spacing.lg }]}>EXECUTION CONTEXT LOGS</Text>
          
          <View style={styles.logLine}>
            <Text style={styles.logLineTime}>14:02:11.481</Text>
            <Text style={styles.logLineDesc}>Initiating handshake with us-east-4-main...</Text>
          </View>

          <View style={styles.logLine}>
            <Text style={styles.logLineTime}>14:02:11.455</Text>
            <Text style={styles.logLineDesc}>SSL verification successful. (Cipher: TLS_AES_256_GCM_SHA384)</Text>
          </View>

          <View style={[styles.logLine, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={[styles.logLineTime, { color: '#F87171' }]}>14:02:11.492</Text>
            <Text style={[styles.logLineDesc, { color: '#F87171' }]}>
              Upstream service returned 500. Aborting sequence.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1316' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 60 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: 30 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitleText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 18 },

  alertCard: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.xl, marginBottom: spacing.md, overflow: 'hidden' },
  alertCardIndicator: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: '#F87171' },
  
  criticalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F472B6', marginRight: 8, opacity: 0.6 },
  criticalText: { ...typography.captionBold, color: '#F472B6', fontSize: 13, letterSpacing: 1.5, opacity: 0.8 },
  alertTitle: { fontWeight: '700', color: '#FFFFFF', fontSize: 26, letterSpacing: -0.5, lineHeight: 32, marginBottom: spacing.md },
  
  alertTargetLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  alertTargetVal: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 14, marginBottom: spacing.xl },
  
  alertButtonsRow: { flexDirection: 'row', gap: spacing.md },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333A36', paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill },
  retryBtnText: { ...typography.bodyBold, color: '#D1D5DB', fontSize: 15 },
  viewLogsBtn: { alignItems: 'center', backgroundColor: '#4ADE80', paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill },
  viewLogsBtnText: { ...typography.bodyBold, color: '#0A0D0C', fontSize: 15 },

  dataCard: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.lg, marginBottom: spacing.md },
  cardHeaderLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 13, letterSpacing: 1, marginBottom: spacing.md },
  
  copyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  copyRowText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#A0ADC0', fontSize: 15 },

  dataText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#FFFFFF', fontSize: 15, marginBottom: 4 },
  subText: { ...typography.caption, color: colors.textSecondary, fontSize: 14 },

  hugeNumber: { fontWeight: '800', color: '#FFFFFF', fontSize: 26, letterSpacing: -0.5 },
  hugeNumberSub: { ...typography.body, color: colors.textMuted, fontSize: 15 },
  progressBarBg: { height: 4, backgroundColor: '#333A36', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: '#F472B6', borderRadius: 2 },

  protocolPillGreen: { backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  protocolPillGreenText: { ...typography.captionBold, color: '#4ADE80', fontSize: 13, letterSpacing: 0.5 },
  protocolPillDark: { backgroundColor: '#333A36', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  protocolPillDarkText: { ...typography.captionBold, color: colors.textSecondary, fontSize: 13, letterSpacing: 0.5 },

  payloadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  payloadSizeText: { ...typography.captionBold, color: colors.textSecondary, fontSize: 12 },
  payloadBox: { backgroundColor: '#0A0D0C', borderRadius: borderRadius.md, padding: spacing.lg, paddingLeft: 24, overflow: 'hidden' },
  leftAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2 },
  payloadCodeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, color: '#4ADE80', lineHeight: 20 },

  contextContainer: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, padding: spacing.lg, marginTop: spacing.xl, marginBottom: 50 },
  logLine: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1D2421', paddingBottom: spacing.md, marginBottom: spacing.md },
  logLineTime: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 14, width: 90, flexShrink: 0 },
  logLineDesc: { ...typography.caption, color: '#D1D5DB', fontSize: 14, flex: 1, lineHeight: 16 },
});
