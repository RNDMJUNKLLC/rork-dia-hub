import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Supply, Timer, InUseItem, SupplyCategory } from '@/types/supplies';
import { notificationService } from './notifications';
import { historyService } from './history-store';

const SUPPLIES_STORAGE_KEY = 'diabetes-supplies';
const TIMERS_STORAGE_KEY = 'diabetes-timers';
const IN_USE_STORAGE_KEY = 'diabetes-in-use';

export const [SuppliesProvider, useSupplies] = createContextHook(() => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [inUseItems, setInUseItems] = useState<InUseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage and initialize notifications
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();
        
        // Initialize history service
        await historyService.initialize();
        
        const [suppliesData, timersData, inUseData] = await Promise.all([
          AsyncStorage.getItem(SUPPLIES_STORAGE_KEY),
          AsyncStorage.getItem(TIMERS_STORAGE_KEY),
          AsyncStorage.getItem(IN_USE_STORAGE_KEY)
        ]);
        
        const loadedSupplies = suppliesData ? JSON.parse(suppliesData) : [];
        const loadedTimers = timersData ? JSON.parse(timersData) : [];
        const loadedInUseItems = inUseData ? JSON.parse(inUseData) : [];
        
        setSupplies(loadedSupplies);
        setTimers(loadedTimers);
        setInUseItems(loadedInUseItems);
        
        // Update notifications after loading data
        await notificationService.updateAllNotifications(loadedSupplies, loadedInUseItems);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save supplies to AsyncStorage and update notifications
  const saveSupplies = async (newSupplies: Supply[]) => {
    try {
      await AsyncStorage.setItem(SUPPLIES_STORAGE_KEY, JSON.stringify(newSupplies));
      setSupplies(newSupplies);
      // Update notifications when supplies change
      await notificationService.updateAllNotifications(newSupplies, inUseItems);
    } catch (error) {
      console.error('Error saving supplies:', error);
    }
  };

  // Save timers to AsyncStorage
  const saveTimers = async (newTimers: Timer[]) => {
    try {
      await AsyncStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(newTimers));
      setTimers(newTimers);
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  };

  // Save in-use items to AsyncStorage and update notifications
  const saveInUseItems = async (newInUseItems: InUseItem[]) => {
    try {
      await AsyncStorage.setItem(IN_USE_STORAGE_KEY, JSON.stringify(newInUseItems));
      setInUseItems(newInUseItems);
      // Update notifications when in-use items change
      await notificationService.updateAllNotifications(supplies, newInUseItems);
    } catch (error) {
      console.error('Error saving in-use items:', error);
    }
  };

  // Supply management functions
  const addSupply = async (supply: Omit<Supply, 'id'>) => {
    const newSupply: Supply = {
      ...supply,
      id: Date.now().toString()
    };
    
    // Log the addition
    await historyService.logSupplyAdded(
      newSupply.name,
      newSupply.category,
      newSupply.quantity,
      newSupply.id
    );
    
    saveSupplies([...supplies, newSupply]);
  };

  const updateSupply = async (id: string, updates: Partial<Supply>) => {
    const oldSupply = supplies.find(s => s.id === id);
    const updatedSupplies = supplies.map(supply =>
      supply.id === id ? { ...supply, ...updates } : supply
    );
    
    if (oldSupply) {
      // Log quantity changes specifically
      if (updates.quantity !== undefined && updates.quantity !== oldSupply.quantity) {
        await historyService.logQuantityChanged(
          oldSupply.name,
          oldSupply.quantity,
          updates.quantity,
          id
        );
      }
      
      // Log other updates
      const changes: string[] = [];
      if (updates.name && updates.name !== oldSupply.name) changes.push(`name: ${updates.name}`);
      if (updates.expirationDate && updates.expirationDate !== oldSupply.expirationDate) changes.push('expiration date');
      if (updates.notes && updates.notes !== oldSupply.notes) changes.push('notes');
      if (updates.warningThreshold && updates.warningThreshold !== oldSupply.warningThreshold) changes.push('warning threshold');
      
      if (changes.length > 0 && updates.quantity === undefined) {
        await historyService.logSupplyUpdated(oldSupply.name, changes.join(', '), id);
      }
      
      // If quantity increased, clear low stock notification tracking for this supply
      if (updates.quantity && updates.quantity > oldSupply.quantity) {
        await notificationService.clearSupplyNotificationTracking(id);
      }
    }
    
    saveSupplies(updatedSupplies);
  };

  const deleteSupply = async (id: string) => {
    const supply = supplies.find(s => s.id === id);
    
    // Log the deletion
    if (supply) {
      await historyService.addEvent(
        'supply_deleted',
        'Supply Deleted',
        `Deleted ${supply.name} from inventory`,
        { supplyId: id, supplyName: supply.name, supplyCategory: supply.category }
      );
    }
    
    // Cancel notifications for this supply before deleting
    await notificationService.cancelSupplyNotifications(id);
    saveSupplies(supplies.filter(supply => supply.id !== id));
  };

  // Start using an item (moves to in-use and decrements quantity)
  const startUsingItem = async (supplyId: string, details: InUseItem['details'], gracePeriodHours?: number) => {
    const supply = supplies.find(s => s.id === supplyId);
    if (!supply || supply.quantity <= 0) return null;

    // Decrement supply quantity
    const updatedSupplies = supplies.map(s =>
      s.id === supplyId ? { ...s, quantity: s.quantity - 1 } : s
    );
    saveSupplies(updatedSupplies);

    // Create in-use item
    const now = new Date();
    let expiresAt: string | undefined;
    let gracePeriodEndsAt: string | undefined;

    if (details.type === 'device') {
      const expiryDate = new Date(now.getTime() + details.durationHours * 60 * 60 * 1000);
      expiresAt = expiryDate.toISOString();
      
      if (gracePeriodHours) {
        const graceEndDate = new Date(expiryDate.getTime() + gracePeriodHours * 60 * 60 * 1000);
        gracePeriodEndsAt = graceEndDate.toISOString();
      }
    }

    const newInUseItem: InUseItem = {
      id: Date.now().toString(),
      supplyId: supply.id,
      supplyName: supply.name,
      category: supply.category,
      startedAt: now.toISOString(),
      expiresAt,
      gracePeriodHours,
      gracePeriodEndsAt,
      details
    };

    // Log the start of using item
    await historyService.logItemStartedUsing(
      supply.name,
      supply.category,
      newInUseItem.id,
      supply.id
    );

    saveInUseItems([...inUseItems, newInUseItem]);
    return newInUseItem;
  };

  // Update insulin volume
  const updateInsulinVolume = async (inUseId: string, volumeUsed: number) => {
    const item = inUseItems.find(i => i.id === inUseId);
    const updatedItems = inUseItems.map(item => {
      if (item.id === inUseId && item.details.type === 'insulin') {
        const newRemaining = Math.max(0, item.details.remainingVolume - volumeUsed);
        return {
          ...item,
          details: {
            ...item.details,
            remainingVolume: newRemaining
          }
        };
      }
      return item;
    });
    
    // Log insulin usage
    if (item && item.details.type === 'insulin') {
      const newRemaining = Math.max(0, item.details.remainingVolume - volumeUsed);
      await historyService.logInsulinVolumeUpdated(
        item.supplyName,
        volumeUsed,
        newRemaining,
        inUseId
      );
    }
    
    saveInUseItems(updatedItems);
  };

  // End device early
  const endDeviceEarly = async (inUseId: string) => {
    const item = inUseItems.find(i => i.id === inUseId);
    const updatedItems = inUseItems.map(item => {
      if (item.id === inUseId && item.details.type === 'device') {
        return {
          ...item,
          details: {
            ...item.details,
            endedEarly: true
          },
          expiresAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    // Log early ending
    if (item) {
      await historyService.logDeviceEndedEarly(
        item.supplyName,
        'Ended manually by user',
        inUseId
      );
    }
    
    saveInUseItems(updatedItems);
  };

  // Remove in-use item (when empty or expired)
  const removeInUseItem = async (inUseId: string) => {
    const item = inUseItems.find(i => i.id === inUseId);
    
    // Log item removal
    if (item) {
      await historyService.addEvent(
        'item_stopped_using',
        'Stopped Using Item',
        `Finished using ${item.supplyName}`,
        { itemId: inUseId, supplyName: item.supplyName, supplyCategory: item.category }
      );
    }
    
    // Cancel notifications for this item before removing
    await notificationService.cancelInUseItemNotifications(inUseId);
    saveInUseItems(inUseItems.filter(item => item.id !== inUseId));
  };

  // Timer management functions
  const addTimer = (timer: Omit<Timer, 'id'>) => {
    const newTimer: Timer = {
      ...timer,
      id: Date.now().toString()
    };
    saveTimers([...timers, newTimer]);
  };

  const updateTimer = (id: string, updates: Partial<Timer>) => {
    const updatedTimers = timers.map(timer =>
      timer.id === id ? { ...timer, ...updates } : timer
    );
    saveTimers(updatedTimers);
  };

  const deleteTimer = (id: string) => {
    saveTimers(timers.filter(timer => timer.id !== id));
  };

  const resetTimer = (id: string) => {
    updateTimer(id, { startDate: new Date().toISOString() });
  };

  // Get supplies by category
  const getSuppliesByCategory = (category: SupplyCategory) => {
    return supplies.filter(supply => supply.category === category);
  };

  // Get low stock supplies
  const getLowStockSupplies = () => {
    return supplies.filter(supply => {
      const threshold = supply.warningThreshold || 5;
      return supply.quantity <= threshold;
    });
  };

  // Get active timers with remaining days
  const getActiveTimers = () => {
    return timers.map(timer => {
      const startDate = new Date(timer.startDate);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = timer.durationDays - daysPassed;
      
      return {
        ...timer,
        daysPassed,
        daysRemaining,
        isExpired: daysRemaining <= 0,
        isWarning: daysRemaining <= 1 && daysRemaining > 0
      };
    });
  };

  // Get active in-use items with time calculations
  const getActiveInUseItems = () => {
    const now = new Date();
    return inUseItems.map(item => {
      let timeRemaining: number | null = null;
      let isExpired = false;
      let isInGracePeriod = false;
      let gracePeriodRemaining: number | null = null;

      if (item.details.type === 'device' && item.expiresAt && !item.details.endedEarly) {
        const expiryTime = new Date(item.expiresAt).getTime();
        const nowTime = now.getTime();
        
        if (nowTime < expiryTime) {
          timeRemaining = Math.floor((expiryTime - nowTime) / 1000);
        } else {
          isExpired = true;
          
          if (item.gracePeriodEndsAt) {
            const graceEndTime = new Date(item.gracePeriodEndsAt).getTime();
            if (nowTime < graceEndTime) {
              isInGracePeriod = true;
              gracePeriodRemaining = Math.floor((graceEndTime - nowTime) / 1000);
            }
          }
        }
      }

      return {
        ...item,
        timeRemaining,
        isExpired,
        isInGracePeriod,
        gracePeriodRemaining
      };
    });
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      // Log data clearing before actually clearing
      await historyService.logDataCleared();
      
      await Promise.all([
        AsyncStorage.removeItem(SUPPLIES_STORAGE_KEY),
        AsyncStorage.removeItem(TIMERS_STORAGE_KEY),
        AsyncStorage.removeItem(IN_USE_STORAGE_KEY),
        notificationService.cancelAllNotifications(),
        notificationService.resetNotificationTracking(),
        historyService.clearHistory() // Clear history too
      ]);
      setSupplies([]);
      setTimers([]);
      setInUseItems([]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  return {
    supplies,
    timers,
    inUseItems,
    isLoading,
    addSupply,
    updateSupply,
    deleteSupply,
    startUsingItem,
    updateInsulinVolume,
    endDeviceEarly,
    removeInUseItem,
    addTimer,
    updateTimer,
    deleteTimer,
    resetTimer,
    getSuppliesByCategory,
    getLowStockSupplies,
    getActiveTimers,
    getActiveInUseItems,
    clearAllData,
    // Notification methods - notifications work automatically
    updateNotifications: () => notificationService.updateAllNotifications(supplies, inUseItems)
  };
});