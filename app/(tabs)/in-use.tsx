import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSupplies } from '@/hooks/supplies-store';
import { CATEGORY_COLORS } from '@/types/supplies';
import { useTheme } from '@/hooks/theme-store';
import { Clock, Droplet, AlertTriangle, X, Minus, CheckCircle } from 'lucide-react-native';

export default function InUseScreen() {
  const { getActiveInUseItems, updateInsulinVolume, endDeviceEarly, removeInUseItem } = useSupplies();
  const { colors, isDarkMode } = useTheme();
  const [activeItems, setActiveItems] = useState(getActiveInUseItems());
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [volumeToRemove, setVolumeToRemove] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItems(getActiveInUseItems());
    }, 1000);
    return () => clearInterval(interval);
  }, [getActiveInUseItems]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  };

  const handleEndEarly = (itemId: string, itemName: string) => {
    Alert.alert(
      'End Device Early',
      `Are you sure you want to end ${itemName} early?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Now',
          style: 'destructive',
          onPress: () => endDeviceEarly(itemId)
        }
      ]
    );
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${itemName} from active items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeInUseItem(itemId)
        }
      ]
    );
  };

  const handleUseInsulin = () => {
    if (!selectedItemId || !volumeToRemove) return;
    
    const volume = parseFloat(volumeToRemove);
    if (isNaN(volume) || volume <= 0) return;
    
    updateInsulinVolume(selectedItemId, volume);
    setVolumeToRemove('');
    setShowVolumeModal(false);
    setSelectedItemId(null);
  };

  const openVolumeModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowVolumeModal(true);
  };

  if (activeItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <CheckCircle size={64} color={isDarkMode ? '#4A4A4A' : '#E0E0E0'} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Items In Use</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Start using supplies from the Supplies tab to track them here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Active Items</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Currently in use supplies</Text>
        </View>

        {activeItems.map((item) => {
          const isInsulin = item.details.type === 'insulin';
          const isDevice = item.details.type === 'device';
          const categoryColor = CATEGORY_COLORS[item.category];

          return (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.supplyName}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id, item.supplyName)}
                    style={styles.removeButton}
                  >
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.startedText, { color: colors.textSecondary }]}>
                  Started: {new Date(item.startedAt).toLocaleString()}
                </Text>

                {isInsulin && (
                  <View style={styles.insulinContainer}>
                    <View style={styles.volumeRow}>
                      <Droplet size={20} color={categoryColor} />
                      <Text style={[styles.volumeText, { color: colors.text }]}>
                        {item.details.type === 'insulin' ? `${item.details.remainingVolume} / ${item.details.totalVolume} units` : ''}
                      </Text>
                    </View>
                    
                    <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#3A3A3A' : '#E0E0E0' }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: item.details.type === 'insulin' ? `${(item.details.remainingVolume / item.details.totalVolume) * 100}%` : '0%',
                            backgroundColor: categoryColor
                          }
                        ]}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.useButton}
                      onPress={() => openVolumeModal(item.id)}
                    >
                      <Minus size={16} color="#fff" />
                      <Text style={styles.useButtonText}>Record Usage</Text>
                    </TouchableOpacity>

                    {item.details.type === 'insulin' && item.details.remainingVolume === 0 && (
                      <View style={[styles.emptyWarning, { backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.15)' : '#FFF2F0' }]}>
                        <AlertTriangle size={16} color="#FF6B6B" />
                        <Text style={styles.emptyWarningText}>Vial is empty</Text>
                      </View>
                    )}
                  </View>
                )}

                {isDevice && (
                  <View style={styles.deviceContainer}>
                    <View style={styles.timerRow}>
                      <Clock size={20} color={categoryColor} />
                      {item.timeRemaining !== null && item.timeRemaining > 0 ? (
                        <Text style={[styles.timerText, { color: colors.text }]}>
                          {formatTime(item.timeRemaining)} remaining
                        </Text>
                      ) : item.isInGracePeriod && item.gracePeriodRemaining ? (
                        <Text style={styles.gracePeriodText}>
                          Grace period: {formatTime(item.gracePeriodRemaining)}
                        </Text>
                      ) : (
                        <Text style={styles.expiredText}>Expired</Text>
                      )}
                    </View>

                    {item.expiresAt && (
                      <Text style={[styles.expiresText, { color: colors.textSecondary }]}>
                        Expires: {new Date(item.expiresAt).toLocaleString()}
                      </Text>
                    )}

                    {item.gracePeriodEndsAt && item.isInGracePeriod && (
                      <Text style={styles.gracePeriodEndText}>
                        Grace ends: {new Date(item.gracePeriodEndsAt).toLocaleString()}
                      </Text>
                    )}

                    {item.details.type === 'device' && !item.details.endedEarly && item.timeRemaining !== null && item.timeRemaining > 0 && (
                      <TouchableOpacity
                        style={[styles.endEarlyButton, { backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.15)' : '#FFF2F0' }]}
                        onPress={() => handleEndEarly(item.id, item.supplyName)}
                      >
                        <Text style={styles.endEarlyButtonText}>End Early</Text>
                      </TouchableOpacity>
                    )}

                    {item.details.type === 'device' && (item.isExpired || item.details.endedEarly) && !item.isInGracePeriod && (
                      <View style={[styles.expiredWarning, { backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.15)' : '#FFF2F0' }]}>
                        <AlertTriangle size={16} color="#FF6B6B" />
                        <Text style={styles.expiredWarningText}>
                          {item.details.type === 'device' && item.details.endedEarly ? 'Ended early' : 'Device expired - Replace soon'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={showVolumeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVolumeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Record Insulin Usage</Text>
              <TouchableOpacity onPress={() => setShowVolumeModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Units Used</Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.border, 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F8F8',
                  color: colors.text
                }]}
                value={volumeToRemove}
                onChangeText={setVolumeToRemove}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={[styles.modalHelperText, { color: colors.textSecondary }]}>
                Enter the number of insulin units used from the vial
              </Text>
              {selectedItemId && (() => {
                const item = activeItems.find(i => i.id === selectedItemId);
                if (item?.details.type === 'insulin') {
                  return (
                    <Text style={styles.modalRemainingText}>
                      Remaining: {item.details.remainingVolume} units
                    </Text>
                  );
                }
                return null;
              })()}
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setShowVolumeModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleUseInsulin}
              >
                <Text style={styles.modalConfirmText}>Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryBar: {
    height: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  startedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  insulinContainer: {
    gap: 12,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF2F0',
    padding: 12,
    borderRadius: 8,
  },
  emptyWarningText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  deviceContainer: {
    gap: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  gracePeriodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFA940',
  },
  expiredText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4D4F',
  },
  expiresText: {
    fontSize: 12,
    color: '#666',
  },
  gracePeriodEndText: {
    fontSize: 12,
    color: '#FFA940',
  },
  endEarlyButton: {
    backgroundColor: '#FFF2F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  endEarlyButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  expiredWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF2F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  expiredWarningText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  modalHelperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalRemainingText: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 8,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});