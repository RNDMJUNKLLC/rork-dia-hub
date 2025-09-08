export type SupplyCategory = 'insulin' | 'cgm' | 'test-strips' | 'lancets' | 'needles' | 'infusion-sets' | 'pump' | 'other';

export interface Supply {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  expirationDate?: string;
  notes?: string;
  warningThreshold?: number;
}

export interface Timer {
  id: string;
  name: string;
  type: 'cgm' | 'infusion-set' | 'custom';
  startDate: string;
  durationDays: number;
  notes?: string;
}

export interface InUseItem {
  id: string;
  supplyId: string;
  supplyName: string;
  category: SupplyCategory;
  startedAt: string;
  expiresAt?: string;
  gracePeriodHours?: number;
  gracePeriodEndsAt?: string;
  details: InsulinDetails | DeviceDetails;
}

export interface InsulinDetails {
  type: 'insulin';
  totalVolume: number;
  remainingVolume: number;
  unit: 'ml' | 'units';
}

export interface DeviceDetails {
  type: 'device';
  durationHours: number;
  endedEarly?: boolean;
}

export const CATEGORY_LABELS = {
  insulin: 'Insulin',
  cgm: 'CGM/Sensors',
  'test-strips': 'Test Strips',
  lancets: 'Lancets',
  needles: 'Needles',
  'infusion-sets': 'Infusion Sets',
  pump: 'Insulin Pump',
  other: 'Other Supplies'
} as const;

export const CATEGORY_COLORS = {
  insulin: '#4A90E2',
  cgm: '#7B68EE',
  'test-strips': '#20B2AA',
  lancets: '#FF6B6B',
  needles: '#32CD32',
  'infusion-sets': '#4ECDC4',
  pump: '#FF8C00',
  other: '#95A5A6'
} as const;

export const TIMER_DURATIONS = {
  cgm: 10, // Dexcom G6 is 10 days
  'infusion-set': 3, // Typical infusion set change
  custom: 7 // Default for custom timers
} as const;