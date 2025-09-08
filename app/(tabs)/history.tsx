import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Clock, Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';
import { historyService } from '@/hooks/history-store';
import { HistoryEvent, HistoryEventType, EVENT_TYPE_COLORS } from '@/types/history';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | HistoryEventType>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      await historyService.initialize();
      setHistory(historyService.getHistory());
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Apply time-based filters
    if (selectedFilter === 'today') {
      filtered = historyService.getTodaysHistory();
    } else if (selectedFilter === 'week') {
      filtered = historyService.getRecentHistory(7);
    } else if (selectedFilter !== 'all') {
      filtered = historyService.getHistoryByType(selectedFilter as HistoryEventType);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.metadata?.supplyName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [history, selectedFilter, searchQuery]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderHistoryItem = (event: HistoryEvent) => {
    const eventColor = EVENT_TYPE_COLORS[event.type];
    
    return (
      <View key={event.id} style={[styles.historyItem, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.eventIndicator, { backgroundColor: eventColor }]} />
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
            <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
              {formatTimestamp(event.timestamp)}
            </Text>
          </View>
          
          <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
            {event.description}
          </Text>
          
          {event.metadata?.quantityChange && (
            <View style={styles.metadata}>
              <Text style={[styles.metadataText, { 
                color: event.metadata.quantityChange > 0 ? colors.success : colors.warning 
              }]}>
                {event.metadata.quantityChange > 0 ? '+' : ''}{event.metadata.quantityChange} units
              </Text>
            </View>
          )}
          
          {event.metadata?.volumeUsed && (
            <View style={styles.metadata}>
              <Text style={[styles.metadataText, { color: colors.primary }]}>
                {event.metadata.volumeUsed}ml used
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const filterOptions = [
    { key: 'all', label: 'All Events' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'supply_added', label: 'Added' },
    { key: 'supply_quantity_changed', label: 'Quantity' },
    { key: 'item_started_using', label: 'Started Using' },
    { key: 'insulin_volume_updated', label: 'Insulin Used' },
    { key: 'notification_sent', label: 'Notifications' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search history..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterPill,
              { 
                backgroundColor: colors.cardBackground, 
                borderColor: colors.border 
              },
              selectedFilter === option.key && [
                styles.filterPillActive, 
                { backgroundColor: colors.primary, borderColor: colors.primary }
              ]
            ]}
            onPress={() => setSelectedFilter(option.key as any)}
          >
            <Text style={[
              styles.filterPillText,
              { color: colors.textSecondary },
              selectedFilter === option.key && [
                styles.filterPillTextActive, 
                { color: '#fff' }
              ]
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History List */}
      <ScrollView
        style={styles.historyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No History Found
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Start using the app to see your activity history'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.historyContent}>
            {filteredHistory.map(renderHistoryItem)}
          </View>
        )}
      </ScrollView>

      {/* Summary Stats */}
      {filteredHistory.length > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {filteredHistory.length} event{filteredHistory.length !== 1 ? 's' : ''} 
            {selectedFilter === 'today' && ' today'}
            {selectedFilter === 'week' && ' this week'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActive: {
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterPillTextActive: {
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryContainer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
