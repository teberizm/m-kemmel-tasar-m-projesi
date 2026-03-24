import { useState, useCallback, useEffect } from 'react';
import { TimelineEntry, UserSettings, DEFAULT_SETTINGS, MealEntry, WaterEntry, SleepEntry, WorkoutEntry, WeightEntry, MealType, MealStatus } from '@/types/health';

function getStorageKey(date: string, suffix: string) {
  return `health_${date}_${suffix}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadFromStorage('health_settings', DEFAULT_SETTINGS)
  );

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      saveToStorage('health_settings', next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}

export function useHealthData(dateStr: string) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    setEntries(loadFromStorage(getStorageKey(dateStr, 'entries'), []));
  }, [dateStr]);

  const save = useCallback((newEntries: TimelineEntry[]) => {
    setEntries(newEntries);
    saveToStorage(getStorageKey(dateStr, 'entries'), newEntries);
  }, [dateStr]);

  const addEntry = useCallback((entry: TimelineEntry) => {
    setEntries(prev => {
      const next = [...prev, entry].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      saveToStorage(getStorageKey(dateStr, 'entries'), next);
      return next;
    });
  }, [dateStr]);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      saveToStorage(getStorageKey(dateStr, 'entries'), next);
      return next;
    });
  }, [dateStr]);

  const totalWater = entries
    .filter((e): e is WaterEntry => e.type === 'water')
    .reduce((sum, e) => sum + e.amountMl, 0);

  const sleepEntry = entries.find((e): e is SleepEntry => e.type === 'sleep');

  const totalCaloriesBurned = entries
    .filter((e): e is WorkoutEntry => e.type === 'workout')
    .reduce((sum, e) => sum + e.caloriesBurned, 0);

  const meals = entries.filter((e): e is MealEntry => e.type === 'meal');

  const latestWeight = entries
    .filter((e): e is WeightEntry => e.type === 'weight')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return {
    entries,
    addEntry,
    removeEntry,
    totalWater,
    sleepEntry,
    totalCaloriesBurned,
    meals,
    latestWeight,
  };
}

export function getMealStatus(
  mealType: MealType,
  timestamp: string,
  mealTimes: UserSettings['mealTimes']
): { status: MealStatus; delayMinutes?: number } {
  if (mealType === 'snack') return { status: 'ontime' };

  const time = new Date(timestamp);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const totalMin = hours * 60 + minutes;

  const range = mealTimes[mealType];
  const [startH, startM] = range.start.split(':').map(Number);
  const [endH, endM] = range.end.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  if (totalMin >= startMin && totalMin <= endMin) {
    return { status: 'ontime' };
  } else if (totalMin > endMin) {
    return { status: 'late', delayMinutes: totalMin - endMin };
  }
  return { status: 'ontime' };
}

export function getAllWeights(): WeightEntry[] {
  const weights: WeightEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('_entries')) {
      try {
        const entries: TimelineEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
        entries.filter((e): e is WeightEntry => e.type === 'weight').forEach(w => weights.push(w));
      } catch {}
    }
  }
  return weights.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
