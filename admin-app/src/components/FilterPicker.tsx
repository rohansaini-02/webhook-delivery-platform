import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Pressable, ScrollView, Modal, Dimensions
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

interface FilterPickerProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string) => void;
  flex?: number;
}

export default function FilterPicker({ label, value, options, onSelect, flex = 1 }: FilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const viewRef = React.useRef<View>(null);

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
  };

  const onTriggerPress = () => {
    if (viewRef.current) {
      viewRef.current.measure((fx, fy, width, height, px, py) => {
        setLayout({ x: px, y: py, width, height });
        setIsOpen(true);
      });
    }
  };

  return (
    <View style={{ flex }} ref={viewRef} collapsable={false}>
      <TouchableOpacity 
        style={[styles.trigger, isOpen && styles.triggerOpen]} 
        activeOpacity={0.8}
        onPress={onTriggerPress}
      >
        <View style={styles.triggerContent}>
          <Text style={styles.label}>{label}: </Text>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
        </View>
        <ChevronDown 
          size={14} 
          color={isOpen ? '#4ADE80' : colors.textSecondary} 
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
          <View 
            style={[
              styles.dropdownContent, 
              { 
                top: layout.y + layout.height + 4, 
                left: layout.x, 
                width: layout.width 
              }
            ]}
          >
            <ScrollView 
              bounces={false}
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 250 }}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {options.map((item) => (
                <TouchableOpacity 
                  key={item}
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
                    <Check size={16} color="#4ADE80" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

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
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 44,
  },
  triggerOpen: {
    borderColor: '#4ADE80',
    backgroundColor: '#1A211E',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  label: { 
    ...typography.small, 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 12,
    fontWeight: '600'
  },
  value: { 
    ...typography.small, 
    color: '#FFFFFF', 
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContent: {
    position: 'absolute',
    backgroundColor: '#1A211E',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
