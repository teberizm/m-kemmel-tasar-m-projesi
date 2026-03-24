import { useState } from 'react';
import { format } from 'date-fns';
import { useHealthData, useSettings } from '@/hooks/useHealthData';
import TopSummary from '@/components/TopSummary';
import QuickActions from '@/components/QuickActions';
import DailyWidgets from '@/components/DailyWidgets';
import DayNavigator from '@/components/DayNavigator';
import Timeline from '@/components/Timeline';
import EntryModals from '@/components/EntryModals';
import BottomNav from '@/components/BottomNav';

type ModalType = 'meal' | 'water' | 'sleep' | 'workout' | 'weight' | null;

export default function Index() {
  const [date, setDate] = useState(new Date());
  const dateStr = format(date, 'yyyy-MM-dd');
  const { settings } = useSettings();
  const { entries, addEntry, removeEntry, totalWater, sleepEntry, totalCaloriesBurned, meals, latestWeight } = useHealthData(dateStr);
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile layout */}
      <div className="lg:hidden max-w-lg mx-auto p-4 space-y-5">
        <TopSummary settings={settings} latestWeight={latestWeight} />
        <DayNavigator date={date} onChange={setDate} />
        <QuickActions onAction={setModal} />
        <DailyWidgets
          totalWater={totalWater}
          waterGoal={settings.waterGoalMl}
          sleepEntry={sleepEntry}
          totalCalories={totalCaloriesBurned}
          meals={meals}
        />
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">Günlük Zaman Çizelgesi</h2>
          <Timeline entries={entries} onRemove={removeEntry} />
        </div>
      </div>

      {/* Desktop split layout */}
      <div className="hidden lg:flex max-w-6xl mx-auto p-6 gap-6">
        <div className="flex-1 space-y-5">
          <TopSummary settings={settings} latestWeight={latestWeight} />
          <DayNavigator date={date} onChange={setDate} />
          <QuickActions onAction={setModal} />
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">Günlük Zaman Çizelgesi</h2>
            <Timeline entries={entries} onRemove={removeEntry} />
          </div>
        </div>
        <div className="w-80 space-y-4 sticky top-6 self-start">
          <DailyWidgets
            totalWater={totalWater}
            waterGoal={settings.waterGoalMl}
            sleepEntry={sleepEntry}
            totalCalories={totalCaloriesBurned}
            meals={meals}
          />
        </div>
      </div>

      <EntryModals open={modal} onClose={() => setModal(null)} onAdd={addEntry} date={dateStr} />
      <BottomNav />
    </div>
  );
}
