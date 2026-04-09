import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform
} from 'react-native';
import { Search, User, Cpu, Copy, RefreshCw, Eye, Lock, ShieldCheck, CheckCircle2, Laptop, Smartphone, Shield } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function SecurityScreen() {
  return (
    <View style={styles.container}>
      {/* Header Row */}
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

        {/* Title Sec */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Security & Access</Text>
          <Text style={styles.pageSubtitle}>
            Manage your cryptographic identities, API integrations, and account credentials
            within the orchestration environment.
          </Text>
        </View>

        {/* API INFRASTRUCTURE */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Cpu size={14} color="#4ADE80" style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>API INFRASTRUCTURE</Text>
          </View>

          <Text style={styles.inputLabel}>PRODUCTION ACCESS KEY</Text>
          
          <View style={styles.apiKeyBox}>
             <Text style={styles.apiKeyText}>sk_live_•••••••••••••••••••••4f2a</Text>
             <TouchableOpacity hitSlop={{top:10, bottom:10, left:10, right:10}}>
               <Eye size={12} color={colors.textSecondary} />
             </TouchableOpacity>
          </View>

          <View style={styles.apiActionsRow}>
            <TouchableOpacity style={styles.apiBtn}>
               <Copy size={12} color="#D1D5DB" style={{marginRight: 6}} />
               <Text style={styles.apiBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.apiBtn}>
               <RefreshCw size={12} color="#D1D5DB" style={{marginRight: 6}} />
               <Text style={styles.apiBtnText}>Regenerate</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.apiSubtext}>
            ℹ Last rotated 14 days ago. Key provides full administrative access.
          </Text>
        </View>

        {/* AUTHENTICATION STRATEGY */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Lock size={14} color="#4ADE80" style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>AUTHENTICATION STRATEGY</Text>
          </View>

          <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
          <View style={styles.inputBox}><Text style={styles.stubDots}>•••••••••••••</Text></View>
          
          <Text style={styles.inputLabel}>NEW PASSWORD</Text>
          <View style={styles.inputBox}><Text style={styles.stubDots}>•••••••••••••</Text></View>
          
          <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
          <View style={styles.inputBox}><Text style={styles.stubDots}>•••••••••••••</Text></View>

          <TouchableOpacity style={styles.updateGreenBtn}>
            <Text style={styles.updateGreenBtnText}>Update Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* SAFETY PROTOCOL */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <ShieldCheck size={14} color="#4ADE80" style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>SAFETY PROTOCOL</Text>
          </View>

          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#4ADE80" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Never commit your API keys to version control systems like Git. Use environment variables.</Text>
          </View>
          
          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#4ADE80" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Enable Multi-Factor Authentication (MFA) to add an extra layer of structural integrity to your login.</Text>
          </View>

          <View style={styles.bulletRow}>
            <CheckCircle2 size={12} color="#4ADE80" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Rotate your production keys every 90 days to minimize the blast radius of potential leaks.</Text>
          </View>
        </View>

        {/* ACTIVE SESSIONS */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.lg }]}>ACTIVE SESSIONS</Text>
          
          {/* macOS */}
          <View style={styles.sessionRow}>
            <View style={styles.sessionIconBox}>
               <Laptop size={14} color="#4ADE80" />
            </View>
            <View style={styles.sessionTextCol}>
               <Text style={styles.sessionDeviceName}>MacBook Pro · London, UK</Text>
               <Text style={styles.sessionIpTime}>192.168.1.1 · Current Session</Text>
            </View>
          </View>

          {/* iPhone */}
          <View style={styles.sessionRow}>
            <View style={[styles.sessionIconBox, { backgroundColor: '#1A212B' }]}>
               <Smartphone size={14} color={colors.textSecondary} />
            </View>
            <View style={styles.sessionTextCol}>
               <Text style={styles.sessionDeviceName}>iPhone 15 Pro · London, UK</Text>
               <Text style={styles.sessionIpTime}>82.12.45.1 · 2 hours ago</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.terminateBtn}>
            <Text style={styles.terminateBtnText}>TERMINATE ALL OTHER SESSIONS</Text>
          </TouchableOpacity>
        </View>

        {/* ENCRYPTED STREAM VISUAL */}
        <View style={styles.visualBlock}>
           {/* Fallback code-drawn visual bridging the gap since we don't have the image asset */}
           <View style={styles.visualGlow}>
             <Shield size={48} color="#93C5FD" strokeWidth={1} style={{ opacity: 0.8 }} />
           </View>
           <View style={styles.visualBadgeLine}>
              <View style={styles.visualBadge}>
                 <Text style={styles.visualBadgeText}>ENCRYPTED STREAM</Text>
              </View>
           </View>
        </View>

        <View style={{height: 50}}/>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101316' },
  scroll: { paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { ...typography.bodyBold, color: '#4ADE80', fontSize: 13 },
  searchBtn: { padding: 4 },

  titleSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  pageTitle: { fontWeight: '800', color: '#FFFFFF', fontSize: 26, letterSpacing: -0.5, marginBottom: spacing.sm },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  sectionContainer: { marginHorizontal: spacing.xl, backgroundColor: '#161B1E', borderRadius: borderRadius.md, padding: spacing.xl, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { ...typography.captionBold, color: '#FFFFFF', fontSize: 9, letterSpacing: 1.5 },

  inputLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 8, letterSpacing: 1, marginBottom: 6 },
  
  apiKeyBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0D10', borderWidth: 1, borderColor: '#1F262B', borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md },
  apiKeyText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#E5E7EB', fontSize: 12, letterSpacing: 1 },
  
  apiActionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  apiBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#20282C', paddingVertical: 10, borderRadius: borderRadius.sm },
  apiBtnText: { ...typography.bodyBold, color: '#E5E7EB', fontSize: 11 },
  
  apiSubtext: { ...typography.caption, color: colors.textMuted, fontSize: 10 },

  inputBox: { backgroundColor: '#0B0D10', borderWidth: 1, borderColor: '#1F262B', borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md },
  stubDots: { color: colors.textSecondary, letterSpacing: 2 },

  updateGreenBtn: { alignItems: 'center', backgroundColor: '#4ADE80', paddingVertical: 14, borderRadius: borderRadius.sm, marginTop: spacing.sm },
  updateGreenBtnText: { ...typography.bodyBold, color: '#0A0D0C', fontSize: 12 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  bulletIcon: { marginTop: 2, marginRight: spacing.sm },
  bulletText: { flex: 1, ...typography.caption, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },

  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  sessionIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  sessionTextCol: { flex: 1 },
  sessionDeviceName: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 11, marginBottom: 2 },
  sessionIpTime: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textMuted, fontSize: 9 },

  terminateBtn: { alignItems: 'center', marginTop: 10 },
  terminateBtnText: { ...typography.captionBold, color: '#F87171', fontSize: 9, letterSpacing: 1 },

  visualBlock: { marginHorizontal: spacing.xl, height: 160, backgroundColor: '#0B0D10', borderRadius: borderRadius.md, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F262B' },
  visualGlow: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.5, shadowRadius: 30 },
  visualBadgeLine: { position: 'absolute', bottom: 16, left: 16 },
  visualBadge: { backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.pill },
  visualBadgeText: { ...typography.captionBold, color: '#4ADE80', fontSize: 8, letterSpacing: 1 }
});
