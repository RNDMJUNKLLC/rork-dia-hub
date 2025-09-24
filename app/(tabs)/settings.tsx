import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Trash2, Moon, Info, ExternalLink, HelpCircle } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSupplies } from '@/hooks/supplies-store';
import { useTheme } from '@/hooks/theme-store';
import { useOnboarding } from '@/hooks/onboarding';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function SettingsScreen() {
  const { clearAllData } = useSupplies();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { resetOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all supplies and usage data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const handleOpenWebsite = async () => {
    await WebBrowser.openBrowserAsync('https://dia-hub.org/#feedback');
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={[styles.settingRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={[styles.dangerButton, { backgroundColor: colors.cardBackground }]} onPress={handleClearData}>
            <Trash2 size={20} color="#FF3B30" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={[styles.infoRow, { backgroundColor: colors.cardBackground }]}>
            <Info size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>1.1.0</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.websiteButton, { backgroundColor: colors.cardBackground }]} onPress={handleOpenWebsite}>
            <ExternalLink size={20} color={colors.textSecondary} />
            <Text style={[styles.websiteButtonText, { color: colors.text }]}>Visit Official Website</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.websiteButton, { backgroundColor: colors.cardBackground }]} onPress={handleShowOnboarding}>
            <HelpCircle size={20} color={colors.textSecondary} />
            <Text style={[styles.websiteButtonText, { color: colors.text }]}>Show Welcome Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <OnboardingModal 
        visible={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold' as const,
    color: '#000',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500' as const,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  websiteButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500' as const,
  },

});