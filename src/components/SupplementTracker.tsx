import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check } from 'lucide-react';
import { Supplement } from '@/types/health';

interface Props {
  supplements: Supplement[];
  dateStr: string;
  readOnly?: boolean;
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

// takenCounts: Record<supplementId, number> — how many taken today
export default function SupplementTracker({ supplements, dateStr, readOnly }: Props) {
  const storageKey = `health_${dateStr}_supplements`;
  const [takenCounts, setTakenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setTakenCounts(loadFromStorage(storageKey, {}));
  }, [storageKey]);

  const toggle = (id: string, dailyCount: number) => {
    if (readOnly) return;
    const current = takenCounts[id] ?? 0;
    const next = current >= dailyCount ? 0 : current + 1;
    const updated = { ...takenCounts, [id]: next };
    setTakenCounts(updated);
    saveToStorage(storageKey, updated);
  };

  if (supplements.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Pill className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Takviye & İlaçlar</p>
          <p className="text-xs text-muted-foreground">Günlük takviyelerin</p>
        </div>
      </div>
      <div className="space-y-2">
        {supplements.map(sup => {
          const taken = takenCounts[sup.id] ?? 0;
          const completed = taken >= sup.dailyCount;
          const partial = taken > 0 && taken < sup.dailyCount;
          return (
            <motion.button
              key={sup.id}
              whileTap={readOnly ? {} : { scale: 0.97 }}
              onClick={() => toggle(sup.id, sup.dailyCount)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                completed
                  ? 'bg-primary/10 border border-primary/20'
                  : partial
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-secondary/50 border border-transparent'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  completed ? 'bg-primary text-primary-foreground' : partial ? 'bg-amber-500 text-white' : 'bg-muted'
                }`}>
                  {(completed || partial) && <Check className="w-3 h-3" />}
                </div>
                <span className={`text-sm ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {sup.name}
                </span>
              </div>
              <span className={`text-xs font-medium ${
                completed ? 'text-primary' : partial ? 'text-amber-600' : 'text-muted-foreground'
              }`}>
                {taken}/{sup.dailyCount} alındı
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
