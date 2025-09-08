import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Plus, Package, AlertCircle } from 'lucide-react-native';
import { useSupplies } from '@/hooks/supplies-store';
import { useTheme } from '@/hooks/theme-store';
import { SupplyCard } from '@/components/SupplyCard';
import { AddSupplyModal } from '@/components/AddSupplyModal';
import { Supply, CATEGORY_LABELS } from '@/types/supplies';

export default function SuppliesScreen() {
  const { supplies, getLowStockSupplies, isLoading } = useSupplies();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Supply['category']>('all');
  const [refreshing, setRefreshing] = useState(false);

  const lowStockSupplies = getLowStockSupplies();
  
  const filteredSupplies = useMemo(() => {
    if (selectedCategory === 'all') return supplies;
    return supplies.filter(s => s.category === selectedCategory);
  }, [supplies, selectedCategory]);

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingSupply(undefined);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const categories: ('all' | Supply['category'])[] = [
    'all',
    ...Object.keys(CATEGORY_LABELS) as Supply['category'][]
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading supplies...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {lowStockSupplies.length > 0 && (
          <View style={[styles.alertBanner, { backgroundColor: colors.warning + '20' }]}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={[styles.alertText, { color: colors.warning }]}>
              {lowStockSupplies.length} item{lowStockSupplies.length !== 1 ? 's' : ''} running low
            </Text>
          </View>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                selectedCategory === cat && [styles.categoryChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: colors.textSecondary },
                selectedCategory === cat && [styles.categoryChipTextActive, { color: '#fff' }]
              ]}>
                {cat === 'all' ? 'All Supplies' : CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredSupplies.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Supplies</Text>
              <Text style={[styles.sectionCount, { color: colors.textSecondary, backgroundColor: colors.inputBackground }]}>{filteredSupplies.length}</Text>
            </View>
            {filteredSupplies.map(supply => (
              <SupplyCard
                key={supply.id}
                supply={supply}
                onEdit={() => handleEditSupply(supply)}
              />
            ))}
          </>
        )}

        {supplies.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No supplies yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap the + button to add your first supply
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <AddSupplyModal
        visible={modalVisible}
        onClose={handleCloseModal}
        editSupply={editingSupply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    color: '#FFA940',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  categoryFilter: {
    maxHeight: 50,
    marginTop: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});