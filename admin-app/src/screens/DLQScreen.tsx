import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, Platform
} from 'react-native';
import { User, Search, AlertTriangle, RotateCcw, Trash2, Eye, GitBranch, Clock, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchDeliveries } from '../services/api';

export default function DLQScreen() {
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>('id-order-shipment');

  useEffect(() => {
    // mock delay
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const payloadMock = `{
  "order_id": "ORD-5521",
  "customer": "Sarah Jenkins",
  "address": {
    "street": "1248 Oak Lane",
    "city": "Mountain View",
    "zip": "ABC-123",
    "country": "US"
  },
  "metadata": {
    "retry_count": 5,
    "last_attempt": "2023-10-24T13:58:04Z",
    "dead_reason": "VAL_ERR_ZIP"
  }
}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
             <User size={16} color="#F87171" />
          </View>
          <Text style={styles.headerTitleText}>The Orchestrator</Text>
          <Text style={styles.slashText}> / DLQ</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Dead Letter Queue Alert Container */}
        <View style={styles.alertContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
            <AlertTriangle size={12} color="#F87171" style={{marginRight: 6}} />
            <Text style={styles.alertLabelText}>DEAD LETTER QUEUE ALERT</Text>
          </View>
          
          <Text style={styles.hugeAlertNumber}>1,284</Text>
          <Text style={styles.alertDescText}>
            Total permanently failed messages requiring manual resolution. These events have exceeded all retry attempts.
          </Text>
          
          <View style={styles.alertActionsRow}>
            <TouchableOpacity style={styles.replayAllBtn}>
              <RotateCcw size={14} color="#FFFFFF" style={{marginRight: 6}} />
              <Text style={styles.replayAllBtnText}>Replay All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.purgeBtn}>
              <Text style={styles.purgeBtnText}>Purge Queue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.searchWrap}>
          <GitBranch size={14} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            placeholder="Filter by Message ID, Payload, or Status..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Chip Filters Row */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.chipBtn}>
            <GitBranch size={12} color={colors.textSecondary} style={{marginRight: 6}} />
            <Text style={styles.chipText}>Topic: All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipBtn}>
            <Clock size={12} color={colors.textSecondary} style={{marginRight: 6}} />
            <Text style={styles.chipText}>All Time</Text>
          </TouchableOpacity>
        </View>

        {/* Table Headers */}
        <View style={styles.tableHeaders}>
          <Text style={[styles.headerLabel, styles.headerLeftLabel]}>IDENTIFIER & SOURCE</Text>
          <Text style={[styles.headerLabel, styles.headerRightLabel]}>ERROR REASON</Text>
        </View>

        {/* Item 1 */}
        <View style={styles.dlqCard}>
          <View style={[styles.leftAccent, { backgroundColor: '#F59E0B' }]} />
          <View style={styles.cardHeaderArea}>
            <View style={styles.colLeft}>
              <Text style={[styles.identifierText, { color: '#F59E0B' }]}>payment.auth.v</Text>
              <View style={styles.idPill}>
                 <Text style={styles.idPillText}>9F82X_??_PRD</Text>
              </View>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.reasonTitle}>504: Gateway Timeout</Text>
              <Text style={styles.reasonSub}>Upstream service "ledger-api"...</Text>
            </View>
          </View>
          <View style={styles.cardActionsArea}>
             <TouchableOpacity style={styles.iconBtn}><RotateCcw size={14} color={colors.textSecondary} /></TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}><Eye size={14} color={colors.textSecondary} /></TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}><Trash2 size={14} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        </View>

        {/* Item 2 (Expanded) */}
        <View style={[styles.dlqCard, { borderColor: '#F87171' }]}>
          <View style={[styles.leftAccent, { backgroundColor: '#F59E0B' }]} />
          
          <View style={styles.cardHeaderArea}>
            <View style={styles.colLeft}>
              <Text style={[styles.identifierText, { color: '#F59E0B' }]}>order.shipment</Text>
              <View style={styles.idPill}>
                 <Text style={styles.idPillText}>3K11P_08.SYS</Text>
              </View>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.reasonTitle}>422: Unprocessable Entity</Text>
              <Text style={styles.reasonSub}>Validation Error: Zip code 'ABC-123' is invalid for region 'US-CAL'.</Text>
            </View>
          </View>

          <View style={styles.chevronRow}>
            <TouchableOpacity style={styles.chevronBtn} onPress={() => setExpandedId(null)}>
               <ChevronUp size={14} color="#F87171" />
            </TouchableOpacity>
          </View>

          {/* Expanded Payload Section */}
          <View style={styles.payloadSection}>
            <Text style={styles.payloadTitle}>PAYLOAD CONTENT</Text>
            <View style={styles.payloadCodeBox}>
               <Text style={styles.payloadCodeText}>{payloadMock}</Text>
            </View>
            <View style={styles.payloadActionRow}>
               <TouchableOpacity style={styles.editPayloadBtn}>
                 <Text style={styles.editPayloadBtnText}>Edit Payload</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.replayNowBtn}>
                 <Text style={styles.replayNowBtnText}>Replay Now</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Item 3 */}
        <View style={styles.dlqCard}>
          <View style={[styles.leftAccent, { backgroundColor: '#F59E0B' }]} />
          <View style={styles.cardHeaderArea}>
            <View style={styles.colLeft}>
              <Text style={[styles.identifierText, { color: '#F59E0B' }]}>webhook.stripe</Text>
              <View style={styles.idPill}>
                 <Text style={styles.idPillText}>0X221_FF_SIG</Text>
              </View>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.reasonTitle}>401: Unauthorized</Text>
              <Text style={styles.reasonSub}>Signature verification failed. Key rotation required.</Text>
            </View>
          </View>
          <View style={styles.cardActionsArea}>
             <TouchableOpacity style={styles.iconBtn}><RotateCcw size={14} color={colors.textSecondary} /></TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}><Eye size={14} color={colors.textSecondary} /></TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}><Trash2 size={14} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        </View>

        {/* Pagination Footer */}
        <View style={styles.paginationFooter}>
          <Text style={styles.paginationText}>Showing 1-13 of 1,284 failures</Text>
          <View style={styles.pagesRow}>
            <TouchableOpacity style={styles.pageBtn}><ChevronLeft size={14} color={colors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity style={styles.pageBtnActive}><Text style={styles.pageTextActive}>1</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>2</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>3</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageBtn}><ChevronRight size={14} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1316' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 120 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 167, 38, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  headerTitleText: { ...typography.bodyBold, color: '#F87171', fontSize: 13 },
  slashText: { ...typography.body, color: colors.textSecondary, fontSize: 13 },
  searchBtn: { padding: 4 },

  alertContainer: { marginHorizontal: spacing.xl, marginBottom: spacing.lg, padding: spacing.xl, borderRadius: borderRadius.md, backgroundColor: '#141718', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.2)' },
  alertLabelText: { ...typography.captionBold, color: '#F87171', fontSize: 9, letterSpacing: 1 },
  hugeAlertNumber: { fontWeight: '800', fontSize: 38, color: '#FFFFFF', letterSpacing: -1, marginBottom: 4 },
  alertDescText: { ...typography.body, color: colors.textSecondary, fontSize: 12, lineHeight: 18, paddingRight: 20, marginBottom: spacing.xl },
  
  alertActionsRow: { flexDirection: 'row', gap: spacing.md },
  replayAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F87171', borderRadius: borderRadius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  replayAllBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 12 },
  purgeBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333A36', borderRadius: borderRadius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  purgeBtnText: { ...typography.bodyBold, color: '#F87171', fontSize: 12 },

  searchWrap: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' 
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: '#FFFFFF', padding: 0 },

  chipRow: { flexDirection: 'row', marginHorizontal: spacing.xl, marginBottom: spacing.xl, gap: spacing.sm },
  chipBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22272A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.pill },
  chipText: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },

  tableHeaders: { flexDirection: 'row', marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  headerLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 9, letterSpacing: 1 },
  headerLeftLabel: { flex: 1.2 },
  headerRightLabel: { flex: 2 },

  dlqCard: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
  leftAccent: { position: 'absolute', left: 0, top: spacing.md, bottom: spacing.md, width: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  
  cardHeaderArea: { flexDirection: 'row', padding: spacing.lg, paddingLeft: 24, paddingBottom: spacing.sm },
  colLeft: { flex: 1.2, alignItems: 'flex-start', paddingRight: spacing.sm },
  identifierText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, marginBottom: spacing.sm, fontWeight: '700' },
  idPill: { backgroundColor: '#333A36', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  idPillText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#FFFFFF', fontSize: 9 },

  colRight: { flex: 2 },
  reasonTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13, marginBottom: 2 },
  reasonSub: { ...typography.caption, color: colors.textMuted, fontSize: 11, lineHeight: 16 },

  cardActionsArea: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  iconBtn: { padding: 4 },

  chevronRow: { alignItems: 'flex-end', paddingRight: spacing.lg, paddingBottom: spacing.sm },
  chevronBtn: { backgroundColor: '#333A36', borderRadius: 4, padding: 4 },

  payloadSection: { paddingHorizontal: 24, paddingBottom: spacing.lg },
  payloadTitle: { ...typography.captionBold, color: '#F87171', fontSize: 9, letterSpacing: 1.5, marginBottom: spacing.md },
  payloadCodeBox: { backgroundColor: '#0A0D0C', padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.md },
  payloadCodeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: '#A0ADC0', lineHeight: 20 },

  payloadActionRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginTop: spacing.sm },
  editPayloadBtn: { backgroundColor: '#333A36', borderRadius: borderRadius.pill, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: 'center' },
  editPayloadBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13 },
  replayNowBtn: { backgroundColor: '#F87171', borderRadius: borderRadius.pill, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: 'center' },
  replayNowBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 13 },

  paginationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: 40 },
  paginationText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textSecondary, fontSize: 10 },
  pagesRow: { flexDirection: 'row', gap: 6 },
  pageBtn: { backgroundColor: '#22272A', minWidth: 32, height: 32, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  pageBtnActive: { backgroundColor: '#F87171', minWidth: 32, height: 32, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  pageText: { ...typography.caption, color: colors.textSecondary },
  pageTextActive: { ...typography.captionBold, color: '#FFFFFF' }
});
 
