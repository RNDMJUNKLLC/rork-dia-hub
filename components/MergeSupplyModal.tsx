import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Supply } from '@/types/supplies';
import { useTheme } from '@/hooks/theme-store';

interface MergeSupplyModalProps {
  visible: boolean;
  existingSupply: Supply | null;
  newQuantity: number;
  onMerge: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export function MergeSupplyModal({ 
  visible, 
  existingSupply, 
  newQuantity,
  onMerge, 
  onCreateNew, 
  onCancel 
}: MergeSupplyModalProps) {
  const { isDarkMode } = useTheme();

  if (!existingSupply) return null;

  const totalQuantity = existingSupply.quantity + newQuantity;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={[
          styles.modalContent,
          isDarkMode && styles.modalContentDark
        ]}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color="#FFA500" />
          </View>

          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            Duplicate Item Found
          </Text>

          <Text style={[styles.message, isDarkMode && styles.messageDark]}>
            {`"${existingSupply.name}" already exists in your inventory with ${existingSupply.quantity} items.`}
          </Text>

          <View style={[styles.mergeInfo, isDarkMode && styles.mergeInfoDark]}>
            <Text style={[styles.mergeLabel, isDarkMode && styles.mergeLabelDark]}>
              If you merge:
            </Text>
            <View style={styles.mergeDetails}>
              <Text style={[styles.mergeText, isDarkMode && styles.mergeTextDark]}>
                Current: {existingSupply.quantity} items
              </Text>
              <Text style={[styles.mergeText, isDarkMode && styles.mergeTextDark]}>
                Adding: {newQuantity} items
              </Text>
              <View style={styles.divider} />
              <Text style={[styles.totalText, isDarkMode && styles.totalTextDark]}>
                Total: {totalQuantity} items
              </Text>
            </View>
          </View>

          <Text style={[styles.question, isDarkMode && styles.questionDark]}>
            Would you like to merge with the existing item or create a new separate item?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.mergeButton]}
              onPress={onMerge}
            >
              <Text style={styles.mergeButtonText}>Merge Items</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.newButton, isDarkMode && styles.newButtonDark]}
              onPress={onCreateNew}
            >
              <Text style={[styles.newButtonText, isDarkMode && styles.newButtonTextDark]}>
                Create Separate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, isDarkMode && styles.cancelButtonTextDark]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDark: {
    color: '#fff',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  messageDark: {
    color: '#ccc',
  },
  mergeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  mergeInfoDark: {
    backgroundColor: '#2a2a2a',
  },
  mergeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  mergeLabelDark: {
    color: '#aaa',
  },
  mergeDetails: {
    paddingLeft: 8,
  },
  mergeText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  mergeTextDark: {
    color: '#ddd',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalTextDark: {
    color: '#fff',
  },
  question: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  questionDark: {
    color: '#aaa',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  mergeButton: {
    backgroundColor: '#4A90E2',
  },
  mergeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  newButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  newButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4A90E2',
  },
  newButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  newButtonTextDark: {
    color: '#4A90E2',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonDark: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  cancelButtonTextDark: {
    color: '#aaa',
  },
});