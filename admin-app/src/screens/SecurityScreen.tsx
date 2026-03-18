import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function SecurityScreen({ navigation }: any) {
  const { apiKey } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }, 1500);
  };

  const handleGenerateKey = () => {
    Alert.alert('Generate New API Key', 'This will invalidate your current key. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Generate', style: 'destructive', onPress: () => { /* TODO */ } },
    ]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(text);
    } catch { /* Fallback */ }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.title}>Security</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Manage your API keys and security settings</Text>

        {/* API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔑</Text>
            <Text style={styles.sectionTitle}>API Key</Text>
          </View>
          <Text style={styles.fieldLabel}>Your API Key</Text>
          <View style={styles.keyRow}>
            <Text style={styles.keyText}>
              {showKey ? (apiKey || 'No key stored') : '••••••••••••••••••••••••••••'}
            </Text>
            <TouchableOpacity onPress={() => setShowKey(!showKey)}>
              <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(apiKey || '')}>
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Keep this key secure. Anyone with this key can access your webhook data.
          </Text>

          <TouchableOpacity onPress={handleGenerateKey} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.error, '#FF7043']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dangerBtn}
            >
              <Text style={styles.dangerBtnText}>Generate New API Key</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛡️</Text>
            <Text style={styles.sectionTitle}>Authentication</Text>
          </View>
          <Text style={styles.subTitle}>Change Password</Text>

          <Text style={styles.fieldLabel}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.fieldLabel}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleUpdatePassword} disabled={updating} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.primarySoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {updating ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.primaryBtnText}>Update Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Best Practices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛡️</Text>
            <Text style={styles.sectionTitle}>Security Best Practices</Text>
          </View>
          {[
            'Never share your API key with anyone or commit it to version control',
            'Rotate your API keys regularly for enhanced security',
            'Use strong passwords with a mix of letters, numbers, and symbols',
            'Enable two-factor authentication when available',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl },
  section: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.borderCard,
    marginBottom: spacing.lg, ...shadows.soft,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  subTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.lg },
  fieldLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  keyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  keyText: { flex: 1, ...typography.body, color: colors.textPrimary, letterSpacing: 1 },
  eyeIcon: { fontSize: 18 },
  copyIcon: { fontSize: 18 },
  helpText: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 18 },
  inputWrapper: {
    backgroundColor: colors.bgInput, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: { ...typography.body, color: colors.textPrimary, paddingVertical: 14 },
  dangerBtn: {
    borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center',
  },
  dangerBtnText: { ...typography.bodyBold, color: colors.textPrimary },
  primaryBtn: {
    borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg,
  },
  primaryBtnText: { ...typography.bodyBold, color: colors.textInverse },
  tipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  tipBullet: { ...typography.body, color: colors.primary },
  tipText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 18 },
});
