export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealStatus = 'ontime' | 'late' | 'missed';
export type WorkoutType = 'weight' | 'cardio' | 'walking' | 'running' | 'other';

export interface MealEntry {
  id: string;
  type: 'meal';
  mealType: MealType;
  timestamp: string;
  photo?: string;
  note?: string;
  status: MealStatus;
  delayMinutes?: number;
}

export interface WorkoutEntry {
  id: string;
  type: 'workout';
  workoutType: WorkoutType;
  timestamp: string;
  durationMinutes: number;
  caloriesBurned: number;
  note?: string;
}

export interface SleepEntry {
  id: string;
  type: 'sleep';
  sleepTime: string;
  wakeTime: string;
  totalMinutes: number;
  timestamp: string;
  note?: string;
}

export interface WaterEntry {
  id: string;
  type: 'water';
  amountMl: number;
  timestamp: string;
}

export interface WeightEntry {
  id: string;
  type: 'weight';
  value: number;
  timestamp: string;
}

export type TimelineEntry = MealEntry | WorkoutEntry | SleepEntry | WaterEntry | WeightEntry;

export interface MealTimeSettings {
  breakfast: { start: string; end: string };
  lunch: { start: string; end: string };
  dinner: { start: string; end: string };
}

export interface UserSettings {
  height: number;
  startingWeight: number;
  targetWeight: number;
  waterGoalMl: number;
  mealTimes: MealTimeSettings;
  dietStartDate: string;
  dietPlan: DietPlanItem[];
}

export interface DietPlanItem {
  id: string;
  category: string;
  item: string;
  amount: string;
}

export const MET_VALUES: Record<WorkoutType, number> = {
  walking: 3.5,
  running: 8,
  weight: 6,
  cardio: 7,
  other: 5,
};

export const DEFAULT_SETTINGS: UserSettings = {
  height: 175,
  startingWeight: 85,
  targetWeight: 75,
  waterGoalMl: 2500,
  dietStartDate: new Date().toISOString().split('T')[0],
  mealTimes: {
    breakfast: { start: '09:00', end: '11:00' },
    lunch: { start: '13:00', end: '15:00' },
    dinner: { start: '18:00', end: '21:00' },
  },
  dietPlan: [],
};
