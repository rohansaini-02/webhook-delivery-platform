import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Platform
} from 'react-native';
import { Search, Bell, RotateCcw, Moon, BookOpen, Headset, Shield, LogOut, Edit2 } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [autoRetry, setAutoRetry] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
             <Search size={16} color="#FFFFFF" strokeWidth={2.5}/>
          </View>
          <Text style={styles.headerTitleText}>The Orchestrator</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero Block */}
        <View style={styles.profileHero}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarMain}>
              {/* Replace with an actual Image tag if asset exists, using colored block for now */}
              <View style={styles.avatarMockup} />
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN PROFILE</Text>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Edit2 size={12} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.heroName}>Alex Rivera</Text>
          <Text style={styles.heroRole}>LEAD INFRASTRUCTURE ENGINEER</Text>
          <Text style={styles.heroEmail}>alex.rivera@orchestrator.io</Text>
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
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#333A36', true: '#4ADE80' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.toggleRow}>
              <View style={[styles.iconBox, { backgroundColor: '#1D2421' }]}>
                <RotateCcw size={16} color="#D1D5DB" />
              </View>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Auto-retry</Text>
                <Text style={styles.toggleSub}>Automatically restart failed instances</Text>
              </View>
              <Switch value={autoRetry} onValueChange={setAutoRetry} trackColor={{ false: '#333A36', true: '#4ADE80' }} thumbColor="#A0ADC0" />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={[styles.iconBox, { backgroundColor: '#1D2421' }]}>
                <Moon size={16} color="#D1D5DB" />
              </View>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Dark Mode</Text>
                <Text style={styles.toggleSub}>Persistent obsidian interface</Text>
              </View>
              <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#333A36', true: '#4ADE80' }} thumbColor="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* RESOURCES & SUPPORT */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>RESOURCES & SUPPORT</Text>

          {/* Doc Card Single */}
          <TouchableOpacity style={styles.resourceCardFull}>
            <BookOpen size={18} color="#4ADE80" style={{marginBottom: spacing.sm}} />
            <Text style={styles.resourceCardTitle}>Documentation</Text>
            <Text style={styles.resourceCardSub}>API references, CLI guides, and architecture schemas.</Text>
          </TouchableOpacity>

          {/* Grid Cards Two */}
          <View style={styles.resourceGrid}>
            <TouchableOpacity style={styles.resourceCardHalf}>
              <Headset size={16} color="#A78BFA" style={{marginBottom: spacing.sm}} />
              <Text style={styles.resourceCardTitle}>Support</Text>
              <Text style={styles.resourceCardSub}>Direct line to infrastructure specialists.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCardHalf}>
              <Shield size={16} color="#D1D5DB" style={{marginBottom: spacing.sm}} />
              <Text style={styles.resourceCardTitle}>Privacy Policy</Text>
              <Text style={styles.resourceCardSub}>Data handling and security protocols.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={16} color="#FCA5A5" style={{marginRight: spacing.sm}} />
          <Text style={styles.logoutBtnText}>Logout from Orchestrator</Text>
        </TouchableOpacity>

        {/* Build Version */}
        <Text style={styles.versionText}>VERSION 4.2.0-ALPHA • BUILD 88291</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101416' },
  scroll: { paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 13 },
  searchBtn: { padding: 4 },

  profileHero: { alignItems: 'center', marginVertical: spacing.xl },
  avatarGlow: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(74,222,128,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.1)' },
  avatarMain: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A212B', overflow: 'hidden' },
  avatarMockup: { flex: 1, backgroundColor: '#21334A' },
  
  adminBadge: { position: 'absolute', bottom: 6, left: '15%', right: '15%', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, borderRadius: 2 },
  adminBadgeText: { ...typography.captionBold, color: '#FFFFFF', fontSize: 7, textAlign: 'center', letterSpacing: 0.5 },
  
  editBtn: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#4ADE80', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#101416' },

  heroName: { fontWeight: '800', color: '#FFFFFF', fontSize: 26, marginTop: spacing.md, marginBottom: 2 },
  heroRole: { ...typography.captionBold, color: colors.textSecondary, fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  heroEmail: { ...typography.body, color: colors.textMuted, fontSize: 12 },

  sectionBlock: { marginHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionHeader: { ...typography.captionBold, color: '#FFFFFF', fontSize: 9, letterSpacing: 1.5, marginBottom: spacing.md },

  cardBox: { backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1E2528', paddingBottom: spacing.md, marginBottom: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  toggleTextCol: { flex: 1, paddingRight: spacing.md },
  toggleTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 12, marginBottom: 2 },
  toggleSub: { ...typography.caption, color: colors.textMuted, fontSize: 10, lineHeight: 14 },

  resourceCardFull: { backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.xl, marginBottom: spacing.md },
  resourceCardTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13, marginBottom: 4 },
  resourceCardSub: { ...typography.caption, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },

  resourceGrid: { flexDirection: 'row', gap: spacing.md },
  resourceCardHalf: { flex: 1, backgroundColor: '#15191B', borderRadius: borderRadius.md, padding: spacing.lg },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#211215', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, paddingVertical: 16, marginTop: spacing.lg, marginBottom: spacing.xl },
  logoutBtnText: { ...typography.bodyBold, color: '#FCA5A5', fontSize: 12 },

  versionText: { ...typography.captionBold, color: colors.textMuted, textAlign: 'center', fontSize: 8, letterSpacing: 2 }
});
