import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEvent, HistoryEventType } from '@/types/history';

const HISTORY_STORAGE_KEY = 'diabetes-history';
const MAX_HISTORY_ENTRIES = 1000; // Limit to prevent storage bloat

export class HistoryService {
  private static instance: HistoryService;
  private history: HistoryEvent[] = [];
  private isInitialized = false;

  static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
        
        // Clean up old entries if we have too many
        if (this.history.length > MAX_HISTORY_ENTRIES) {
          this.history = this.history.slice(-MAX_HISTORY_ENTRIES);
          await this.saveHistory();
        }
      }
      
      this.isInitialized = true;
      console.log('History service initialized with', this.history.length, 'entries');
    } catch (error) {
      console.error('Failed to initialize history service:', error);
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async addEvent(
    type: HistoryEventType,
    title: string,
    description: string,
    metadata?: HistoryEvent['metadata']
  ): Promise<void> {
    const event: HistoryEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      description,
      metadata
    };

    this.history.unshift(event); // Add to beginning for newest first

    // Limit history size
    if (this.history.length > MAX_HISTORY_ENTRIES) {
      this.history = this.history.slice(0, MAX_HISTORY_ENTRIES);
    }

    await this.saveHistory();
    console.log('History event added:', type, title);
  }

  getHistory(): HistoryEvent[] {
    return [...this.history]; // Return copy to prevent mutations
  }

  getHistoryByType(type: HistoryEventType): HistoryEvent[] {
    return this.history.filter(event => event.type === type);
  }

  getHistoryBySupply(supplyId: string): HistoryEvent[] {
    return this.history.filter(event => event.metadata?.supplyId === supplyId);
  }

  getHistoryByDateRange(startDate: Date, endDate: Date): HistoryEvent[] {
    return this.history.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  getTodaysHistory(): HistoryEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    return this.getHistoryByDateRange(today, tomorrow);
  }

  getRecentHistory(days: number = 7): HistoryEvent[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return this.getHistoryByDateRange(startDate, new Date());
  }

  async clearHistory(): Promise<void> {
    this.history = [];
    await this.saveHistory();
    console.log('History cleared');
  }

  async clearOldHistory(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const initialCount = this.history.length;
    this.history = this.history.filter(event => new Date(event.timestamp) >= cutoffDate);
    
    if (this.history.length !== initialCount) {
      await this.saveHistory();
      console.log(`Cleaned up ${initialCount - this.history.length} old history entries`);
    }
  }

  // Convenience methods for common events
  async logSupplyAdded(supplyName: string, category: string, quantity: number, supplyId: string): Promise<void> {
    await this.addEvent(
      'supply_added',
      'Supply Added',
      `Added ${quantity} ${supplyName} to inventory`,
      { supplyId, supplyName, supplyCategory: category, newValue: quantity }
    );
  }

  async logSupplyUpdated(supplyName: string, changes: string, supplyId: string): Promise<void> {
    await this.addEvent(
      'supply_updated',
      'Supply Updated',
      `Updated ${supplyName}: ${changes}`,
      { supplyId, supplyName }
    );
  }

  async logQuantityChanged(supplyName: string, oldQuantity: number, newQuantity: number, supplyId: string): Promise<void> {
    const change = newQuantity - oldQuantity;
    const action = change > 0 ? 'added' : 'used';
    const changeText = change > 0 ? `+${change}` : `${change}`;
    
    await this.addEvent(
      'supply_quantity_changed',
      'Quantity Changed',
      `${supplyName}: ${changeText} (${oldQuantity} → ${newQuantity})`,
      { 
        supplyId, 
        supplyName, 
        oldValue: oldQuantity, 
        newValue: newQuantity,
        quantityChange: change
      }
    );
  }

  async logItemStartedUsing(supplyName: string, category: string, itemId: string, supplyId: string): Promise<void> {
    await this.addEvent(
      'item_started_using',
      'Started Using Item',
      `Started using ${supplyName}`,
      { itemId, supplyId, supplyName, supplyCategory: category }
    );
  }

  async logInsulinVolumeUpdated(supplyName: string, volumeUsed: number, remaining: number, itemId: string): Promise<void> {
    await this.addEvent(
      'insulin_volume_updated',
      'Insulin Used',
      `Used ${volumeUsed}ml of ${supplyName} (${remaining}ml remaining)`,
      { itemId, supplyName, volumeUsed, newValue: remaining }
    );
  }

  async logDeviceEndedEarly(supplyName: string, reason: string, itemId: string): Promise<void> {
    await this.addEvent(
      'device_ended_early',
      'Device Ended Early',
      `${supplyName} ended early: ${reason}`,
      { itemId, supplyName }
    );
  }

  async logNotificationSent(type: string, message: string): Promise<void> {
    await this.addEvent(
      'notification_sent',
      'Notification Sent',
      `${type}: ${message}`,
      { notificationType: type }
    );
  }

  async logDataCleared(): Promise<void> {
    await this.addEvent(
      'data_cleared',
      'Data Cleared',
      'All app data was cleared',
      {}
    );
  }
}

export const historyService = HistoryService.getInstance();
