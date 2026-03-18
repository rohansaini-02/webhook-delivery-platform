import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const { userEmail, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Developer Admin</Text>
            <Text style={styles.profileEmail}>{userEmail || 'admin@webhookflow.io'}</Text>
          </View>
        </View>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>🌙</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingMeta}>Toggle theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={darkMode ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingMeta}>Get alerted on delivery failures</Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>📧</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Email Alerts</Text>
              <Text style={styles.settingMeta}>Daily digest of system health</Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>🔒</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security Settings</Text>
              <Text style={styles.settingMeta}>Manage API keys and authentication</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* System */}
        <Text style={styles.sectionLabel}>System</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>🗄️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Data & Storage</Text>
              <Text style={styles.settingMeta}>Clear cache, manage local data</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 20 }}>📋</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Export Logs</Text>
              <Text style={styles.settingMeta}>Download delivery history as CSV</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2026.03.20</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Platform</Text>
            <Text style={styles.aboutValue}>iOS + Android</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.error, '#FF7043']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>↪ Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>WebhookFlow Admin v1.0.0</Text>
        <Text style={styles.footerSub}>© 2026 All rights reserved</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 100 },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.borderCard,
    marginBottom: spacing.xxl, ...shadows.soft,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.borderFocused,
  },
  avatarText: { ...typography.h2, color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { ...typography.bodyBold, color: colors.textPrimary },
  profileEmail: { ...typography.caption, color: colors.textSecondary },
  sectionLabel: { ...typography.captionBold, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  section: {
    backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.borderCard,
    marginBottom: spacing.md, overflow: 'hidden', ...shadows.soft,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  settingContent: { flex: 1 },
  settingTitle: { ...typography.bodyBold, color: colors.textPrimary },
  settingMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  chevron: { fontSize: 22, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  aboutLabel: { ...typography.body, color: colors.textSecondary },
  aboutValue: { ...typography.bodyBold, color: colors.textPrimary },
  logoutBtn: {
    borderRadius: borderRadius.md, paddingVertical: 16,
    alignItems: 'center', marginTop: spacing.xl,
  },
  logoutText: { ...typography.bodyBold, color: colors.textPrimary },
  footer: { ...typography.caption, color: colors.info, textAlign: 'center', marginTop: spacing.xxl },
  footerSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
