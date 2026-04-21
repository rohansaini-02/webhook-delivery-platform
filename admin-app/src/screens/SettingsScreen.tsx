import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Platform, Alert, Linking, Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Bell, RotateCcw, BookOpen, Headset, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

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
    } catch { }
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
            </View>
          </View>

          <Text style={styles.heroName}>{userEmail?.split('@')[0] || 'Administrator'}</Text>
          <Text style={styles.heroRole}>ENGINEERING LEAD</Text>
        </View>

        {/* ACCOUNT & SECURITY */}
        <GlassCard title="ACCOUNT & SECURITY" color="#4ADE80">
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.accountRow}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(74,222,128,0.1)', marginRight: 16 }]}>
                <Shield size={16} color="#4ADE80" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Security & Access</Text>
                <Text style={styles.toggleSub}>API Keys, Passwords, Active Sessions</Text>
              </View>
            </View>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>
        </GlassCard>

        {/* SYSTEM PREFERENCES */}
        <GlassCard title="SYSTEM PREFERENCES" color="#4ADE80">
          <View style={styles.toggleRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
              <Bell size={16} color="#4ADE80" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Notifications</Text>
              <Text style={styles.toggleSub}>Real-time alerts for node failures</Text>
            </View>
            <View onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false}>
              <Switch value={notifications} onValueChange={handleNotificationToggle} trackColor={{ false: 'rgba(255,255,255,0.05)', true: '#4ADE80' }} thumbColor="#FFFFFF" />
            </View>
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <RotateCcw size={16} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Auto-retry</Text>
              <Text style={styles.toggleSub}>Automatically restart failed instances</Text>
            </View>
            <View onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false}>
              <Switch value={autoRetry} onValueChange={handleAutoRetryToggle} trackColor={{ false: 'rgba(255,255,255,0.05)', true: '#4ADE80' }} thumbColor="rgba(255,255,255,0.6)" />
            </View>
          </View>
        </GlassCard>

        {/* RESOURCES & SUPPORT */}
        <View style={{ marginHorizontal: spacing.xl, marginBottom: spacing.xl }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>RESOURCES & SUPPORT</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleDocumentation}>
            <GlassCard color="#4ADE80" noPadding style={{ marginBottom: spacing.md, marginHorizontal: 0 }}>
              <View style={styles.resourceCardFull}>
                <View style={styles.resourceIconWrapper}>
                  <BookOpen size={20} color="#4ADE80" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceCardTitle}>Documentation</Text>
                  <Text style={styles.resourceCardSub}>API references, CLI guides, and architecture schemas.</Text>
                </View>
                <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
              </View>
            </GlassCard>
          </TouchableOpacity>

          <View style={styles.resourceGrid}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSupport} style={{ flex: 1 }}>
              <GlassCard color="#A78BFA" noPadding style={{ marginHorizontal: 0 }}>
                <View style={styles.resourceCardHalf}>
                  <View style={[styles.resourceIconWrapper, { marginBottom: spacing.md, backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                    <Headset size={18} color="#A78BFA" />
                  </View>
                  <Text style={styles.resourceCardTitle}>Support</Text>
                  <Text style={styles.resourceCardSub}>Direct line to our infrastructure specialists.</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={handlePrivacy} style={{ flex: 1 }}>
              <GlassCard color="rgba(255,255,255,0.4)" noPadding style={{ marginHorizontal: 0 }}>
                <View style={styles.resourceCardHalf}>
                  <View style={[styles.resourceIconWrapper, { marginBottom: spacing.md, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Shield size={18} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={styles.resourceCardTitle}>Privacy</Text>
                  <Text style={styles.resourceCardSub}>Our automated data handling protocols.</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <GlassCard color="#F87171" noPadding style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.xl }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={16} color="#FCA5A5" style={{ marginRight: spacing.sm }} />
            <Text style={styles.logoutBtnText}>Logout from platform</Text>
          </TouchableOpacity>
        </GlassCard>

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

  heroName: { fontWeight: '800', color: '#FFFFFF', fontSize: 28, marginTop: spacing.md, marginBottom: 2 },
  heroRole: { ...typography.captionBold, color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 1.5, marginBottom: 4 },

  sectionHeader: { ...typography.captionBold, color: '#FFFFFF', fontSize: 13, letterSpacing: 1.5, marginBottom: spacing.md },
  sectionHeaderRow: { marginBottom: spacing.sm },

  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)', paddingBottom: spacing.md, marginBottom: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  toggleTextCol: { flex: 1, paddingRight: spacing.md },
  toggleTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 15, marginBottom: 2 },
  toggleSub: { ...typography.caption, color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 14 },

  resourceCardFull: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: spacing.xl,
    paddingRight: spacing.lg
  },
  resourceIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(74,222,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg
  },
  resourceCardTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16, marginBottom: 4 },
  resourceCardSub: { ...typography.caption, color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 16 },

  resourceGrid: { flexDirection: 'row', gap: spacing.md },
  resourceCardHalf: { padding: spacing.xl, minHeight: 160, justifyContent: 'flex-start' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  logoutBtnText: { ...typography.bodyBold, color: '#F87171', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  versionText: { ...typography.captionBold, color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontSize: 11, letterSpacing: 2 }
});
