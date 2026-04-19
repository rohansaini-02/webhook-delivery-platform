import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { colors, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react-native';

interface Props {
  style?: ViewStyle;
  size?: number;
}

export default function UserAvatar({ style, size = 30 }: Props) {
  const { userEmail } = useAuth();

  const getInitials = (email: string | null) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    const parts = namePart.split(/[._-]/);
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return namePart.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userEmail);
  const radius = size / 2;
  const avatarUrl = userEmail 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail)}&background=101416&color=4ADE80&bold=true&size=128`
    : null;

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: radius },
      style
    ]}>
      {avatarUrl ? (
        <Image 
          source={{ uri: avatarUrl }} 
          style={{ width: size, height: size, borderRadius: radius }} 
        />
      ) : (
        <View style={styles.fallback}>
          <User size={size * 0.6} color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    overflow: 'hidden'
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyBold,
    color: colors.primary,
  }
});
