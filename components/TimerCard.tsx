import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Clock, RefreshCw, Trash2, AlertTriangle } from 'lucide-react-native';
import { Timer } from '@/types/supplies';
import { useSupplies } from '@/hooks/supplies-store';

interface TimerCardProps {
  timer: Timer & {
    daysPassed: number;
    daysRemaining: number;
    isExpired: boolean;
    isWarning: boolean;
  };
  onEdit: () => void;
}

export function TimerCard({ timer, onEdit }: TimerCardProps) {
  const { resetTimer, deleteTimer } = useSupplies();

  const handleReset = () => {
    Alert.alert(
      'Reset Timer',
      `Reset "${timer.name}" timer to start from today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => resetTimer(timer.id) }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Timer',
      `Are you sure you want to delete "${timer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTimer(timer.id)
        }
      ]
    );
  };

  const getProgressColor = () => {
    if (timer.isExpired) return '#FF4D4F';
    if (timer.isWarning) return '#FFA940';
    if (timer.daysRemaining <= 3) return '#FFD93D';
    return '#52C41A';
  };

  const progressPercentage = Math.min(100, (timer.daysPassed / timer.durationDays) * 100);

  return (
    <TouchableOpacity style={styles.card} onPress={onEdit} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Clock size={20} color="#7B68EE" />
          <Text style={styles.name}>{timer.name}</Text>
          {timer.isExpired && (
            <AlertTriangle size={16} color="#FF4D4F" />
          )}
        </View>
        
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={18} color="#FF4D4F" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.daysRow}>
        <Text style={styles.daysText}>
          Day {timer.daysPassed} of {timer.durationDays}
        </Text>
        <Text style={[
          styles.remainingText,
          timer.isExpired && styles.expiredText,
          timer.isWarning && styles.warningText
        ]}>
          {timer.isExpired 
            ? `Expired ${Math.abs(timer.daysRemaining)} days ago`
            : `${timer.daysRemaining} days remaining`
          }
        </Text>
      </View>

      <Text style={styles.startDate}>
        Started: {new Date(timer.startDate).toLocaleDateString()}
      </Text>

      {timer.notes && (
        <Text style={styles.notes} numberOfLines={2}>{timer.notes}</Text>
      )}

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <RefreshCw size={16} color="#4A90E2" />
        <Text style={styles.resetButtonText}>Reset Timer</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  deleteButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  daysText: {
    fontSize: 14,
    color: '#666',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#52C41A',
  },
  expiredText: {
    color: '#FF4D4F',
  },
  warningText: {
    color: '#FFA940',
  },
  startDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  notes: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    backgroundColor: '#fff',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
});