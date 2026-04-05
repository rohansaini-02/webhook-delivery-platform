import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Radio, ClipboardList, Hexagon, AlertTriangle, Settings, LayoutDashboard } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { MainTabParamList, WebhooksStackParamList, LogsStackParamList, SettingsStackParamList } from './types';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import SubscriptionsListScreen from '../screens/SubscriptionsListScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import CreateSubscriptionScreen from '../screens/CreateSubscriptionScreen';
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
      <WebhooksStack.Screen name="CreateSubscription" component={CreateSubscriptionScreen} />
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
const Tab = createMaterialTopTabNavigator<MainTabParamList>();

function TabIcon({ label, icon: Icon, focused, isDlq = false }: { label: string; icon: any; focused: boolean; isDlq?: boolean }) {
  const activeColor = isDlq ? colors.dlqPrimary : colors.primary;
  return (
    <View style={styles.tabIconContainer}>
      <Icon size={24} color={focused ? activeColor : colors.textSecondary} />
      <Text style={[styles.tabLabel, { color: focused ? activeColor : colors.textSecondary, fontWeight: focused ? '700' : '500' }]}>{label}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { height: 0, backgroundColor: 'transparent' },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen
        name="Webhooks"
        component={WebhooksNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="SUBS" icon={Radio} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="LOGS" icon={ClipboardList} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTab}>
              <LinearGradient
                colors={focused ? [colors.primary, colors.primarySoft] : [colors.bgCard, colors.bgElevated]}
                style={[styles.centerTabInner, focused && styles.centerTabInnerActive]}
              >
                <LayoutDashboard size={28} color={focused ? colors.textInverse : colors.primary} />
              </LinearGradient>
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary, fontWeight: focused ? '700' : '500', marginTop: 8 }]}>HOME</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DLQ"
        component={DLQScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="DLQ" icon={AlertTriangle} focused={focused} isDlq={true} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="SET" icon={Settings} focused={focused} />,
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
    height: 85,
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4, height: 50 },
  tabLabel: { fontSize: 10, letterSpacing: 0.5 },
  centerTab: { alignItems: 'center', justifyContent: 'center', marginTop: -32 },
  centerTabInner: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.soft,
  },
  centerTabInnerActive: {
    borderColor: 'rgba(255,255,255,0.4)',
    ...shadows.glow,
  },
});
