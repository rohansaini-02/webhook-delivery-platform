import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, Platform, Alert, Animated, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Search, AlertTriangle, RotateCcw, Trash2, Eye, GitBranch, Clock, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { fetchDlqDeliveries, purgeDlq, replayAllDlq, replayDlqItem, fetchEventTypes } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import FilterPicker from '../components/FilterPicker';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassCard = ({ children, title, subtitle, color = '#F87171', style, noPadding = false }: any) => {
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
          <View style={[styles.absoluteFill, { backgroundColor: 'rgba(20,15,15,0.7)', backdropFilter: 'blur(20px)' } as any]} />
        ) : (
          <BlurView intensity={20} tint="dark" style={styles.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(34,28,28,0.9)', 'rgba(22,15,15,0.85)']}
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

export default function DLQScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeEventFilter, setActiveEventFilter] = useState('All');
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  const loadDlq = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await fetchDlqDeliveries(cursor);
      const { data, pagination } = res.data;

      if (cursor) {
        setDlqItems(prev => [...prev, ...data]);
      } else {
        setDlqItems(data);
      }

      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasMore || false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load DLQ deliveries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadTypes = async () => {
    try {
      const res = await fetchEventTypes();
      const types = res.data.data || [];
      if (!types.includes('test.dlq')) types.push('test.dlq');
      setEventTypes(types);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDlq();
    loadTypes();
  }, []);

  const handleReplayAll = () => {
    Alert.alert(
      'Replay All Messages',
      `This will re-queue all ${dlqItems.length} failed messages for reprocessing. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replay All', style: 'destructive', onPress: async () => {
            await replayAllDlq();
            Alert.alert('Queued', 'All messages have been added to the replay queue.');
            loadDlq();
          }
        },
      ]
    );
  };

  const handlePurge = () => {
    Alert.alert(
      'Purge Queue',
      `This will permanently delete all ${dlqItems.length} failed messages. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purge All', style: 'destructive', onPress: async () => {
            await purgeDlq();
            Alert.alert('Purged', 'All DLQ messages have been permanently deleted.');
            loadDlq();
          }
        },
      ]
    );
  };

  const handleReplayItem = (id: string) => {
    Alert.alert('Replay', `Replay message ${id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Replay', style: 'default', onPress: async () => {
          await replayDlqItem(id);
          Alert.alert('Queued', 'Message added to the replay queue.');
          loadDlq();
        }
      },
    ]);
  };

  const handleViewItem = (id: string) => {
    navigation.navigate('EventDetails', { deliveryId: id });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header Section */}
      <View style={styles.stickyHeader}>
        {Platform.OS === 'web' ? (
          <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,13,12,0.8)', backdropFilter: 'blur(10px)'} as any} />
        ) : (
          <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <UserAvatar size={30} />
            <Text style={styles.headerTitleText}>DLQ</Text>
            <Text style={styles.slashText}> / Failures</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Search size={14} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by ID or Status..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.searchInput}
            value={filterText}
            onChangeText={setFilterText}
          />
        </View>

        <View style={styles.filterControlsRow}>
          <FilterPicker 
            label="Type"
            value={activeEventFilter}
            options={['All', ...eventTypes]}
            onSelect={setActiveEventFilter}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={{ marginTop: spacing.lg }} color="#F87171">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <AlertTriangle size={12} color="#F87171" style={{ marginRight: 6 }} />
            <Text style={styles.alertLabelText}>DEAD LETTER QUEUE ALERT</Text>
          </View>

          <Text style={styles.hugeAlertNumber}>{dlqItems.length}</Text>
          <Text style={styles.alertDescText}>
            Total permanently failed messages requiring manual resolution. These events have exceeded all retry attempts.
          </Text>

          <View style={styles.alertActionsRow}>
            <TouchableOpacity style={styles.replayAllBtn} onPress={handleReplayAll}>
              <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.replayAllBtnText}>Replay All</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Table Headers */}
        <View style={styles.tableHeaders}>
          <Text style={[styles.headerLabel, styles.headerLeftLabel]}>IDENTIFIER & SOURCE</Text>
          <Text style={[styles.headerLabel, styles.headerRightLabel]}>ERROR REASON</Text>
        </View>

        {dlqItems.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40, marginBottom: 40 }}>No DLQ items found.</Text>
        )}

        {dlqItems
          .filter(item => {
            if (activeEventFilter !== 'All' && item.event.type !== activeEventFilter) return false;
            if (!filterText) return true;
            const q = filterText.toLowerCase();
            return item.id.toLowerCase().includes(q) || item.subscription.url.toLowerCase().includes(q);
          })
          .map((item) => {
            return (
              <GlassCard 
                key={item.id} 
                color="#F59E0B" 
                noPadding 
                style={{ marginHorizontal: spacing.xl, marginBottom: spacing.md }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.itemInnerRow}
                  onPress={() => handleViewItem(item.id)}
                >
                  <View style={styles.cardHeaderArea}>
                    <View style={styles.colLeft}>
                      <Text style={[styles.identifierText, { color: '#F59E0B' }]}>{item.event.type}</Text>
                      <View style={styles.idPill}>
                        <Text style={styles.idPillText}>{item.id.substring(0, 8).toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.colRight}>
                      <Text style={styles.reasonTitle} numberOfLines={1}>{item.lastStatusCode || 'Failed'}: {item.lastError || 'Unknown Error'}</Text>
                      <Text style={styles.reasonSub} numberOfLines={1}>Target: {item.subscription.url}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActionsArea}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleReplayItem(item.id)}><RotateCcw size={14} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleViewItem(item.id)}><Eye size={14} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Delete', 'Delete feature mock')}><Trash2 size={14} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </GlassCard>
            );
          })}

        {/* Pagination Footer */}
        {hasMore && (
          <View style={styles.paginationFooter}>
            <TouchableOpacity
              style={[styles.replayAllBtn, { backgroundColor: '#22272A', width: '100%', justifyContent: 'center' }, loadingMore && { opacity: 0.7 }]}
              onPress={() => loadDlq(nextCursor!)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={colors.textSecondary} />
              ) : (
                <Text style={[styles.replayAllBtnText, { color: colors.textSecondary }]}>Load more failures</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone: Purge Queue */}
        <GlassCard color="#F87171" style={{ marginTop: spacing.xl, marginHorizontal: spacing.xl }}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>Permanently delete all Dead Letter Queue messages. This action cannot be undone.</Text>
          <TouchableOpacity style={styles.purgeBtnLine} onPress={handlePurge}>
            <Trash2 size={14} color="#F87171" style={{ marginRight: 8 }} />
            <Text style={styles.purgeBtnTextLine}>Purge Entire Queue</Text>
          </TouchableOpacity>
        </GlassCard>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 120 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 50, marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 167, 38, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  headerTitleText: { ...typography.bodyBold, color: '#F87171', fontSize: 16 },
  slashText: { ...typography.body, color: colors.textSecondary, fontSize: 16 },
  
  stickyHeader: { 
    backgroundColor: colors.bg, 
    borderBottomWidth: 1, 
    borderColor: colors.border,
    paddingBottom: spacing.lg,
    zIndex: 10
  },

  alertContainer: { marginHorizontal: spacing.xl, marginBottom: spacing.lg, padding: spacing.xl, borderRadius: borderRadius.md, backgroundColor: '#141718', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.2)' },
  alertLabelText: { ...typography.captionBold, color: '#F87171', fontSize: 13, letterSpacing: 1 },
  hugeAlertNumber: { fontWeight: '800', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 4 },
  alertDescText: { ...typography.body, color: colors.textSecondary, fontSize: 14, lineHeight: 20, paddingRight: 20, marginBottom: spacing.xl },

  alertActionsRow: { flexDirection: 'row', gap: spacing.md },
  replayAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F87171', borderRadius: borderRadius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  replayAllBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 15 },

  dangerZone: { marginHorizontal: spacing.xl, marginTop: spacing.xl, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#331515', backgroundColor: '#1A0E0E' },
  dangerTitle: { ...typography.bodyBold, color: '#F87171', fontSize: 15, marginBottom: 4 },
  dangerDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  purgeBtnLine: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#331515', borderRadius: borderRadius.pill, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#5C1C1C' },
  purgeBtnTextLine: { ...typography.bodyBold, color: '#FCA5A5', fontSize: 15 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: borderRadius.md,
    backgroundColor: '#161B19', borderWidth: 1, borderColor: colors.border
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: '#FFFFFF', padding: 0 },

  filterControlsRow: { 
    flexDirection: 'row', 
    marginHorizontal: spacing.xl, 
    marginBottom: spacing.xs 
  },

  tableHeaders: { flexDirection: 'row', marginHorizontal: spacing.xl, paddingLeft: 24, paddingRight: spacing.lg, marginBottom: spacing.sm },
  headerLabel: { ...typography.captionBold, color: colors.textMuted, fontSize: 13, letterSpacing: 1 },
  headerLeftLabel: { flex: 1.2 },
  headerRightLabel: { flex: 2 },

  dlqCard: { backgroundColor: '#141718', borderRadius: borderRadius.md, marginHorizontal: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
  leftAccent: { position: 'absolute', left: 0, top: spacing.md, bottom: spacing.md, width: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2 },

  cardHeaderArea: { flexDirection: 'row', padding: spacing.lg, paddingLeft: 24, paddingBottom: spacing.sm },
  colLeft: { flex: 1.2, alignItems: 'flex-start', paddingRight: spacing.sm },
  identifierText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, marginBottom: spacing.sm, fontWeight: '700' },
  idPill: { backgroundColor: '#333A36', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  idPillText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#FFFFFF', fontSize: 13 },

  colRight: { flex: 2 },
  reasonTitle: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16, marginBottom: 2 },
  reasonSub: { ...typography.caption, color: colors.textMuted, fontSize: 14, lineHeight: 16 },

  cardActionsArea: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  iconBtn: { padding: 4 },

  chevronRow: { alignItems: 'flex-end', paddingRight: spacing.lg, paddingBottom: spacing.sm },
  chevronBtn: { backgroundColor: '#333A36', borderRadius: 4, padding: 4 },

  payloadSection: { paddingHorizontal: 24, paddingBottom: spacing.lg },
  payloadTitle: { ...typography.captionBold, color: '#F87171', fontSize: 13, letterSpacing: 1.5, marginBottom: spacing.md },
  payloadCodeBox: { backgroundColor: '#0A0D0C', padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.md },
  payloadCodeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, color: '#A0ADC0', lineHeight: 20 },

  payloadActionRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginTop: spacing.sm },
  editPayloadBtn: { backgroundColor: '#333A36', borderRadius: borderRadius.pill, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: 'center' },
  editPayloadBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16 },
  replayNowBtn: { backgroundColor: '#F87171', borderRadius: borderRadius.pill, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: 'center' },
  replayNowBtnText: { ...typography.bodyBold, color: '#FFFFFF', fontSize: 16 },

  paginationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: 40 },
  paginationText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.textSecondary, fontSize: 14 },
  pagesRow: { flexDirection: 'row', gap: 6 },
  pageBtn: { backgroundColor: '#22272A', minWidth: 32, height: 32, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  pageBtnActive: { backgroundColor: '#F87171', minWidth: 32, height: 32, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  pageText: { ...typography.caption, color: colors.textSecondary },
  pageTextActive: { ...typography.captionBold, color: '#FFFFFF' },

  cardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
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
  itemInnerRow: { paddingVertical: spacing.md },
});


