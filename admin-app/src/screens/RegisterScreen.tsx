import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // Registration logic will be implemented with backend auth
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login');
    }, 1500);
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
              <Text style={styles.logoIcon}>⚡</Text>
            </View>
          </View>

          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Set up your admin account to manage webhook deliveries
          </Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Alex Smith"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email address*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Create a strong password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

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
                <Text style={styles.primaryBtnText}>✨ Register</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Text style={styles.socialBtnText}>G  Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Text style={styles.socialBtnText}>  Apple</Text>
            </TouchableOpacity>
          </View>

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
  logoIcon: { fontSize: 36 },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: {
    ...typography.body, color: colors.textSecondary, textAlign: 'center',
    marginBottom: spacing.xxxl, lineHeight: 22,
  },
  label: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.lg },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgInput, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: 14 },
  eyeBtn: { padding: spacing.sm },
  eyeIcon: { fontSize: 18 },
  primaryBtn: {
    marginTop: spacing.xxl, borderRadius: borderRadius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { ...typography.bodyBold, color: colors.textInverse },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xxl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.caption, color: colors.textMuted, marginHorizontal: spacing.md },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialBtn: {
    flex: 1, backgroundColor: colors.bgInput, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  socialBtnText: { ...typography.bodyBold, color: colors.textPrimary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxxl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.bodyBold, color: colors.primary },
});
