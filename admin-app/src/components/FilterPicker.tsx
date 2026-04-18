import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, 
  FlatList, Dimensions, Pressable 
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

interface FilterPickerProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string) => void;
  flex?: number;
}

export default function FilterPicker({ label, value, options, onSelect, flex = 1 }: FilterPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
  };

  return (
    <View style={{ flex }}>
      <TouchableOpacity 
        style={styles.trigger} 
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.triggerContent}>
          <Text style={styles.label}>{label}: </Text>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
        </View>
        <ChevronDown size={14} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <View style={styles.modalTitleUnderline} />
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText, 
                    value === item && styles.optionTextActive
                  ]}>
                    {item === 'All' ? `All ${label}s` : item}
                  </Text>
                  {value === item && (
                    <Check size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161B19',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  label: { 
    ...typography.small, 
    color: colors.textMuted, 
    fontSize: 12,
    fontWeight: '600'
  },
  value: { 
    ...typography.small, 
    color: colors.primary, 
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#111518',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#22272A',
    ...shadows.soft,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#22272A',
    backgroundColor: '#161B19',
  },
  modalTitle: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalTitleUnderline: {
    width: 24,
    height: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: '#111518',
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#1A1F22',
  },
});
