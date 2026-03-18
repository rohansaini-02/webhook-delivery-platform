// ─── Navigation Type Definitions ───────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Webhooks: undefined;
  Logs: undefined;
  DashboardTab: undefined;
  DLQ: undefined;
  Settings: undefined;
};

export type WebhooksStackParamList = {
  SubscriptionsList: undefined;
  SubscriptionDetails: { subscriptionId: string };
};

export type LogsStackParamList = {
  DeliveryLogs: undefined;
  EventDetails: { deliveryId: string };
};

export type DLQStackParamList = {
  DLQList: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  SecuritySettings: undefined;
};
