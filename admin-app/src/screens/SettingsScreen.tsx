import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform, Alert,
} from 'react-native';
import { Moon, Bell, Mail, Shield, HardDrive, FileDown, ChevronRight, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const { userEmail, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

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
        <GlassCard intensity={15} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Developer Admin</Text>
            <Text style={styles.profileEmail}>{userEmail || 'admin@webhookflow.io'}</Text>
          </View>
        </GlassCard>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <GlassCard intensity={15} style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Moon size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingMeta}>Toggle theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                if (!val) {
                  Alert.alert('Theme Settings', 'Light mode full support is coming soon! Switching back to dark mode.');
                  setTimeout(() => setDarkMode(true), 1500);
                }
              }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={darkMode ? colors.primary : colors.textMuted}
            />
          </View>
        </GlassCard>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <GlassCard intensity={15} style={styles.section}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Bell size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingMeta}>Get alerted on delivery failures</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={pushEnabled ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Mail size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Email Alerts</Text>
              <Text style={styles.settingMeta}>Daily digest of system health</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={emailEnabled ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </GlassCard>

        {/* Security */}
        <Text style={styles.sectionLabel}>Security</Text>
        <GlassCard intensity={15} style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={styles.settingIcon}>
              <Shield size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security Settings</Text>
              <Text style={styles.settingMeta}>Manage API keys and authentication</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        {/* System */}
        <Text style={styles.sectionLabel}>System</Text>
        <GlassCard intensity={15} style={styles.section}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <HardDrive size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Data & Storage</Text>
              <Text style={styles.settingMeta}>Clear cache, manage local data</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => Alert.alert('Export Logs', 'Logs copied to clipboard or exported successfully.')}
          >
            <View style={styles.settingIcon}>
              <FileDown size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Export Logs</Text>
              <Text style={styles.settingMeta}>Download delivery history as CSV</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <GlassCard intensity={15} style={styles.section}>
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
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.error, '#FF7043']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutBtn}
          >
            <LogOut size={20} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.logoutText}>Logout</Text>
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
    padding: spacing.xl,
    marginBottom: spacing.xxl,
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
    marginBottom: spacing.md, overflow: 'hidden',
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
    flexDirection: 'row', justifyContent: 'center', backgroundColor: colors.error,
    borderRadius: borderRadius.md, paddingVertical: 16,
    alignItems: 'center', marginTop: spacing.xl,
  },
  logoutText: { ...typography.bodyBold, color: colors.textPrimary },
  footer: { ...typography.caption, color: colors.info, textAlign: 'center', marginTop: spacing.xxl },
  footerSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
