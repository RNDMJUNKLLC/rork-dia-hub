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
import { Supply, CATEGORY_LABELS } from '@/types/supplies';
import { useSupplies } from '@/hooks/supplies-store';
import { MergeSupplyModal } from './MergeSupplyModal';
import { useTheme } from '@/hooks/theme-store';

interface AddSupplyModalProps {
  visible: boolean;
  onClose: () => void;
  editSupply?: Supply;
}

export function AddSupplyModal({ visible, onClose, editSupply }: AddSupplyModalProps) {
  const { supplies, addSupply, updateSupply } = useSupplies();
  const { isDarkMode } = useTheme();
  
  const [name, setName] = useState(editSupply?.name || '');
  const [category, setCategory] = useState<Supply['category']>(editSupply?.category || 'insulin');
  const [quantity, setQuantity] = useState(editSupply?.quantity?.toString() || '0');
  const [warningThreshold, setWarningThreshold] = useState(editSupply?.warningThreshold?.toString() || '5');
  const [notes, setNotes] = useState(editSupply?.notes || '');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [duplicateSupply, setDuplicateSupply] = useState<Supply | null>(null);
  const [pendingSupplyData, setPendingSupplyData] = useState<Omit<Supply, 'id'> | null>(null);

  const checkForDuplicate = (name: string, category: Supply['category']) => {
    return supplies.find(s => 
      s.name.toLowerCase().trim() === name.toLowerCase().trim() && 
      s.category === category
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const supplyData = {
      name: name.trim(),
      category,
      quantity: parseInt(quantity) || 0,
      warningThreshold: parseInt(warningThreshold) || 5,
      notes: notes.trim(),

    };

    if (editSupply) {
      // When editing, check if name/category changed to a duplicate
      const duplicate = checkForDuplicate(name, category);
      if (duplicate && duplicate.id !== editSupply.id) {
        setDuplicateSupply(duplicate);
        setPendingSupplyData(supplyData);
        setShowMergeModal(true);
      } else {
        updateSupply(editSupply.id, supplyData);
        onClose();
        resetForm();
      }
    } else {
      // Check for duplicate when adding new
      const duplicate = checkForDuplicate(name, category);
      if (duplicate) {
        setDuplicateSupply(duplicate);
        setPendingSupplyData(supplyData);
        setShowMergeModal(true);
      } else {
        addSupply(supplyData);
        onClose();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('insulin');
    setQuantity('0');
    setWarningThreshold('5');
    setNotes('');
    setDuplicateSupply(null);
    setPendingSupplyData(null);
  };

  const handleMerge = () => {
    if (duplicateSupply && pendingSupplyData) {
      // Merge quantities and update the existing supply
      updateSupply(duplicateSupply.id, {
        ...duplicateSupply,
        quantity: duplicateSupply.quantity + pendingSupplyData.quantity,
        notes: pendingSupplyData.notes || duplicateSupply.notes,
        warningThreshold: pendingSupplyData.warningThreshold,
      });
      setShowMergeModal(false);
      onClose();
      resetForm();
    }
  };

  const handleCreateNew = () => {
    if (pendingSupplyData) {
      if (editSupply) {
        updateSupply(editSupply.id, pendingSupplyData);
      } else {
        addSupply(pendingSupplyData);
      }
      setShowMergeModal(false);
      onClose();
      resetForm();
    }
  };

  const handleCancelMerge = () => {
    setShowMergeModal(false);
    setDuplicateSupply(null);
    setPendingSupplyData(null);
  };

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
        <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>
              {editSupply ? 'Edit Supply' : 'Add New Supply'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDarkMode ? "#aaa" : "#666"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Name *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Humalog Insulin"
                placeholderTextColor={isDarkMode ? "#666" : "#999"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {(Object.keys(CATEGORY_LABELS) as Supply['category'][]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                      isDarkMode && styles.categoryButtonDark
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive
                    ]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Quantity</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? "#666" : "#999"}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Low Stock Alert</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  value={warningThreshold}
                  onChangeText={setWarningThreshold}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={isDarkMode ? "#666" : "#999"}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, isDarkMode && styles.inputDark]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes..."
                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, isDarkMode && styles.footerDark]}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, isDarkMode && styles.cancelButtonDark]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, isDarkMode && styles.cancelButtonTextDark]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {editSupply ? 'Update' : 'Add Supply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <MergeSupplyModal
        visible={showMergeModal}
        existingSupply={duplicateSupply}
        newQuantity={pendingSupplyData?.quantity || 0}
        onMerge={handleMerge}
        onCreateNew={handleCreateNew}
        onCancel={handleCancelMerge}
      />
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
    maxHeight: '90%',
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
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  titleDark: {
    color: '#fff',
  },
  labelDark: {
    color: '#aaa',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  categoryButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  footerDark: {
    borderTopColor: '#333',
  },
  cancelButtonDark: {
    backgroundColor: '#333',
  },
  cancelButtonTextDark: {
    color: '#aaa',
  },
});