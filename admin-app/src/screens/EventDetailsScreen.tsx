import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Platform, Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, RotateCcw, Copy, UploadCloud, DownloadCloud, ChevronRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { fetchDelivery, replayDlqItem } from '../services/api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassCard = ({ children, title, subtitle, color = '#4ADE80', style, noPadding = false }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.01, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.8, duration: 300, useNativeDriver: true })
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.3, duration: 300, useNativeDriver: true })
    ]).start();
  };

  return (
    <Animated.View style={[styles.cardContainer, style, { transform: [{ scale }] }]}>
      <Animated.View style={[styles.glowLayer, { opacity: glowOpacity, shadowColor: color }]} />
      <View style={styles.glassContainer}>
        {Platform.OS === 'web' ? (
          <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,25,22,0.7)', backdropFilter: 'blur(20px)' } as any]} />
        ) : (
          <BlurView intensity={20} tint="dark" style={styles.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(28,34,32,0.9)', 'rgba(15,18,17,0.85)']}
          style={styles.absoluteFill}
        />
        <View style={[styles.cardContent, noPadding && { padding: 0 }]}>
          {title && (
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderLabel}>{title}</Text>
              {subtitle && <Text style={[styles.cardHeaderLabelRight, { color }]}>{subtitle}</Text>}
            </View>
          )}
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

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
        <GlassCard color={isFailed ? '#F87171' : '#4ADE80'}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md}}>
            <View style={[styles.criticalDot, { backgroundColor: isFailed ? '#F87171' : '#4ADE80' }]} />
            <Text style={[styles.criticalText, { color: isFailed ? '#F87171' : '#4ADE80' }]}>
              {isFailed ? 'CRITICAL FAILURE' : 'DELIVERY SUCCESS'}
            </Text>
          </View>

          <Text style={styles.alertTitle}>
            {data.status} - {statusCode} {isFailed ? 'Error' : 'OK'}
          </Text>
          
          <View style={styles.endpointRow}>
            <Text style={styles.alertTargetLabel}>Target Destination:</Text>
            <Text style={styles.alertTargetVal} numberOfLines={1}>{data.subscription?.url || 'https://api.internal-infra.io'}</Text>
          </View>

          <View style={styles.alertButtonsRow}>
            {isFailed && (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} disabled={replaying}>
                {replaying ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                   <>
                     <RotateCcw size={14} color="#FFFFFF" style={{marginRight: 6}} />
                     <Text style={styles.retryBtnText}>Retry Now</Text>
                   </>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.backButtonGlass} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonGlassText}>Back to Logs</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* BASIC INFORMATION */}
        <GlassCard title="BASIC INFORMATION">
          <PropertyRow label="EVENT ID" value={deliveryId} isMonospace />
          <PropertyRow label="TIMESTAMP" value={new Date(data.createdAt).toLocaleString()} />
          <PropertyRow 
            label="STATUS" 
            value={`${data.status} (${statusCode})`} 
            valueColor={isFailed ? '#F87171' : '#4ADE80'} 
          />
          <PropertyRow label="PROTOCOL" value="HTTP/1.1 (JSON)" isLast />
        </GlassCard>

        {/* DELIVERY ATTEMPTS */}
        <GlassCard title="DELIVERY ATTEMPTS" color={isFailed ? '#F87171' : '#4ADE80'}>
          <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md}}>
            <Text style={styles.hugeNumber}>{data.attempts}</Text>
            <Text style={styles.hugeNumberSub}> / {data.maxAttempts} max retries</Text>
          </View>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${(data.attempts / data.maxAttempts) * 100}%`, backgroundColor: isFailed ? '#F87171' : '#4ADE80' }]} />
          </View>
        </GlassCard>

        {/* REQUEST PAYLOAD Block */}
        <View style={{ marginTop: spacing.sm, marginHorizontal: spacing.xl }}>
           <View style={styles.payloadOuterHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                 <UploadCloud size={14} color="rgba(255,255,255,0.4)" />
                 <Text style={styles.outerHeaderLabel}>REQUEST PAYLOAD</Text>
              </View>
              <Text style={styles.payloadSizeText}>2.4 KB</Text>
           </View>
           <GlassCard color="#F472B6" noPadding>
              <TouchableOpacity activeOpacity={0.7} onPress={() => copyToClipboard(reqPayload)} style={styles.payloadBox}>
                <Text style={styles.payloadCodeText}>{reqPayload}</Text>
              </TouchableOpacity>
           </GlassCard>
        </View>

        {/* RESPONSE BODY Block */}
        <View style={{ marginTop: spacing.lg, marginHorizontal: spacing.xl }}>
           <View style={styles.payloadOuterHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                 <DownloadCloud size={14} color="rgba(255,255,255,0.4)" />
                 <Text style={styles.outerHeaderLabel}>EXECUTION CONTEXT</Text>
              </View>
           </View>
           <GlassCard color={isFailed ? '#F87171' : '#4ADE80'} noPadding>
              <TouchableOpacity activeOpacity={0.7} onPress={() => copyToClipboard(resPayload)} style={styles.payloadBox}>
                <Text style={[styles.payloadCodeText, { color: isFailed ? '#F87171' : '#4ADE80' }]}>{resPayload}</Text>
              </TouchableOpacity>
           </GlassCard>
        </View>

        {/* PERFORMANCE METRICS */}
        <GlassCard title="PERFORMANCE METRICS" style={{ marginTop: spacing.lg }}>
          <PropertyRow 
            label="LATENCY" 
            value={`${data.latencyMs || 0} ms`} 
            valueColor={data.latencyMs > 500 ? '#FBBF24' : '#4ADE80'} 
          />
          <PropertyRow label="EVENT TYPE" value={data.event?.type} />
          <PropertyRow label="DESTINATION" value={data.subscription?.url} isMonospace isLast />
        </GlassCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 100 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4 },
  headerTitleText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16 },

  cardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  glassContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  absoluteFill: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: spacing.xl },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  cardHeaderLabel: { ...typography.captionBold, color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2 },
  cardHeaderLabelRight: { ...typography.captionBold, fontSize: 11, fontWeight: '800' },

  criticalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  criticalText: { ...typography.captionBold, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' },
  alertTitle: { ...typography.h2, color: '#FFFFFF', marginBottom: spacing.md },
  
  endpointRow: { marginBottom: spacing.xl },
  alertTargetLabel: { ...typography.small, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  alertTargetVal: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  
  alertButtonsRow: { flexDirection: 'row', gap: spacing.md },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F87171', paddingHorizontal: 20, paddingVertical: 12, borderRadius: borderRadius.md },
  retryBtnText: { ...typography.small, fontWeight: '800', color: '#FFFFFF' },
  backButtonGlass: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backButtonGlassText: { ...typography.small, fontWeight: '700', color: '#FFFFFF' },

  propRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)'
  },
  propLabel: { ...typography.small, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  propValue: { ...typography.small, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: spacing.xl },
 
  hugeNumber: { ...typography.h1, color: '#FFFFFF' },
  hugeNumberSub: { ...typography.body, color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
 
  payloadOuterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: spacing.sm },
  outerHeaderLabel: { ...typography.captionBold, color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1.5 },
  payloadSizeText: { ...typography.small, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  payloadBox: { 
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  payloadCodeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#4ADE80', lineHeight: 18 },
});
