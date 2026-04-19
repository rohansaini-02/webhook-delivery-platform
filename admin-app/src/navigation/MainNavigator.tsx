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

// ─── Dashboard Stack ─────────────────────────────────────────────────────────
const DashboardStack = createNativeStackNavigator<any>();
function DashboardNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStack.Screen name="EventDetails" component={EventDetailsScreen} />
    </DashboardStack.Navigator>
  );
}

// ─── Webhooks Stack ──────────────────────────────────────────────────────────
const WebhooksStack = createNativeStackNavigator<WebhooksStackParamList>();
function WebhooksNavigator() {
  return (
    <WebhooksStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <WebhooksStack.Screen name="SubscriptionsList" component={SubscriptionsListScreen} />
      <WebhooksStack.Screen name="SubscriptionDetails" component={SubscriptionDetailsScreen} />
      <WebhooksStack.Screen name="CreateSubscription" component={CreateSubscriptionScreen} />
      <WebhooksStack.Screen name="EventDetails" component={EventDetailsScreen} />
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

// ─── DLQ Stack ──────────────────────────────────────────────────────────────
const DLQStack = createNativeStackNavigator<any>();
function DLQNavigator() {
  return (
    <DLQStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <DLQStack.Screen name="DLQMain" component={DLQScreen} />
      <DLQStack.Screen name="EventDetails" component={EventDetailsScreen} />
    </DLQStack.Navigator>
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
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabLabel, { color: focused ? activeColor : colors.textSecondary, fontWeight: focused ? '700' : '500' }]}>{label}</Text>
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
        animationEnabled: false,
        tabBarPressColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Tab.Screen
        name="Webhooks"
        component={WebhooksNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Subscriptions" icon={Radio} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Logs" icon={ClipboardList} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTab}>
              <LinearGradient
                colors={focused ? [colors.primary, colors.primarySoft] : [colors.bgCard, colors.bgElevated]}
                style={[styles.centerTabInner, focused && styles.centerTabInnerActive]}
              >
                <LayoutDashboard size={34} color={focused ? colors.textInverse : colors.primary} />
              </LinearGradient>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary, fontWeight: focused ? '700' : '500', marginTop: 8 }]}>Dashboard</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DLQ"
        component={DLQNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="DLQ" icon={AlertTriangle} focused={focused} isDlq={true} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" icon={Settings} focused={focused} />,
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
    height: 100,
    paddingTop: 10,
    paddingBottom: 25,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    overflow: 'visible',
  },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4, height: 50, paddingHorizontal: 2 },
  tabLabel: { fontSize: 10, letterSpacing: 0, textAlign: 'center' },
  centerTab: { alignItems: 'center', justifyContent: 'center', marginTop: -5, overflow: 'visible', zIndex: 50 },
  centerTabInner: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  centerTabInnerActive: {
    borderColor: 'rgba(255,255,255,0.4)',
    ...shadows.glow,
  },
});
