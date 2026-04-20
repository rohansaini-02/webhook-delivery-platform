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
import { googleAuth } from '../services/api';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const EXPO_CLIENT_ID = process.env.EXPO_PUBLIC_EXPO_CLIENT_ID;

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the Expo Proxy for physical devices
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'webhook-admin',
      path: 'auth/callback'
    }),
  });

  // Handle Auth Response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) {
        // Google Auth Successful
        handleGoogleCode(code);
      }
    } else if (response?.type === 'error') {
      console.error('[Auth] Google response error:', response);
      setError('Google Login failed. Please try again.');
    }
  }, [response]);

  const handleGoogleCode = async (code: string) => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'webhook-admin',
        path: 'auth/callback'
      });
      
      console.log('[Auth] Sending code to backend for verification...');
      // We send the code AND the matching redirectUri so the backend can verify
      const res = await googleAuth({ code, redirectUri });
      const { apiKey, username: returnedUsername } = res.data.data;
      
      // Successful login handled by navigation
      await login(returnedUsername, apiKey);
    } catch (e: any) {
      console.error('[Auth] Backend exchange failed:', e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to verify Google account with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { loginSettings } = require('../services/api');
      const res = await loginSettings({ username: username.trim(), password: password.trim() });
      const { apiKey, username: returnedUsername } = res.data.data;
      await login(returnedUsername, apiKey);
    } catch (e: any) {
      if (e.message?.includes('Network Error')) {
        setError('Network Connection Failed. Ensure your API is running and accessible.');
      } else {
        setError(e.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await promptAsync();
    } catch (e: any) {
      console.error('Google Auth Error:', e);
      setError('Google Auth Failed. Please try again.');
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
  orDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: spacing.md, ...typography.captionBold, color: colors.textMuted },
  googleBtn: {
    borderRadius: borderRadius.md, paddingVertical: 16, alignItems: 'center',
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.borderFocused
  },
  googleBtnText: { ...typography.bodyBold, color: '#000000', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxxl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.bodyBold, color: colors.primary },
});
