import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Package, Timer, Bell } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/hooks/theme-store';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { colors } = useTheme();

  const handleRequestNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Permissions granted, continue with onboarding completion
        onClose();
      } else {
        // Even if denied, we can still close onboarding
        onClose();
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to Dia-Hub
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your personal diabetes supply management companion
            </Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Package size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Supply Tracking
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    Keep track of your diabetes supplies including insulin, test strips, and more. Get alerts when supplies are running low.
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Timer size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Usage Timers
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    Set timers for supplies in use, like insulin pens or CGM sensors. Never forget when to replace them.
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Bell size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Smart Notifications
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    Get notified about low supplies, expiring items, and timer reminders to stay on top of your diabetes management.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.notificationSection, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Enable Notifications
              </Text>
              <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
                To get the most out of Dia-Hub, we'd like to send you helpful notifications about your supplies and timers. You can always change this later in Settings.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleRequestNotifications}
            >
              <Text style={styles.primaryButtonText}>Enable Notifications & Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Skip for Now
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#8E8E93',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#007AFF20',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  notificationSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#8E8E93',
  },
});