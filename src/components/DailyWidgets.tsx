import { motion } from 'framer-motion';
import { Droplets, Moon, Dumbbell, UtensilsCrossed, Check, AlertTriangle, X } from 'lucide-react';
import { MealEntry, SleepEntry, UserSettings, MealType } from '@/types/health';

interface Props {
  totalWater: number;
  waterGoal: number;
  sleepEntry?: SleepEntry;
  totalCalories: number;
  meals: MealEntry[];
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}s ${m}dk`;
}

function MealStatusIcon({ status }: { status: string }) {
  if (status === 'ontime') return <Check className="w-4 h-4 text-status-ontime" />;
  if (status === 'late') return <AlertTriangle className="w-4 h-4 text-status-late" />;
  return <X className="w-4 h-4 text-status-missed" />;
}

const mealLabels: Record<string, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
};

export default function DailyWidgets({ totalWater, waterGoal, sleepEntry, totalCalories, meals }: Props) {
  const waterPct = Math.min(100, (totalWater / waterGoal) * 100);

  const mealStatuses = (['breakfast', 'lunch', 'dinner'] as MealType[]).map(mt => {
    const found = meals.find(m => m.mealType === mt);
    return { type: mt, status: found?.status ?? 'missed', label: mealLabels[mt] };
  });

  const widgets = [
    {
      icon: Droplets,
      bg: 'bg-water-light',
      iconColor: 'text-water',
      title: 'Su',
      value: `${(totalWater / 1000).toFixed(1)} / ${(waterGoal / 1000).toFixed(1)}L`,
      progress: waterPct,
      progressColor: 'bg-water',
    },
    {
      icon: Moon,
      bg: 'bg-sleep-light',
      iconColor: 'text-sleep',
      title: 'Uyku',
      value: sleepEntry ? formatDuration(sleepEntry.totalMinutes) : 'Kayıt yok',
    },
    {
      icon: Dumbbell,
      bg: 'bg-workout-light',
      iconColor: 'text-workout',
      title: 'Egzersiz',
      value: totalCalories > 0 ? `${totalCalories} kcal yakıldı` : 'Egzersiz yok',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {widgets.map((w, i) => (
          <motion.div
            key={w.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-lg p-3 shadow-card"
          >
            <div className={`w-8 h-8 ${w.bg} rounded-lg flex items-center justify-center mb-2`}>
              <w.icon className={`w-4 h-4 ${w.iconColor}`} />
            </div>
            <p className="text-xs text-muted-foreground">{w.title}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{w.value}</p>
            {w.progress !== undefined && (
              <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                <div className={`${w.progressColor} h-1.5 rounded-full transition-all`} style={{ width: `${w.progress}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-lg p-4 shadow-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <UtensilsCrossed className="w-4 h-4 text-meal" />
          <p className="text-sm font-semibold text-foreground">Öğün Durumu</p>
        </div>
        <div className="flex gap-4">
          {mealStatuses.map(ms => (
            <div key={ms.type} className="flex items-center gap-1.5">
              <MealStatusIcon status={ms.status} />
              <span className="text-xs text-muted-foreground">{ms.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
