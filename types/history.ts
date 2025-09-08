export type HistoryEventType = 
  | 'supply_added'
  | 'supply_updated' 
  | 'supply_deleted'
  | 'supply_quantity_changed'
  | 'item_started_using'
  | 'item_stopped_using'
  | 'insulin_volume_updated'
  | 'device_ended_early'
  | 'timer_added'
  | 'timer_updated'
  | 'timer_deleted'
  | 'timer_reset'
  | 'notification_sent'
  | 'notification_received'
  | 'data_cleared';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  type: HistoryEventType;
  title: string;
  description: string;
  metadata?: {
    supplyId?: string;
    supplyName?: string;
    supplyCategory?: string;
    itemId?: string;
    timerId?: string;
    oldValue?: any;
    newValue?: any;
    quantityChange?: number;
    volumeUsed?: number;
    notificationType?: string;
  };
}

export const EVENT_TYPE_LABELS = {
  supply_added: 'Supply Added',
  supply_updated: 'Supply Updated',
  supply_deleted: 'Supply Deleted',
  supply_quantity_changed: 'Quantity Changed',
  item_started_using: 'Started Using',
  item_stopped_using: 'Stopped Using',
  insulin_volume_updated: 'Insulin Used',
  device_ended_early: 'Device Ended Early',
  timer_added: 'Timer Added',
  timer_updated: 'Timer Updated',
  timer_deleted: 'Timer Deleted',
  timer_reset: 'Timer Reset',
  notification_sent: 'Notification Sent',
  notification_received: 'Notification Received',
  data_cleared: 'Data Cleared'
} as const;

export const EVENT_TYPE_COLORS = {
  supply_added: '#4CAF50',      // Green
  supply_updated: '#2196F3',    // Blue
  supply_deleted: '#F44336',    // Red
  supply_quantity_changed: '#FF9800', // Orange
  item_started_using: '#9C27B0', // Purple
  item_stopped_using: '#607D8B', // Blue Grey
  insulin_volume_updated: '#3F51B5', // Indigo
  device_ended_early: '#FF5722', // Deep Orange
  timer_added: '#009688',       // Teal
  timer_updated: '#795548',     // Brown
  timer_deleted: '#E91E63',     // Pink
  timer_reset: '#FFC107',       // Amber
  notification_sent: '#00BCD4', // Cyan
  notification_received: '#8BC34A', // Light Green
  data_cleared: '#9E9E9E'       // Grey
} as const;
