import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Zap, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { registerUser, googleAuth } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const EXPO_CLIENT_ID = process.env.EXPO_PUBLIC_EXPO_CLIENT_ID;

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
        console.log('[Auth] Google Auth Successful! Code received:', code);
        handleGoogleCode(code);
      }
    } else if (response?.type === 'error') {
      console.error('[Auth] Google register response error:', response);
      Alert.alert('Error', 'Google registration failed. Please try again.');
    }
  }, [response]);

  const handleGoogleCode = async (code: string) => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'webhook-admin',
        path: 'auth/callback'
      });
      
      console.log('[Auth] Sending registration code to server...');
      const res = await googleAuth({ code, redirectUri });
      const { apiKey, username: returnedUsername } = res.data.data;
      
      console.log('[Auth] Registration Successful! Logged in as:', returnedUsername);
      await login(returnedUsername, apiKey);
    } catch (e: any) {
      console.error('[Auth] Registration exchange failed:', e.response?.data || e.message);
      Alert.alert('Error', e.response?.data?.message || 'Failed to verify Google account with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ username, email, password });
      Alert.alert('Success', 'Account created successfully! You can now log in.');
      navigation.navigate('Login');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (e: any) {
      console.error('Google Auth Error:', e);
      Alert.alert('Error', 'Google Auth Failed. Please try again.');
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

          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Zap size={36} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Set up your admin account to manage webhook deliveries
          </Text>

          {/* Username */}
          <Text style={styles.label}>Username*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="alex_smith123"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </GlassCard>

          {/* Email */}
          <Text style={styles.label}>Email address*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </GlassCard>

          {/* Password */}
          <Text style={styles.label}>Password*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Create a strong password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              {showPass ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </GlassCard>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
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
                  <Sparkles size={18} color={colors.textInverse} />
                  <Text style={styles.primaryBtnText}>Register</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>



          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  primaryBtn: {
    marginTop: spacing.xxl, borderRadius: borderRadius.md,
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
