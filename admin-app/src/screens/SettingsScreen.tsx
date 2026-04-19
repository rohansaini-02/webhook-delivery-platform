import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Platform, Alert, Linking
} from 'react-native';
import { User, Bell, RotateCcw, BookOpen, Headset, Shield, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

export default function SettingsScreen({ navigation }: any) {
  const { logout, userEmail } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoRetry, setAutoRetry] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notifPref = await AsyncStorage.getItem('pref_notifications');
      const retryPref = await AsyncStorage.getItem('pref_autoRetry');
      if (notifPref !== null) setNotifications(notifPref === 'true');
      if (retryPref !== null) setAutoRetry(retryPref === 'true');
    } catch {}
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotifications(value);
      await AsyncStorage.setItem('pref_notifications', String(value));
      if (value) {
        Alert.alert('Notifications Enabled', 'You will receive alerts for delivery failures.');
      }
    } catch (error) {
       Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const handleAutoRetryToggle = async (value: boolean) => {
    try {
      setAutoRetry(value);
      await AsyncStorage.setItem('pref_autoRetry', String(value));
      if (value) {
        Alert.alert('Auto-Retry Enabled', 'System will automatically attempt to restart failing gateway nodes.');
      }
    } catch {
       Alert.alert('Error', 'Failed to save preference.');
    }
  };

  const handleDocumentation = () => {
    Linking.openURL('https://docs.webhookplatform.io').catch(() => {
      Alert.alert('Documentation', 'API references, CLI guides, and architecture schemas are available at docs.webhookplatform.io');
    });
  };

  const handleSupport = () => {
    Alert.alert('Contact Support', 'Reach our infrastructure specialists at support@orchestrator.io or open a ticket in the dashboard.');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://webhookplatform.io/privacy').catch(() => {
      Alert.alert('Privacy Policy', 'Our data handling and security protocols are available at webhookplatform.io/privacy');
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of the Webhook Platform?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <UserAvatar size={30} />
          <Text style={styles.headerTitleText}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero Block */}
        <View style={styles.profileHero}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarMain}>
              <UserAvatar size={100} />
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN PROFILE</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.heroName}>{userEmail?.split('@')[0] || 'Administrator'}</Text>
          <Text style={styles.heroRole}>ENGINEERING LEAD</Text>
          <Text style={styles.heroEmail}>{userEmail}</Text>
        </View>

        {/* ACCOUNT & SECURITY */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
          <TouchableOpacity 
            style={[styles.cardBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(74,222,128,0.1)', marginRight: 16 }]}>
                <Shield size={16} color="#4ADE80" />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Security & Access</Text>
                <Text style={styles.toggleSub}>API Keys, Passwords, Active Sessions</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* SYSTEM PREFERENCES */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>SYSTEM PREFERENCES</Text>
          
          <View style={styles.cardBox}>
            <View style={styles.toggleRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                <Bell size={16} color="#4ADE80" />
              </View>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Notifications</Text>
                <Text style={styles.toggleSub}>Real-time alerts for node failures</Text>
              </View>
              <View onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false}>
                <Switch value={notifications} onValueChange={handleNotificationToggle} trackColor={{ false: '#333A36', true: '#4ADE80' }} thumbColor="#FFFFFF" />
              </View>
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={[styles.iconBox, { backgroundColor: '#1D2421' }]}>
                <RotateCcw size={16} color="#D1D5DB" />
              </View>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Auto-retry</Text>
                <Text style={styles.toggleSub}>Automatically restart failed instances</Text>
              </View>
              <View onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false}>
                <Switch value={autoRetry} onValueChange={handleAutoRetryToggle} trackColor={{ false: '#333A36', true: '#4ADE80' }} thumbColor="#A0ADC0" />
              </View>
            </View>
          </View>
        </View>

        {/* RESOURCES & SUPPORT */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>RESOURCES & SUPPORT</Text>

          <TouchableOpacity style={styles.resourceCardFull} onPress={handleDocumentation}>
            <BookOpen size={18} color="#4ADE80" style={{marginBottom: spacing.sm}} />
            <Text style={styles.resourceCardTitle}>Documentation</Text>
            <Text style={styles.resourceCardSub}>API references, CLI guides, and architecture schemas.</Text>
          </TouchableOpacity>

          <View style={styles.resourceGrid}>
            <TouchableOpacity style={styles.resourceCardHalf} onPress={handleSupport}>
              <Headset size={16} color="#A78BFA" style={{marginBottom: spacing.sm}} />
              <Text style={styles.resourceCardTitle}>Support</Text>
              <Text style={styles.resourceCardSub}>Direct line to infrastructure specialists.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCardHalf} onPress={handlePrivacy}>
              <Shield size={16} color="#D1D5DB" style={{marginBottom: spacing.sm}} />
              <Text style={styles.resourceCardTitle}>Privacy Policy</Text>
              <Text style={styles.resourceCardSub}>Data handling and security protocols.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color="#FCA5A5" style={{marginRight: spacing.sm}} />
          <Text style={styles.logoutBtnText}>Logout from platform</Text>
        </TouchableOpacity>

        {/* Build Version */}
        <Text style={styles.versionText}>VERSION 4.2.0-ALPHA • BUILD 88291</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 16 },
  searchBtn: { padding: 4 },

  profileHero: { alignItems: 'center', marginVertical: spacing.xl },
  avatarGlow: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(74,222,128,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.1)' },
  avatarMain: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A212B', overflow: 'hidden' },
  avatarMockup: { flex: 1, backgroundColor: '#21334A' },
  
  adminBadge: { position: 'absolute', bottom: 6, left: '15%', right: '15%', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, borderRadius: 2 },
  adminBadgeText: { ...typography.captionBold, color: '#FFFFFF', fontSize: 11, textAlign: 'center', letterSpacing: 0.5 },

  heroName: { fontWeight: '800', color: '#FFFFFF', fontSize: 28, marginTop: spacing.md, marginBottom: 2 },
  heroRole: { ...typography.captionBold, color: colors.textSecondary, fontSize: 13, letterSpacing: 1.5, marginBottom: 4 },
  heroEmail: { ...typography.body, color: colors.textMuted, fontSize: 15 },

  sectionBlock: { marginHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionHeader: { ...typography.captionBold, color: '#FFFFFF', fontSize: 13, letterSpacing: 1.5, marginBottom: spacing.md },

  cardBox: { backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1E2528', paddingBottom: spacing.md, marginBottom: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  toggleTextCol: { flex: 1, paddingRight: spacing.md },
  toggleTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 15, marginBottom: 2 },
  toggleSub: { ...typography.caption, color: colors.textMuted, fontSize: 14, lineHeight: 14 },

  resourceCardFull: { backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.xl, marginBottom: spacing.md },
  resourceCardTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16, marginBottom: 4 },
  resourceCardSub: { ...typography.caption, color: colors.textSecondary, fontSize: 14, lineHeight: 16 },

  resourceGrid: { flexDirection: 'row', gap: spacing.md },
  resourceCardHalf: { flex: 1, backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.lg },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#211215', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, paddingVertical: 16, marginTop: spacing.lg, marginBottom: spacing.xl },
  logoutBtnText: { ...typography.bodyBold, color: '#FCA5A5', fontSize: 15 },

  versionText: { ...typography.captionBold, color: colors.textMuted, textAlign: 'center', fontSize: 12, letterSpacing: 2 }
});
