import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { UserSettings, WeightEntry } from '@/types/health';
import { getAllWeights } from '@/hooks/useHealthData';
import { useMemo } from 'react';
import { User } from 'lucide-react';

interface Props {
  settings: UserSettings;
  latestWeight?: WeightEntry;
}

export default function TopSummary({ settings, latestWeight }: Props) {
  const dayNumber = differenceInDays(new Date(), new Date(settings.dietStartDate)) + 1;
  const currentWeight = latestWeight?.value ?? settings.startingWeight;
  const totalToLose = settings.startingWeight - settings.targetWeight;
  const lost = settings.startingWeight - currentWeight;
  const remaining = currentWeight - settings.targetWeight;
  const progress = totalToLose > 0 ? Math.max(0, Math.min(1, lost / totalToLose)) : 0;

  const bmi = useMemo(() => {
    const hm = settings.height / 100;
    return currentWeight / (hm * hm);
  }, [currentWeight, settings.height]);

  const bmiLabel = bmi < 18.5 ? 'Zayıf' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Fazla Kilolu' : 'Obez';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-5 shadow-card"
    >
      {settings.fullName && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{settings.fullName}</p>
            <p className="text-xs text-muted-foreground">Diyetin {dayNumber}. günü</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          {!settings.fullName && <p className="text-sm text-muted-foreground">Diyetin {dayNumber}. günü</p>}
          <p className="text-2xl font-bold text-foreground">{currentWeight} kg</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Hedef</p>
          <p className="text-lg font-semibold text-primary">{settings.targetWeight} kg</p>
          <p className="text-xs text-muted-foreground">
            BMI: {bmi.toFixed(1)} · {bmiLabel}
          </p>
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-2.5 mb-2">
        <motion.div
          className="bg-primary h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lost > 0 ? `${lost.toFixed(1)} kg verildi` : 'Henüz başlanmadı'}</span>
        <span>{remaining > 0 ? `${remaining.toFixed(1)} kg kaldı` : 'Hedefe ulaşıldı! 🎉'}</span>
      </div>
    </motion.div>
  );
}
