import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ScrollView, ActivityIndicator, Alert, Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Link, ArrowRight, Zap, FlaskConical, Circle, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { createSubscription } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

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

export default function CreateSubscriptionScreen({ navigation }: any) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [env, setEnv] = useState<'prod' | 'stage'>('prod');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['*']);

  const eventOptions = [
    { id: '*', label: 'All Events', desc: 'Listen to every system activity' },
    { id: 'user.signup', label: 'User Signup', desc: 'New user registration events' },
    { id: 'payment.success', label: 'Payment Success', desc: 'Completed transaction triggers' },
    { id: 'subscription.updated', label: 'Sub Updated', desc: 'Billing plan changes' },
  ];

  const toggleEvent = (id: string) => {
    if (id === '*') {
      setSelectedEvents(['*']);
      return;
    }
    const newEvents = selectedEvents.filter(e => e !== '*');
    if (newEvents.includes(id)) {
      const filtered = newEvents.filter(e => e !== id);
      setSelectedEvents(filtered.length === 0 ? ['*'] : filtered);
    } else {
      setSelectedEvents([...newEvents, id]);
    }
  };

  const handleCreate = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid webhook URL');
      return;
    }
    setLoading(true);
    try {
      await createSubscription({ 
        url: url.trim(), 
        events: selectedEvents,
        environment: env.toUpperCase() as any
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const payloadPreview = `{
  "event": "subscription.verify",
  "id": "sub_8L94DJj",
  "timestamp": 1698715432
}`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Subscription</Text>
          </View>
        </View>

        {/* Page Titles */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Create Pipeline</Text>
          <Text style={styles.pageSubtitle}>Configure a new data stream orchestrator by defining your destination endpoint.</Text>
        </View>

        <GlassCard title="ENDPOINT CONFIGURATION" color="#4ADE80">
          <Text style={styles.label}>WEBHOOK ENDPOINT URL</Text>
          <View style={styles.inputContainer}>
            <Link size={16} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://api.your-infra.com/v1/ingest"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.helperTextContainer}>
            <ShieldAlert size={12} color="rgba(255,255,255,0.3)" style={{marginRight: 6}} />
            <Text style={styles.helperText}>Endpoint must support HTTPS and return a 200 OK status to initial handshake</Text>
          </View>

          <View style={styles.envSelectionRow}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.envCard, env === 'prod' && styles.envCardActive]} 
              onPress={() => setEnv('prod')}
            >
              <Zap size={16} color={env === 'prod' ? '#4ADE80' : 'rgba(255,255,255,0.4)'} fill={env === 'prod' ? '#4ADE80' : 'transparent'} />
              <Text style={[styles.envText, env === 'prod' && styles.envTextActive]}>Production</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.envCard, env === 'stage' && styles.envCardActive]} 
              onPress={() => setEnv('stage')}
            >
              <FlaskConical size={16} color={env === 'stage' ? '#A78BFA' : 'rgba(255,255,255,0.4)'} />
              <Text style={[styles.envText, env === 'stage' && styles.envTextActive]}>Staging</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard title="EVENT ORCHESTRATION" color="#A78BFA">
          <View style={styles.eventGrid}>
            {eventOptions.map(opt => {
              const isSelected = selectedEvents.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.eventItem, isSelected && styles.eventItemActive]}
                  onPress={() => toggleEvent(opt.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <CheckCircle2 size={12} color="#FFFFFF" />}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.eventLabel, isSelected && {color: '#FFFFFF'}]}>{opt.label}</Text>
                    <Text style={styles.eventDesc} numberOfLines={1}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </GlassCard>

        <GlassCard title="INITIAL HANDSHAKE PAYLOAD" color="#F472B6">
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{payloadPreview}</Text>
          </View>
        </GlassCard>

        <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85} style={styles.primaryBtn}>
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.primaryBtnText}>Deploy Infrastructure</Text>
              <ArrowRight size={18} color="#000000" />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.footerInfo}>
            <Text style={styles.footerInfoText}>NO SETUP FEES • INSTANT DEPLOYMENT</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitle: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  
  pageHeader: { marginBottom: 32, alignItems: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { ...typography.h1, color: '#FFFFFF', marginBottom: spacing.sm, fontSize: 32, fontWeight: '800' },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 20, textAlign: 'center', fontSize: 15 },
  
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

  label: { ...typography.captionBold, fontSize: 12, letterSpacing: 1, color: colors.textMuted, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.sm, paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, color: '#FFFFFF', paddingVertical: 14, fontSize: 15 },
  helperTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: spacing.lg },
  helperText: { ...typography.small, color: colors.textMuted, fontSize: 13, flex: 1 },

  envSelectionRow: { flexDirection: 'row', gap: spacing.md },
  envCard: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: borderRadius.md, 
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  envCardActive: { 
    backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)',
  },
  envText: { ...typography.bodyBold, color: colors.textSecondary, fontSize: 14 },
  envTextActive: { color: "#FFFFFF" },

  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, color: '#4ADE80', lineHeight: 20 },
  
  primaryBtn: { 
    backgroundColor: '#4ADE80', borderRadius: borderRadius.md, 
    paddingVertical: 18, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.xl 
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primaryBtnText: { ...typography.bodyBold, color: '#000000', fontSize: 16 },
  
  footerInfo: { alignItems: 'center', marginBottom: spacing.xl },
  footerInfoText: { ...typography.small, color: 'rgba(255,255,255,0.1)', letterSpacing: 1.5, fontSize: 11, fontWeight: '700' },

  eventGrid: { gap: spacing.sm },
  eventItem: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.02)', padding: spacing.md, 
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' 
  },
  eventItemActive: { backgroundColor: 'rgba(167, 139, 250, 0.05)', borderColor: 'rgba(167, 139, 250, 0.2)' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: spacing.md, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#A78BFA', borderColor: '#A78BFA' },
  eventLabel: { ...typography.bodyBold, color: colors.textSecondary, fontSize: 14 },
  eventDesc: { ...typography.small, color: colors.textMuted, fontSize: 12 },
});
 
