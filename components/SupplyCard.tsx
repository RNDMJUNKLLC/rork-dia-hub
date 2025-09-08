import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Package, AlertCircle, Play, Trash2 } from 'lucide-react-native';
import { Supply, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/supplies';
import { useSupplies } from '@/hooks/supplies-store';
import { useTheme } from '@/hooks/theme-store';
import StartUsingModal from './StartUsingModal';

interface SupplyCardProps {
  supply: Supply;
  onEdit: () => void;
}

export function SupplyCard({ supply, onEdit }: SupplyCardProps) {
  const { deleteSupply, updateSupply } = useSupplies();
  const { colors } = useTheme();
  const [showStartUsingModal, setShowStartUsingModal] = useState(false);
  
  const isLowStock = supply.quantity <= (supply.warningThreshold || 5);
  const canStartUsing = supply.category === 'insulin' || supply.category === 'cgm' || 
                        supply.category === 'pump' || supply.category === 'infusion-sets';
  const categoryColor = CATEGORY_COLORS[supply.category];

  const handleDelete = () => {
    Alert.alert(
      'Delete Supply',
      `Are you sure you want to delete ${supply.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSupply(supply.id)
        }
      ]
    );
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, supply.quantity + delta);
    updateSupply(supply.id, { quantity: newQuantity });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onEdit} activeOpacity={0.7}>
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Package size={20} color={categoryColor} />
            <Text style={styles.name}>{supply.name}</Text>
          </View>
          
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={18} color="#FF4D4F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.category}>{CATEGORY_LABELS[supply.category]}</Text>

        <View style={styles.quantityRow}>
          <View style={styles.quantityInfo}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <Text style={[styles.quantity, isLowStock && styles.lowStock]}>
              {supply.quantity}
            </Text>
            {isLowStock && <AlertCircle size={16} color="#FFA940" />}
          </View>

          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {supply.notes && (
          <Text style={styles.notes} numberOfLines={2}>{supply.notes}</Text>
        )}

        {canStartUsing && supply.quantity > 0 && (
          <TouchableOpacity 
            style={styles.startUsingButton}
            onPress={() => setShowStartUsingModal(true)}
          >
            <Play size={16} color="#fff" />
            <Text style={styles.startUsingButtonText}>
              Start Using
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <StartUsingModal
        visible={showStartUsingModal}
        onClose={() => setShowStartUsingModal(false)}
        supply={supply}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginLeft: 28,
  },

  deleteButton: {
    padding: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
  },
  quantity: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lowStock: {
    color: '#FFA940',
  },
  quantityControls: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: '600',
  },

  notes: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  startUsingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#52C41A',
  },
  startUsingButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});