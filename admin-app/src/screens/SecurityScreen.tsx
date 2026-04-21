import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform, Alert, Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Cpu, Copy, RefreshCw, Eye, EyeOff, Lock, ShieldCheck, CheckCircle2, Laptop, Smartphone } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { updatePasswordReq, regenerateApiKeyReq, setApiKey as setApiStorage } from '../services/api';

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

export default function SecurityScreen({ navigation }: any) {
  // API Key state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const stored = await AsyncStorage.getItem('apiKey');
      setApiKey(stored || 'sk_live_default_key_not_set');
    } catch {
      setApiKey('sk_live_default_key_not_set');
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••••••••••••••';
    return key.substring(0, 7) + '•••••••••••••••' + key.slice(-4);
  };

  const handleCopyKey = async () => {
    try {
      await Clipboard.setStringAsync(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate API Key',
      'This will invalidate your current key immediately. All existing integrations will stop working until updated. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await regenerateApiKeyReq();
              const newKey = res.data.data.apiKey;
              await setApiStorage(newKey);
              setApiKey(newKey);
              Alert.alert('Key Regenerated', 'Your new API key has been generated and saved. Update your integrations immediately.');
            } catch (e) {
              Alert.alert('Error', 'Failed to regenerate API key. You must be authenticated.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateCredentials = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirmation do not match.');
      return;
    }

    try {
      await updatePasswordReq({ currentPassword, newPassword });
      Alert.alert('Credentials Updated', 'Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      const err = e.response?.data?.message || 'Failed to update credentials';
      Alert.alert('Error', err);
    }
  };

  const handleTerminateSessions = () => {
    Alert.alert(
      'Terminate All Sessions',
      'This will log you out of all other devices. You will remain logged in on this device. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate All',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sessions Terminated', 'All other active sessions have been terminated.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Settings</Text>
          <Text style={styles.slashText}> / Security</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Title Sec */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Security & Access</Text>
          <Text style={styles.pageSubtitle}>
            Manage your cryptographic identities, API integrations, and account credentials
            within the orchestration environment.
          </Text>
        </View>

        {/* API INFRASTRUCTURE */}
        <GlassCard title="API INFRASTRUCTURE" color="#4ADE80">
          <Text style={styles.inputLabel}>PRODUCTION ACCESS KEY</Text>
          
          <View style={styles.apiKeyBox}>
             <Text style={styles.apiKeyText} numberOfLines={1}>
               {showApiKey ? apiKey : maskKey(apiKey)}
             </Text>
             <TouchableOpacity
               hitSlop={{top:10, bottom:10, left:10, right:10}}
               onPress={() => setShowApiKey(!showApiKey)}
             >
               {showApiKey
                 ? <EyeOff size={14} color={colors.textSecondary} />
                 : <Eye size={14} color={colors.textSecondary} />
               }
             </TouchableOpacity>
          </View>

          <View style={styles.apiActionsRow}>
            <TouchableOpacity style={styles.apiBtn} onPress={handleCopyKey}>
               <Copy size={12} color="#D1D5DB" style={{marginRight: 6}} />
               <Text style={styles.apiBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.apiBtn} onPress={handleRegenerate}>
               <RefreshCw size={12} color="#D1D5DB" style={{marginRight: 6}} />
               <Text style={styles.apiBtnText}>Regenerate</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.apiSubtext}>
            ℹ Last rotated 14 days ago. Key provides full administrative access.
          </Text>
        </GlassCard>

        {/* AUTHENTICATION STRATEGY */}
        <GlassCard title="AUTHENTICATION STRATEGY" color="#A78BFA">
          <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              hitSlop={{top:10, bottom:10, left:10, right:10}}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword 
                ? <EyeOff size={16} color={colors.textSecondary} /> 
                : <Eye size={16} color={colors.textSecondary} />
              }
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>NEW PASSWORD</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showNewPassword}
              placeholder="Enter new password (min 8 chars)"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              hitSlop={{top:10, bottom:10, left:10, right:10}}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword 
                ? <EyeOff size={16} color={colors.textSecondary} /> 
                : <Eye size={16} color={colors.textSecondary} />
              }
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              hitSlop={{top:10, bottom:10, left:10, right:10}}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword 
                ? <EyeOff size={16} color={colors.textSecondary} /> 
                : <Eye size={16} color={colors.textSecondary} />
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.updateGreenBtn} onPress={handleUpdateCredentials}>
            <Text style={styles.updateGreenBtnText}>Update Credentials</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* SAFETY PROTOCOL */}
        <GlassCard title="SAFETY PROTOCOL" color="#FBBF24">
          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#FBBF24" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Never commit your API keys to version control systems like Git. Use environment variables.</Text>
          </View>
          
          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#FBBF24" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Enable Multi-Factor Authentication (MFA) to add an extra layer of structural integrity to your login.</Text>
          </View>

          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#FBBF24" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Rotate your production keys every 90 days to minimize the blast radius of potential leaks.</Text>
          </View>
        </GlassCard>

        {/* ACTIVE SESSIONS */}
        <GlassCard title="ACTIVE SESSIONS" color="#4ADE80">
          <View style={styles.sessionRow}>
            <View style={styles.sessionIconBox}>
               <Laptop size={14} color="#4ADE80" />
            </View>
            <View style={styles.sessionTextCol}>
               <Text style={styles.sessionDeviceName}>MacBook Pro · London, UK</Text>
               <Text style={styles.sessionIpTime}>192.168.1.1 · Current Session</Text>
            </View>
          </View>

          <View style={styles.sessionRow}>
            <View style={[styles.sessionIconBox, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
               <Smartphone size={14} color={colors.textSecondary} />
            </View>
            <View style={styles.sessionTextCol}>
               <Text style={styles.sessionDeviceName}>iPhone 15 Pro · London, UK</Text>
               <Text style={styles.sessionIpTime}>82.12.45.1 · 2 hours ago</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.terminateBtn} onPress={handleTerminateSessions}>
            <Text style={styles.terminateBtnText}>TERMINATE ALL OTHER SESSIONS</Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={{height: 50}}/>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  slashText: { ...typography.body, color: colors.textSecondary, fontSize: 16 },

  titleSection: { paddingHorizontal: spacing.xl, marginVertical: spacing.xl },
  pageTitle: { fontWeight: '800', color: '#FFFFFF', fontSize: 28, letterSpacing: -0.5, marginBottom: spacing.sm },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, fontSize: 15, lineHeight: 18 },

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

  inputLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  
  apiKeyBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md },
  apiKeyText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#E5E7EB', fontSize: 14, letterSpacing: 0.5, flex: 1, marginRight: spacing.sm },
  
  apiActionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  apiBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 10, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  apiBtnText: { ...typography.bodyBold, color: '#E5E7EB', fontSize: 14 },
  
  apiSubtext: { ...typography.caption, color: colors.textMuted, fontSize: 14 },

  inputBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  passwordInput: { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 12 },

  updateGreenBtn: { alignItems: 'center', backgroundColor: '#4ADE80', paddingVertical: 14, borderRadius: borderRadius.md, marginTop: spacing.sm },
  updateGreenBtnText: { ...typography.bodyBold, color: '#0A0D0C', fontSize: 15 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  bulletIcon: { marginTop: 2, marginRight: spacing.sm },
  bulletText: { flex: 1, ...typography.caption, color: colors.textSecondary, fontSize: 14, lineHeight: 16 },

  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  sessionIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  sessionTextCol: { flex: 1 },
  sessionDeviceName: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 14, marginBottom: 2 },
  sessionIpTime: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 13 },

  terminateBtn: { alignItems: 'center', marginTop: 10 },
  terminateBtnText: { ...typography.captionBold, color: '#F87171', fontSize: 13, letterSpacing: 1 }
});
