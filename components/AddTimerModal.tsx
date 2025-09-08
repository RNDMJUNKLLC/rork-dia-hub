import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Timer, TIMER_DURATIONS } from '@/types/supplies';
import { useSupplies } from '@/hooks/supplies-store';

interface AddTimerModalProps {
  visible: boolean;
  onClose: () => void;
  editTimer?: Timer;
}

export function AddTimerModal({ visible, onClose, editTimer }: AddTimerModalProps) {
  const { addTimer, updateTimer } = useSupplies();
  
  const [name, setName] = useState(editTimer?.name || '');
  const [type, setType] = useState<Timer['type']>(editTimer?.type || 'cgm');
  const [durationDays, setDurationDays] = useState(
    editTimer?.durationDays?.toString() || TIMER_DURATIONS[editTimer?.type || 'cgm'].toString()
  );
  const [notes, setNotes] = useState(editTimer?.notes || '');

  const handleTypeChange = (newType: Timer['type']) => {
    setType(newType);
    if (!editTimer) {
      setDurationDays(TIMER_DURATIONS[newType].toString());
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const timerData = {
      name: name.trim(),
      type,
      durationDays: parseInt(durationDays) || 7,
      notes: notes.trim(),
      startDate: editTimer?.startDate || new Date().toISOString(),
    };

    if (editTimer) {
      updateTimer(editTimer.id, timerData);
    } else {
      addTimer(timerData);
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType('cgm');
    setDurationDays(TIMER_DURATIONS.cgm.toString());
    setNotes('');
  };

  const timerTypes = [
    { value: 'cgm' as const, label: 'CGM/Sensor', defaultDays: 10 },
    { value: 'infusion-set' as const, label: 'Infusion Set', defaultDays: 3 },
    { value: 'custom' as const, label: 'Custom', defaultDays: 7 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editTimer ? 'Edit Timer' : 'Add New Timer'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Dexcom G6"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                {timerTypes.map((timerType) => (
                  <TouchableOpacity
                    key={timerType.value}
                    style={[
                      styles.typeButton,
                      type === timerType.value && styles.typeButtonActive
                    ]}
                    onPress={() => handleTypeChange(timerType.value)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === timerType.value && styles.typeButtonTextActive
                    ]}>
                      {timerType.label}
                    </Text>
                    <Text style={[
                      styles.typeButtonSubtext,
                      type === timerType.value && styles.typeButtonSubtextActive
                    ]}>
                      {timerType.defaultDays} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (days)</Text>
              <TextInput
                style={styles.input}
                value={durationDays}
                onChangeText={setDurationDays}
                keyboardType="numeric"
                placeholder="7"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {editTimer ? 'Update' : 'Start Timer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#7B68EE',
    borderColor: '#7B68EE',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  typeButtonSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  typeButtonSubtextActive: {
    color: '#fff',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#7B68EE',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});