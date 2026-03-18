import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { MainTabParamList, WebhooksStackParamList, LogsStackParamList, SettingsStackParamList } from './types';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import SubscriptionsListScreen from '../screens/SubscriptionsListScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import DeliveryLogsScreen from '../screens/DeliveryLogsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import DLQScreen from '../screens/DLQScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SecurityScreen from '../screens/SecurityScreen';

// ─── Webhooks Stack ──────────────────────────────────────────────────────────
const WebhooksStack = createNativeStackNavigator<WebhooksStackParamList>();
function WebhooksNavigator() {
  return (
    <WebhooksStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <WebhooksStack.Screen name="SubscriptionsList" component={SubscriptionsListScreen} />
      <WebhooksStack.Screen name="SubscriptionDetails" component={SubscriptionDetailsScreen} />
    </WebhooksStack.Navigator>
  );
}

// ─── Logs Stack ──────────────────────────────────────────────────────────────
const LogsStack = createNativeStackNavigator<LogsStackParamList>();
function LogsNavigator() {
  return (
    <LogsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <LogsStack.Screen name="DeliveryLogs" component={DeliveryLogsScreen} />
      <LogsStack.Screen name="EventDetails" component={EventDetailsScreen} />
    </LogsStack.Navigator>
  );
}

// ─── Settings Stack ──────────────────────────────────────────────────────────
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="SecuritySettings" component={SecurityScreen} />
    </SettingsStack.Navigator>
  );
}

// ─── Bottom Tab Navigator ────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Webhooks"
        component={WebhooksNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Webhooks" emoji="📡" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Logs" emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTab}>
              <View style={[styles.centerTabInner, focused && styles.centerTabFocused]}>
                <Text style={styles.centerTabIcon}>⬡</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DLQ"
        component={DLQScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="DLQ" emoji="⚠️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    height: 75,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji: { fontSize: 20, opacity: 0.5 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { ...typography.small, color: colors.tabInactive, fontSize: 10 },
  tabLabelActive: { color: colors.tabActive, fontWeight: '600' },
  centerTab: { alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  centerTabInner: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.glow,
  },
  centerTabFocused: { backgroundColor: colors.primarySoft },
  centerTabIcon: { fontSize: 24, color: colors.textInverse },
});
