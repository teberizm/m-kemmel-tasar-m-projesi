import { motion } from 'framer-motion';
import { Camera, Droplets, Moon, Dumbbell, Scale } from 'lucide-react';

interface Props {
  onAction: (action: 'meal' | 'water' | 'sleep' | 'workout' | 'weight') => void;
}

const actions = [
  { key: 'meal' as const, label: 'Öğün', icon: Camera, color: 'bg-meal-light text-meal' },
  { key: 'water' as const, label: 'Su', icon: Droplets, color: 'bg-water-light text-water' },
  { key: 'sleep' as const, label: 'Uyku', icon: Moon, color: 'bg-sleep-light text-sleep' },
  { key: 'workout' as const, label: 'Egzersiz', icon: Dumbbell, color: 'bg-workout-light text-workout' },
  { key: 'weight' as const, label: 'Kilo', icon: Scale, color: 'bg-weight-light text-weight' },
];

export default function QuickActions({ onAction }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {actions.map((a, i) => (
        <motion.button
          key={a.key}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAction(a.key)}
          className={`flex flex-col items-center gap-1.5 min-w-[68px] py-3 px-4 rounded-2xl ${a.color} transition-shadow hover:shadow-elevated`}
        >
          <a.icon className="w-6 h-6" />
          <span className="text-xs font-semibold">{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
