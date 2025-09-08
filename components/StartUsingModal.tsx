import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { X } from 'lucide-react-native';
import { Supply, InsulinDetails, DeviceDetails } from '@/types/supplies';
import { useSupplies } from '@/hooks/supplies-store';

interface StartUsingModalProps {
  visible: boolean;
  onClose: () => void;
  supply: Supply | null;
}

export default function StartUsingModal({ visible, onClose, supply }: StartUsingModalProps) {
  const { startUsingItem } = useSupplies();
  
  // Insulin-specific state
  const [insulinVolume, setInsulinVolume] = useState('1000');
  const [insulinUnit, setInsulinUnit] = useState<'ml' | 'units'>('units');
  
  // Device-specific state
  const [durationDays, setDurationDays] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [hasGracePeriod, setHasGracePeriod] = useState(false);
  const [gracePeriodHours, setGracePeriodHours] = useState('12');

  const resetForm = () => {
    setInsulinVolume('1000');
    setInsulinUnit('units');
    setDurationDays('');
    setDurationHours('');
    setHasGracePeriod(false);
    setGracePeriodHours('12');
  };

  const handleStartUsing = () => {
    if (!supply) return;

    let details: InsulinDetails | DeviceDetails;
    let gracePeriod: number | undefined;

    if (supply.category === 'insulin') {
      const volume = parseFloat(insulinVolume);
      if (isNaN(volume) || volume <= 0) return;

      // Convert to units if entered in mL (100 units per mL)
      const volumeInUnits = insulinUnit === 'ml' ? volume * 100 : volume;

      details = {
        type: 'insulin',
        totalVolume: volumeInUnits,
        remainingVolume: volumeInUnits,
        unit: 'units' // Always store in units
      };
    } else if (supply.category === 'cgm' || supply.category === 'pump' || supply.category === 'infusion-sets') {
      const days = parseFloat(durationDays) || 0;
      const hours = parseFloat(durationHours) || 0;
      const totalHours = (days * 24) + hours;
      
      if (totalHours <= 0) return;

      details = {
        type: 'device',
        durationHours: totalHours,
        endedEarly: false
      };

      if (hasGracePeriod) {
        gracePeriod = parseFloat(gracePeriodHours) || 0;
      }
    } else {
      return;
    }

    startUsingItem(supply.id, details, gracePeriod);
    resetForm();
    onClose();
  };

  const getDefaultDuration = () => {
    if (!supply) return { days: '', hours: '' };
    
    switch (supply.category) {
      case 'cgm':
        return { days: '10', hours: '0' };
      case 'infusion-sets':
        return { days: '3', hours: '0' };
      case 'pump':
        return { days: '30', hours: '0' };
      default:
        return { days: '', hours: '' };
    }
  };

  React.useEffect(() => {
    if (supply && (supply.category === 'cgm' || supply.category === 'pump' || supply.category === 'infusion-sets')) {
      const defaults = getDefaultDuration();
      setDurationDays(defaults.days);
      setDurationHours(defaults.hours);
    }
  }, [supply]);

  if (!supply) return null;

  const isInsulin = supply.category === 'insulin';
  const isDevice = supply.category === 'cgm' || supply.category === 'pump' || supply.category === 'infusion-sets';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Using {supply.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {isInsulin && (
              <>
                <Text style={styles.label}>Vial Volume</Text>
                <View style={styles.volumeRow}>
                  <TextInput
                    style={[styles.input, styles.volumeInput]}
                    value={insulinVolume}
                    onChangeText={setInsulinVolume}
                    placeholder={insulinUnit === 'ml' ? '10' : '1000'}
                    keyboardType="decimal-pad"
                  />
                  <View style={styles.unitButtons}>
                    <TouchableOpacity
                      style={[styles.unitButton, insulinUnit === 'ml' && styles.unitButtonActive]}
                      onPress={() => setInsulinUnit('ml')}
                    >
                      <Text style={[styles.unitButtonText, insulinUnit === 'ml' && styles.unitButtonTextActive]}>
                        mL
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitButton, insulinUnit === 'units' && styles.unitButtonActive]}
                      onPress={() => setInsulinUnit('units')}
                    >
                      <Text style={[styles.unitButtonText, insulinUnit === 'units' && styles.unitButtonTextActive]}>
                        Units
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.helperText}>
                  {insulinUnit === 'ml' 
                    ? 'Standard vials are 10mL (1000 units at 100 units/mL)' 
                    : 'Track insulin usage in units (standard: 100 units per mL)'}
                </Text>
              </>
            )}

            {isDevice && (
              <>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                  <View style={styles.durationInput}>
                    <TextInput
                      style={styles.input}
                      value={durationDays}
                      onChangeText={setDurationDays}
                      placeholder="0"
                      keyboardType="number-pad"
                    />
                    <Text style={styles.durationLabel}>Days</Text>
                  </View>
                  <View style={styles.durationInput}>
                    <TextInput
                      style={styles.input}
                      value={durationHours}
                      onChangeText={setDurationHours}
                      placeholder="0"
                      keyboardType="number-pad"
                    />
                    <Text style={styles.durationLabel}>Hours</Text>
                  </View>
                </View>

                <View style={styles.gracePeriodRow}>
                  <Text style={styles.label}>Grace Period After Expiry</Text>
                  <Switch
                    value={hasGracePeriod}
                    onValueChange={setHasGracePeriod}
                    trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                    thumbColor={hasGracePeriod ? '#4CAF50' : '#f4f3f4'}
                  />
                </View>

                {hasGracePeriod && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={gracePeriodHours}
                      onChangeText={setGracePeriodHours}
                      placeholder="12"
                      keyboardType="number-pad"
                    />
                    <Text style={styles.helperText}>
                      Additional hours after the device expires before final removal
                    </Text>
                  </>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startButton} onPress={handleStartUsing}>
              <Text style={styles.startButtonText}>Start Using</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  volumeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  volumeInput: {
    flex: 1,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  unitButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  unitButtonTextActive: {
    color: 'white',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  durationInput: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  gracePeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  startButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});