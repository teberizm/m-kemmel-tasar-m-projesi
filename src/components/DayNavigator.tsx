import { format, addDays, subDays, isBefore, startOfDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  date: Date;
  onChange: (date: Date) => void;
  minDate?: string;
}

export default function DayNavigator({ date, onChange, minDate }: Props) {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const canGoBack = !minDate || !isBefore(subDays(startOfDay(date), 1), startOfDay(parseISO(minDate)));

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(subDays(date, 1))}
        disabled={!canGoBack}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      <motion.div
        key={date.toISOString()}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg font-bold text-foreground">
          {isToday ? 'Bugün' : format(date, 'd MMMM EEEE', { locale: tr })}
        </p>
        {isToday && (
          <p className="text-xs text-muted-foreground">{format(date, 'd MMMM yyyy', { locale: tr })}</p>
        )}
      </motion.div>

      <button
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
}
