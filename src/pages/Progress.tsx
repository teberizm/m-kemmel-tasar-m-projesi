import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAllWeights } from '@/hooks/useHealthData';
import { useSettings } from '@/hooks/useHealthData';
import { format, subDays } from 'date-fns';
import { TimelineEntry, WorkoutEntry, SleepEntry, WaterEntry } from '@/types/health';

function loadWeekData() {
  const days: { date: string; water: number; sleep: number; calories: number; workouts: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), i), 'dd/MM');
    try {
      const entries: TimelineEntry[] = JSON.parse(localStorage.getItem(`health_${d}_entries`) || '[]');
      const water = entries.filter((e): e is WaterEntry => e.type === 'water').reduce((s, e) => s + e.amountMl, 0);
      const sleepE = entries.find((e): e is SleepEntry => e.type === 'sleep');
      const sleep = sleepE ? sleepE.totalMinutes / 60 : 0;
      const workoutEntries = entries.filter((e): e is WorkoutEntry => e.type === 'workout');
      const calories = workoutEntries.reduce((s, e) => s + e.caloriesBurned, 0);
      days.push({ date: label, water: water / 1000, sleep: Math.round(sleep * 10) / 10, calories, workouts: workoutEntries.length });
    } catch {
      days.push({ date: label, water: 0, sleep: 0, calories: 0, workouts: 0 });
    }
  }
  return days;
}

export default function Progress() {
  const navigate = useNavigate();
  const weights = useMemo(() => getAllWeights().map(w => ({ date: format(new Date(w.timestamp), 'dd/MM'), kg: w.value })), []);
  const weekData = useMemo(() => loadWeekData(), []);
  const { settings } = useSettings();

  const bmi = useMemo(() => {
    const latest = weights.length > 0 ? weights[weights.length - 1].kg : settings.startingWeight;
    const hm = settings.height / 100;
    return (latest / (hm * hm)).toFixed(1);
  }, [weights, settings]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">İlerleme</h1>
        </div>

        {/* BMI */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg p-5 shadow-card text-center">
          <p className="text-sm text-muted-foreground">BMI</p>
          <p className="text-3xl font-bold text-primary">{bmi}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {Number(bmi) < 18.5 ? 'Zayıf' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Fazla Kilolu' : 'Obez'}
          </p>
        </motion.div>

        {/* Weight Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg p-5 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Kilo Grafiği</h2>
          {weights.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weights}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">Henüz kilo verisi yok</p>
          )}
        </motion.div>

        {/* Weekly calories */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-lg p-5 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Haftalık Kalori Yakımı</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="calories" fill="hsl(var(--workout))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly water and sleep */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-lg p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-2">Ort. Su (L)</h3>
            <p className="text-2xl font-bold text-water">
              {weekData.length > 0 ? (weekData.reduce((s, d) => s + d.water, 0) / weekData.length).toFixed(1) : '0'}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-card rounded-lg p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-2">Ort. Uyku (sa)</h3>
            <p className="text-2xl font-bold text-sleep">
              {weekData.length > 0 ? (weekData.reduce((s, d) => s + d.sleep, 0) / weekData.filter(d => d.sleep > 0).length || 0).toFixed(1) : '0'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
