import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Supply, InUseItem } from '@/types/supplies';

const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

export interface NotificationSettings {
  lowStockEnabled: boolean;
  expirationEnabled: boolean;
  deviceTimerEnabled: boolean;
  lowStockThreshold: number;
  expirationDays: number;
  deviceReminderHours: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  lowStockEnabled: true,
  expirationEnabled: true,
  deviceTimerEnabled: true,
  lowStockThreshold: 3,
  expirationDays: 7,
  deviceReminderHours: 24
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load settings
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }

      // Request permissions
      await this.requestPermissions();
      
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    console.log('Notification settings updated:', this.settings);
  }

  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput | null,
    identifier?: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Notification scheduled (web fallback):', title, body);
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
        identifier,
      });
      
      console.log('Notification scheduled:', notificationId, title);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Notification cancelled:', identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Schedule low stock notifications
  async scheduleLowStockNotifications(supplies: Supply[]): Promise<void> {
    if (!this.settings.lowStockEnabled) return;

    const lowStockSupplies = supplies.filter(supply => 
      supply.quantity <= (supply.warningThreshold || this.settings.lowStockThreshold)
    );

    for (const supply of lowStockSupplies) {
      const identifier = `low-stock-${supply.id}`;
      await this.scheduleNotification(
        'Low Stock Alert',
        `${supply.name} is running low (${supply.quantity} remaining)`,
        null, // Immediate notification
        identifier
      );
    }
  }

  // Schedule expiration notifications
  async scheduleExpirationNotifications(supplies: Supply[]): Promise<void> {
    if (!this.settings.expirationEnabled) return;

    const now = new Date();

    for (const supply of supplies) {
      if (!supply.expirationDate) continue;

      const expirationDate = new Date(supply.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      if (daysUntilExpiration <= this.settings.expirationDays && daysUntilExpiration > 0) {
        const identifier = `expiration-${supply.id}`;
        const triggerDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        
        await this.scheduleNotification(
          'Expiration Warning',
          `${supply.name} expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`,
          { seconds: Math.max(1, Math.floor((triggerDate.getTime() - now.getTime()) / 1000)) } as Notifications.TimeIntervalTriggerInput,
          identifier
        );
      }
    }
  }

  // Schedule device timer notifications
  async scheduleDeviceTimerNotifications(inUseItems: InUseItem[]): Promise<void> {
    if (!this.settings.deviceTimerEnabled) return;

    const now = new Date();

    for (const item of inUseItems) {
      if (item.details.type !== 'device' || !item.expiresAt || item.details.endedEarly) continue;

      const expirationDate = new Date(item.expiresAt);
      const hoursUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (60 * 60 * 1000));

      // Schedule reminder notification
      if (hoursUntilExpiration <= this.settings.deviceReminderHours && hoursUntilExpiration > 0) {
        const identifier = `device-reminder-${item.id}`;
        const triggerDate = new Date(expirationDate.getTime() - this.settings.deviceReminderHours * 60 * 60 * 1000);
        
        if (triggerDate > now) {
          await this.scheduleNotification(
            'Device Reminder',
            `${item.supplyName} will expire in ${hoursUntilExpiration} hours`,
            { seconds: Math.max(1, Math.floor((triggerDate.getTime() - now.getTime()) / 1000)) } as Notifications.TimeIntervalTriggerInput,
            identifier
          );
        }
      }

      // Schedule expiration notification
      if (expirationDate > now) {
        const identifier = `device-expiry-${item.id}`;
        await this.scheduleNotification(
          'Device Expired',
          `${item.supplyName} has expired and should be replaced`,
          { seconds: Math.max(1, Math.floor((expirationDate.getTime() - now.getTime()) / 1000)) } as Notifications.TimeIntervalTriggerInput,
          identifier
        );
      }

      // Schedule grace period end notification
      if (item.gracePeriodEndsAt) {
        const gracePeriodEndDate = new Date(item.gracePeriodEndsAt);
        if (gracePeriodEndDate > now) {
          const identifier = `grace-period-end-${item.id}`;
          await this.scheduleNotification(
            'Grace Period Ending',
            `${item.supplyName} grace period is ending - replace immediately`,
            { seconds: Math.max(1, Math.floor((gracePeriodEndDate.getTime() - now.getTime()) / 1000)) } as Notifications.TimeIntervalTriggerInput,
            identifier
          );
        }
      }
    }
  }

  // Update all notifications based on current data
  async updateAllNotifications(supplies: Supply[], inUseItems: InUseItem[]): Promise<void> {
    console.log('Updating all notifications...');
    
    // Cancel existing notifications
    await this.cancelAllNotifications();
    
    // Schedule new notifications
    await Promise.all([
      this.scheduleLowStockNotifications(supplies),
      this.scheduleExpirationNotifications(supplies),
      this.scheduleDeviceTimerNotifications(inUseItems)
    ]);
    
    console.log('All notifications updated');
  }

  // Cancel notifications for a specific supply
  async cancelSupplyNotifications(supplyId: string): Promise<void> {
    await Promise.all([
      this.cancelNotification(`low-stock-${supplyId}`),
      this.cancelNotification(`expiration-${supplyId}`)
    ]);
  }

  // Cancel notifications for a specific in-use item
  async cancelInUseItemNotifications(itemId: string): Promise<void> {
    await Promise.all([
      this.cancelNotification(`device-reminder-${itemId}`),
      this.cancelNotification(`device-expiry-${itemId}`),
      this.cancelNotification(`grace-period-end-${itemId}`)
    ]);
  }
}

export const notificationService = NotificationService.getInstance();