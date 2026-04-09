import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { ChevronLeft, Link, ArrowRight, Zap, FlaskConical, Circle, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { createSubscription } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function CreateSubscriptionScreen({ navigation }: any) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [env, setEnv] = useState<'prod'|'stage'>('prod');

  const handleCreate = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid webhook URL');
      return;
    }
    setLoading(true);
    try {
      await createSubscription({ url: url.trim(), events: ['*'] });
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
          <Text style={styles.pageTitle}>New Subscription</Text>
          <Text style={styles.pageSubtitle}>Configure a new data stream orchestrator by defining your destination endpoint.</Text>
        </View>

        <Text style={styles.label}>WEBHOOK ENDPOINT URL</Text>
        <View style={styles.inputContainer}>
          <Link size={16} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="https://api.your-infra.com/v1/ingest"
            placeholderTextColor={colors.textMuted}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.helperTextContainer}>
          <ShieldAlert size={12} color={colors.textMuted} style={{marginRight: 6}} />
          <Text style={styles.helperText}>Endpoint must support HTTPS and return a 200 OK status to initial handshake</Text>
        </View>

        {/* Environments */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.envCard, env === 'prod' && styles.envCardActive]} 
          onPress={() => setEnv('prod')}
        >
          <View style={styles.envIconContainer}>
            <Zap size={20} color={colors.primary} fill={colors.primary} />
          </View>
          <View style={styles.envTextContent}>
            <Text style={[styles.envTitle, env === 'prod' && styles.envTitleActive]}>Production</Text>
            <Text style={styles.envSubtitle}>High-priority live stream</Text>
          </View>
          {env === 'prod' ? (
             <CheckCircle2 size={24} color={colors.primary} />
          ) : (
             <Circle size={24} color={colors.border} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.envCard, env === 'stage' && styles.envCardActive]} 
          onPress={() => setEnv('stage')}
        >
          <View style={styles.envIconContainerStaging}>
            <FlaskConical size={20} color={colors.textSecondary} fill="transparent" />
          </View>
          <View style={styles.envTextContent}>
            <Text style={styles.envTitle}>Staging</Text>
            <Text style={styles.envSubtitle}>Sandbox testing environment</Text>
          </View>
          {env === 'stage' ? (
             <CheckCircle2 size={24} color={colors.textSecondary} />
          ) : (
             <Circle size={24} color={'rgba(255,255,255,0.05)'} />
          )}
        </TouchableOpacity>

        <Text style={[styles.label, {marginTop: spacing.xl}]}>INITIAL HANDSHAKE PAYLOAD</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{payloadPreview}</Text>
        </View>

        <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85} style={styles.primaryBtn}>
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.primaryBtnText}>Create Subscription</Text>
              <ArrowRight size={18} color={colors.bg} />
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
  container: { flex: 1, backgroundColor: '#0B0E0D' },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: 40, paddingTop: 50 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 18 },
  
  pageHeader: { marginBottom: 32, alignItems: 'center', paddingHorizontal: spacing.md },
  pageTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg, fontSize: 28 },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22, textAlign: 'center' },
  
  label: { ...typography.captionBold, fontSize: 14, letterSpacing: 1.2, color: colors.textMuted, marginBottom: spacing.sm, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    backgroundColor: '#121615', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, ...typography.caption, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textSecondary, paddingVertical: 18, fontSize: 16 },
  helperTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 32, paddingHorizontal: 4 },
  helperText: { ...typography.small, color: colors.textMuted, fontSize: 14, flex: 1, lineHeight: 14 },

  envCard: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: spacing.lg, borderRadius: borderRadius.lg, 
    backgroundColor: '#0E1110', borderWidth: 1, borderColor: 'rgba(255,255,255,0.01)',
    marginBottom: spacing.sm,
  },
  envCardActive: { 
    backgroundColor: '#161B19', borderColor: 'rgba(255,255,255,0.04)',
  },
  envIconContainer: { marginRight: spacing.lg },
  envIconContainerStaging: { marginRight: spacing.lg },
  envTextContent: { flex: 1 },
  envTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  envTitleActive: { color: "#FFFFFF" },
  envSubtitle: { ...typography.small, color: colors.textMuted },

  codeBlock: {
    backgroundColor: '#121615', borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 40,
  },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 15, color: colors.primary, lineHeight: 22 },
  
  primaryBtn: { 
    backgroundColor: colors.primary, borderRadius: borderRadius.md, 
    paddingVertical: 18, alignItems: 'center', marginBottom: spacing.xl 
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primaryBtnText: { ...typography.bodyBold, color: colors.bg, fontSize: 17 },
  
  footerInfo: { alignItems: 'center', marginBottom: spacing.xl },
  footerInfoText: { ...typography.small, color: 'rgba(255,255,255,0.1)', letterSpacing: 1.5, fontSize: 13, fontWeight: '700' },
});
 
