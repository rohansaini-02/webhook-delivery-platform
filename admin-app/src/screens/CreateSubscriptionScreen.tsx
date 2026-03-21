import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { createSubscription } from '../services/api';

export default function CreateSubscriptionScreen({ navigation }: any) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid webhook URL');
      return;
    }
    setLoading(true);
    try {
      await createSubscription({ url: url.trim(), events: ['*'] });
      Alert.alert('Success', 'Webhook subscription created successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View />
          </View>
          
          <Text style={styles.title}>New Subscription</Text>
          <Text style={styles.subtitle}>
            Enter the endpoint URL to receive webhook events.
          </Text>

          {/* Form */}
          <Text style={styles.label}>Endpoint URL*</Text>
          <GlassCard intensity={8} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="https://api.yourdomain.com/webhooks"
              placeholderTextColor={colors.textMuted}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </GlassCard>

          <GlassCard intensity={15} style={styles.infoCard}>
            <Text style={styles.infoText}>
              By default, this subscription will listen to all events ('*'). You can modify event filters later from the subscription details page.
            </Text>
          </GlassCard>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.primarySoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Plus size={18} color={colors.textInverse} />
                  <Text style={styles.primaryBtnText}>Create Endpoint</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: { padding: spacing.xs, marginLeft: -spacing.xs },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl, lineHeight: 22 },
  label: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: 14 },
  infoCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg, marginBottom: spacing.xxl,
  },
  infoText: { ...typography.caption, color: colors.info, lineHeight: 20 },
  primaryBtn: {
    borderRadius: borderRadius.md, paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { ...typography.bodyBold, color: colors.textInverse },
});
