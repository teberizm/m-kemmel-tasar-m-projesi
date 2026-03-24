import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MealType, MealEntry, WorkoutEntry, SleepEntry, WaterEntry, WeightEntry, WorkoutType, MET_VALUES, TimelineEntry } from '@/types/health';
import { getMealStatus, useSettings } from '@/hooks/useHealthData';

type ModalType = 'meal' | 'water' | 'sleep' | 'workout' | 'weight' | null;

interface Props {
  open: ModalType;
  onClose: () => void;
  onAdd: (entry: TimelineEntry) => void;
  date: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function MealForm({ onAdd, onClose, date }: { onAdd: (e: MealEntry) => void; onClose: () => void; date: string }) {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string>();
  const { settings } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submit = () => {
    const timestamp = new Date().toISOString();
    const { status, delayMinutes } = getMealStatus(mealType, timestamp, settings.mealTimes);
    onAdd({ id: uid(), type: 'meal', mealType, timestamp, photo, note, status, delayMinutes });
    onClose();
  };

  const types: { key: MealType; label: string }[] = [
    { key: 'breakfast', label: 'Kahvaltı' },
    { key: 'lunch', label: 'Öğle' },
    { key: 'dinner', label: 'Akşam' },
    { key: 'snack', label: 'Atıştırma' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {types.map(t => (
          <button
            key={t.key}
            onClick={() => setMealType(t.key)}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
              mealType === t.key ? 'bg-meal text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
      >
        {photo ? (
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <p className="text-muted-foreground text-sm">📸 Fotoğraf ekle</p>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

      <Input placeholder="Not ekle (opsiyonel)" value={note} onChange={e => setNote(e.target.value)} />
      <Button onClick={submit} className="w-full bg-meal hover:bg-meal/90 text-primary-foreground">Öğün Ekle</Button>
    </div>
  );
}

function WaterForm({ onAdd, onClose }: { onAdd: (e: WaterEntry) => void; onClose: () => void }) {
  const amounts = [200, 250, 330, 500];
  const [custom, setCustom] = useState('');

  const add = (ml: number) => {
    onAdd({ id: uid(), type: 'water', amountMl: ml, timestamp: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {amounts.map(a => (
          <button
            key={a}
            onClick={() => add(a)}
            className="py-4 rounded-xl bg-water-light text-water font-semibold text-lg hover:shadow-elevated transition-shadow"
          >
            +{a}ml
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input type="number" placeholder="Özel miktar (ml)" value={custom} onChange={e => setCustom(e.target.value)} />
        <Button onClick={() => custom && add(Number(custom))} variant="outline">Ekle</Button>
      </div>
    </div>
  );
}

function SleepForm({ onAdd, onClose }: { onAdd: (e: SleepEntry) => void; onClose: () => void }) {
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  const submit = () => {
    const [sh, sm] = sleepTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let totalMin = (wh * 60 + wm) - (sh * 60 + sm);
    if (totalMin < 0) totalMin += 24 * 60;
    onAdd({ id: uid(), type: 'sleep', sleepTime, wakeTime, totalMinutes: totalMin, timestamp: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Yatış Saati</Label>
          <Input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Kalkış Saati</Label>
          <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} className="w-full bg-sleep hover:bg-sleep/90 text-primary-foreground">Uyku Kaydet</Button>
    </div>
  );
}

function WorkoutForm({ onAdd, onClose }: { onAdd: (e: WorkoutEntry) => void; onClose: () => void }) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>('walking');
  const [duration, setDuration] = useState('30');
  const { settings } = useSettings();

  const types: { key: WorkoutType; label: string }[] = [
    { key: 'walking', label: '🚶 Yürüyüş' },
    { key: 'running', label: '🏃 Koşu' },
    { key: 'weight', label: '🏋️ Ağırlık' },
    { key: 'cardio', label: '❤️ Kardiyo' },
    { key: 'other', label: '⚡ Diğer' },
  ];

  const submit = () => {
    const dur = Number(duration);
    const cal = Math.round(MET_VALUES[workoutType] * settings.startingWeight * (dur / 60));
    onAdd({ id: uid(), type: 'workout', workoutType, durationMinutes: dur, caloriesBurned: cal, timestamp: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {types.map(t => (
          <button
            key={t.key}
            onClick={() => setWorkoutType(t.key)}
            className={`py-2 rounded-lg text-xs font-medium transition-colors ${
              workoutType === t.key ? 'bg-workout text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Süre (dakika)</Label>
        <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
      </div>
      <Button onClick={submit} className="w-full bg-workout hover:bg-workout/90 text-primary-foreground">Egzersiz Ekle</Button>
    </div>
  );
}

function WeightForm({ onAdd, onClose }: { onAdd: (e: WeightEntry) => void; onClose: () => void }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value) return;
    onAdd({ id: uid(), type: 'weight', value: Number(value), timestamp: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Kilo (kg)</Label>
        <Input type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} placeholder="75.5" />
      </div>
      <Button onClick={submit} className="w-full bg-weight hover:bg-weight/90 text-primary-foreground">Kilo Kaydet</Button>
    </div>
  );
}

const titles: Record<string, string> = {
  meal: '📸 Öğün Ekle',
  water: '💧 Su Ekle',
  sleep: '🌙 Uyku Kaydet',
  workout: '🏋️ Egzersiz Ekle',
  weight: '⚖️ Kilo Kaydet',
};

export default function EntryModals({ open, onClose, onAdd, date }: Props) {
  if (!open) return null;

  return (
    <Dialog open={!!open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[open]}</DialogTitle>
        </DialogHeader>
        {open === 'meal' && <MealForm onAdd={onAdd as any} onClose={onClose} date={date} />}
        {open === 'water' && <WaterForm onAdd={onAdd as any} onClose={onClose} />}
        {open === 'sleep' && <SleepForm onAdd={onAdd as any} onClose={onClose} />}
        {open === 'workout' && <WorkoutForm onAdd={onAdd as any} onClose={onClose} />}
        {open === 'weight' && <WeightForm onAdd={onAdd as any} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
