import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Bell, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';
import { useSupplies } from '@/hooks/supplies-store';
import { NotificationSettings, notificationService } from '@/hooks/notifications';

export default function NotificationSettingsCard() {
  const { isDarkMode } = useTheme();
  const { updateNotifications } = useSupplies();
  const [settings, setSettings] = useState<NotificationSettings>({
    lowStockEnabled: true,
    expirationEnabled: true,
    deviceTimerEnabled: true,
    lowStockThreshold: 3,
    expirationDays: 7,
    deviceReminderHours: 24
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await notificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await notificationService.updateSettings({ [key]: value });
      await updateNotifications();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const testNotification = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Test Notification', 'Notifications are not supported on web, but they will work on mobile devices.');
    } else {
      Alert.alert('Test Notification', 'Check your notification panel - a test notification should appear shortly.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerText: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
      marginLeft: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    lastSettingRow: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 16,
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      marginTop: 2,
    },
    numberInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    numberInput: {
      backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minWidth: 60,
      textAlign: 'center' as const,
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
      fontSize: 16,
      marginLeft: 8,
    },
    testButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    testButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#374151' : '#FEF3C7',
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
    },
    warningText: {
      color: isDarkMode ? '#FBBF24' : '#92400E',
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
        <Text style={styles.headerText}>Notification Settings</Text>
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={20} color={isDarkMode ? '#FBBF24' : '#92400E'} />
          <Text style={styles.warningText}>
            Notifications are not supported on web. Settings will apply when using the mobile app.
          </Text>
        </View>
      )}

      <View style={[styles.settingRow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Low Stock Alerts</Text>
          <Text style={styles.settingDescription}>
            Get notified when supplies are running low
          </Text>
        </View>
        <Switch
          value={settings.lowStockEnabled}
          onValueChange={(value) => handleSettingChange('lowStockEnabled', value)}
          trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: '#4A90E2' }}
          thumbColor={settings.lowStockEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {settings.lowStockEnabled && (
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Low Stock Threshold</Text>
            <Text style={styles.settingDescription}>
              Alert when quantity reaches this number
            </Text>
          </View>
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={settings.lowStockThreshold.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                handleSettingChange('lowStockThreshold', Math.max(1, num));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>
      )}

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Expiration Warnings</Text>
          <Text style={styles.settingDescription}>
            Get notified about upcoming expirations
          </Text>
        </View>
        <Switch
          value={settings.expirationEnabled}
          onValueChange={(value) => handleSettingChange('expirationEnabled', value)}
          trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: '#4A90E2' }}
          thumbColor={settings.expirationEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {settings.expirationEnabled && (
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Expiration Warning Days</Text>
            <Text style={styles.settingDescription}>
              Alert this many days before expiration
            </Text>
          </View>
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={settings.expirationDays.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                handleSettingChange('expirationDays', Math.max(1, Math.min(30, num)));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>
      )}

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Device Timer Alerts</Text>
          <Text style={styles.settingDescription}>
            Get notified about device expiration times
          </Text>
        </View>
        <Switch
          value={settings.deviceTimerEnabled}
          onValueChange={(value) => handleSettingChange('deviceTimerEnabled', value)}
          trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: '#4A90E2' }}
          thumbColor={settings.deviceTimerEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {settings.deviceTimerEnabled && (
        <View style={[styles.settingRow, styles.lastSettingRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Device Reminder Hours</Text>
            <Text style={styles.settingDescription}>
              Alert this many hours before device expires
            </Text>
          </View>
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={settings.deviceReminderHours.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                handleSettingChange('deviceReminderHours', Math.max(1, Math.min(168, num)));
              }}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.testButton} onPress={testNotification}>
        <Text style={styles.testButtonText}>Test Notifications</Text>
      </TouchableOpacity>
    </View>
  );
}