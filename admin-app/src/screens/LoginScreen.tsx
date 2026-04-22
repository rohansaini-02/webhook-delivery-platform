import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Zap, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { loginSettings, API_BASE } = require('../services/api');
      console.log('[LOGIN] Attempting login at:', `${API_BASE}/auth/login`);
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const res = await loginSettings({ username: cleanUsername, password: cleanPassword });

      // Guard: localtunnel sometimes returns HTML instead of JSON (interstitial page)
      if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
        console.error('[LOGIN] Tunnel returned HTML instead of JSON. Interstitial might be blocked.');
        setError('Tunnel error: Received HTML instead of JSON. Please try again.');
        return;
      }

      const { apiKey, username: returnedUsername } = res.data.data;
      await login(returnedUsername, apiKey);
    } catch (e: any) {
      console.error('[LOGIN] Error details:', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message
      });

      if (e.message?.includes('Network Error')) {
        setError('Network Connection Failed. Check your internet tunnel.');
      } else if (e.response?.status >= 500) {
        setError(`Server Error (${e.response.status}). The backend or tunnel might be down.`);
      } else if (e.response?.status === 404) {
        setError('API Endpoint not found (404). Check your Expo URL configuration.');
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError(`Connect Failed (${e.response?.status || 'Unknown'}). Please check your tunnel.`);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative Glow */}
          <View style={styles.glowOrb} />
          <View style={styles.glowOrb2} />

          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Zap size={36} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Sign in to monitor your webhook delivery engine
          </Text>

          {/* Username input */}
          <Text style={styles.label}>Username*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="admin"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </GlassCard>

          {/* Password input */}
          <Text style={styles.label}>Password*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </GlassCard>

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.primarySoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Zap size={18} color={colors.textInverse} />
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>



          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingTop: 60, paddingBottom: 40 },
  glowOrb: {
    position: 'absolute', top: -80, left: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: colors.primaryGlow, opacity: 0.15,
  },
  glowOrb2: {
    position: 'absolute', top: 60, right: -80, width: 180, height: 180,
    borderRadius: 90, backgroundColor: colors.primaryGlow, opacity: 0.08,
  },
  logoArea: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBadge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.borderFocused,
  },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: {
    ...typography.body, color: colors.textSecondary, textAlign: 'center',
    marginBottom: spacing.xxxl, lineHeight: 22,
  },
  label: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.lg },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: 14 },
  eyeBtn: { padding: spacing.sm },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
  forgotRow: { width: '100%', alignItems: 'flex-end', marginTop: spacing.sm, marginBottom: spacing.sm },
  forgotText: { ...typography.captionBold, color: colors.primary },
  primaryBtn: {
    marginTop: spacing.sm, borderRadius: borderRadius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { ...typography.bodyBold, color: colors.textInverse, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxxl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.bodyBold, color: colors.primary },
});
