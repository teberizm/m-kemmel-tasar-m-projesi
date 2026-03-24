import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Camera, Droplets, Moon, Dumbbell, Scale, Clock } from 'lucide-react';
import { TimelineEntry, MealEntry, WorkoutEntry, SleepEntry, WaterEntry, WeightEntry } from '@/types/health';

interface Props {
  entries: TimelineEntry[];
  onRemove: (id: string) => void;
}

const workoutLabels: Record<string, string> = {
  weight: 'Ağırlık', cardio: 'Kardiyo', walking: 'Yürüyüş', running: 'Koşu', other: 'Diğer',
};
const mealLabels: Record<string, string> = {
  breakfast: 'Kahvaltı', lunch: 'Öğle Yemeği', dinner: 'Akşam Yemeği', snack: 'Atıştırmalık',
};
const statusColors: Record<string, string> = {
  ontime: 'bg-status-ontime',
  late: 'bg-status-late',
  missed: 'bg-status-missed',
};

function TimeLabel({ timestamp }: { timestamp: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      {format(new Date(timestamp), 'HH:mm')}
    </div>
  );
}

function MealCard({ entry }: { entry: MealEntry }) {
  return (
    <div className="flex gap-3">
      {entry.photo ? (
        <img src={entry.photo} alt="Öğün" className="w-20 h-20 rounded-lg object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-meal-light flex items-center justify-center">
          <Camera className="w-8 h-8 text-meal" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{mealLabels[entry.mealType]}</span>
          <span className={`w-2 h-2 rounded-full ${statusColors[entry.status]}`} />
          {entry.status === 'late' && entry.delayMinutes && (
            <span className="text-xs text-status-late">{entry.delayMinutes}dk geç</span>
          )}
        </div>
        <TimeLabel timestamp={entry.timestamp} />
        {entry.note && <p className="text-xs text-muted-foreground mt-1 truncate">{entry.note}</p>}
      </div>
    </div>
  );
}

function WorkoutCard({ entry }: { entry: WorkoutEntry }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-workout-light flex items-center justify-center">
        <Dumbbell className="w-5 h-5 text-workout" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{workoutLabels[entry.workoutType]}</p>
        <TimeLabel timestamp={entry.timestamp} />
        <p className="text-xs text-muted-foreground">{entry.durationMinutes}dk · {entry.caloriesBurned} kcal</p>
      </div>
    </div>
  );
}

function SleepCard({ entry }: { entry: SleepEntry }) {
  const h = Math.floor(entry.totalMinutes / 60);
  const m = entry.totalMinutes % 60;
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-sleep-light flex items-center justify-center">
        <Moon className="w-5 h-5 text-sleep" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">Uyku</p>
        <p className="text-xs text-muted-foreground">{entry.sleepTime} → {entry.wakeTime}</p>
        <p className="text-xs font-medium text-foreground">{h}s {m}dk uyudunuz</p>
      </div>
    </div>
  );
}

function WaterCard({ entry }: { entry: WaterEntry }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-water-light flex items-center justify-center">
        <Droplets className="w-4 h-4 text-water" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">+{entry.amountMl}ml su</p>
        <TimeLabel timestamp={entry.timestamp} />
      </div>
    </div>
  );
}

function WeightCard({ entry }: { entry: WeightEntry }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-weight-light flex items-center justify-center">
        <Scale className="w-4 h-4 text-weight" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{entry.value} kg</p>
        <TimeLabel timestamp={entry.timestamp} />
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: TimelineEntry }) {
  switch (entry.type) {
    case 'meal': return <MealCard entry={entry} />;
    case 'workout': return <WorkoutCard entry={entry} />;
    case 'sleep': return <SleepCard entry={entry} />;
    case 'water': return <WaterCard entry={entry} />;
    case 'weight': return <WeightCard entry={entry} />;
  }
}

export default function Timeline({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">Henüz kayıt yok</p>
        <p className="text-muted-foreground text-xs mt-1">Yukarıdaki butonları kullanarak gün boyunca kayıt ekleyin</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <AnimatePresence>
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.04 }}
            className="relative pl-12 pb-4"
          >
            <div className="absolute left-[14px] top-3 w-3 h-3 rounded-full bg-primary border-2 border-card z-10" />
            <div className="bg-card rounded-lg p-4 shadow-card group relative">
              <EntryCard entry={entry} />
              <button
                onClick={() => onRemove(entry.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
