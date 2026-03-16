// Shared TypeScript types used across the API

export type EventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'payment.success'
  | 'payment.failed'
  | 'order.created'
  | 'order.failed';

export type DeliveryStatusType = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'DLQ';

export interface IncomingEvent {
  type: EventType;
  payload: Record<string, unknown>;
}

export interface CreateSubscriptionDto {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateSubscriptionDto {
  url?: string;
  events?: string[];
  isActive?: boolean;
}
