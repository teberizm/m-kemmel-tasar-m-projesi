import { useState, useCallback, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MessageSquare, Send, Droplets, Moon, Dumbbell, UtensilsCrossed, Camera, Scale, Clock, Check, AlertTriangle, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TimelineEntry, MealEntry, WorkoutEntry, SleepEntry, WaterEntry, WeightEntry, UserSettings, DEFAULT_SETTINGS, MealType } from '@/types/health';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

interface DietitianComment {
  id: string;
  date: string;
  text: string;
  timestamp: string;
}

const workoutLabels: Record<string, string> = {
  weight: 'Ağırlık', cardio: 'Kardiyo', walking: 'Yürüyüş', running: 'Koşu', other: 'Diğer',
};
const mealLabels: Record<string, string> = {
  breakfast: 'Kahvaltı', lunch: 'Öğle Yemeği', dinner: 'Akşam Yemeği', snack: 'Atıştırmalık',
};

function MealStatusIcon({ status }: { status: string }) {
  if (status === 'ontime') return <Check className="w-4 h-4 text-status-ontime" />;
  if (status === 'late') return <AlertTriangle className="w-4 h-4 text-status-late" />;
  return <X className="w-4 h-4 text-status-missed" />;
}

function StatCard({ icon: Icon, bg, iconColor, title, value, sub }: { icon: any; bg: string; iconColor: string; title: string; value: string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function EntryRow({ entry, onPhotoClick }: { entry: TimelineEntry; onPhotoClick?: (src: string) => void }) {
  switch (entry.type) {
    case 'meal': {
      const e = entry as MealEntry;
      return (
        <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
          {e.photo ? (
            <div className="relative group cursor-pointer" onClick={() => onPhotoClick?.(e.photo!)}>
              <img src={e.photo} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-meal-light flex items-center justify-center">
              <Camera className="w-7 h-7 text-meal" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{mealLabels[e.mealType]}</span>
              <MealStatusIcon status={e.status} />
              {e.status === 'late' && e.delayMinutes && (
                <span className="text-xs text-status-late">{e.delayMinutes}dk geç</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(e.timestamp), 'HH:mm')}
            </div>
            {e.note && <p className="text-xs text-muted-foreground mt-0.5">{e.note}</p>}
          </div>
        </div>
      );
    }
    case 'workout': {
      const e = entry as WorkoutEntry;
      return (
        <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div className="w-14 h-14 rounded-xl bg-workout-light flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-workout" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">{workoutLabels[e.workoutType]}</p>
            <p className="text-xs text-muted-foreground">{e.durationMinutes}dk · {e.caloriesBurned} kcal</p>
            {e.note && <p className="text-xs text-muted-foreground mt-0.5 italic">📝 {e.note}</p>}
          </div>
        </div>
      );
    }
    case 'sleep': {
      const e = entry as SleepEntry;
      const h = Math.floor(e.totalMinutes / 60);
      const m = e.totalMinutes % 60;
      return (
        <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div className="w-14 h-14 rounded-xl bg-sleep-light flex items-center justify-center">
            <Moon className="w-6 h-6 text-sleep" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Uyku</p>
            <p className="text-xs text-muted-foreground">{e.sleepTime} → {e.wakeTime} · {h}s {m}dk</p>
            {e.note && <p className="text-xs text-muted-foreground mt-0.5 italic">📝 {e.note}</p>}
          </div>
        </div>
      );
    }
    case 'water': {
      const e = entry as WaterEntry;
      return (
        <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div className="w-10 h-10 rounded-xl bg-water-light flex items-center justify-center">
            <Droplets className="w-5 h-5 text-water" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">+{e.amountMl}ml su</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(e.timestamp), 'HH:mm')}
            </div>
          </div>
        </div>
      );
    }
    case 'weight': {
      const e = entry as WeightEntry;
      return (
        <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div className="w-10 h-10 rounded-xl bg-weight-light flex items-center justify-center">
            <Scale className="w-5 h-5 text-weight" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{e.value} kg</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(e.timestamp), 'HH:mm')}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default function Dietitian() {
  const [date, setDate] = useState(new Date());
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const dateStr = format(date, 'yyyy-MM-dd');

  const entries: TimelineEntry[] = loadFromStorage(`health_${dateStr}_entries`, []);
  const settings: UserSettings = loadFromStorage('health_settings', DEFAULT_SETTINGS);

  const [comments, setComments] = useState<DietitianComment[]>(() =>
    loadFromStorage('dietitian_comments', [])
  );
  const [newComment, setNewComment] = useState('');

  const dayComments = comments.filter(c => c.date === dateStr);

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: DietitianComment = {
      id: Math.random().toString(36).slice(2, 10),
      date: dateStr,
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    saveToStorage('dietitian_comments', updated);
    setNewComment('');
  };

  const removeComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    saveToStorage('dietitian_comments', updated);
  };

  // Derived stats
  const totalWater = entries.filter((e): e is WaterEntry => e.type === 'water').reduce((s, e) => s + e.amountMl, 0);
  const sleepEntry = entries.find((e): e is SleepEntry => e.type === 'sleep');
  const totalCal = entries.filter((e): e is WorkoutEntry => e.type === 'workout').reduce((s, e) => s + e.caloriesBurned, 0);
  const meals = entries.filter((e): e is MealEntry => e.type === 'meal');
  const latestWeight = entries.filter((e): e is WeightEntry => e.type === 'weight').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const currentWeight = latestWeight?.value ?? settings.startingWeight;
  const bmi = currentWeight / ((settings.height / 100) ** 2);

  const mealStatuses = (['breakfast', 'lunch', 'dinner'] as MealType[]).map(mt => {
    const found = meals.find(m => m.mealType === mt);
    return { type: mt, status: found?.status ?? 'missed', label: { breakfast: 'Kahvaltı', lunch: 'Öğle', dinner: 'Akşam' }[mt] };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Diyetisyen Paneli</h1>
              <p className="text-xs text-muted-foreground">Hasta takip görünümü</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{currentWeight} kg</p>
            <p className="text-xs text-muted-foreground">BMI: {bmi.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setDate(d => subDays(d, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 bg-card px-5 py-2.5 rounded-xl shadow-card">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDate(d => addDays(d, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop: 3-column layout — middle column wider */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-6">
          {/* Summary Stats */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Günlük Özet</h2>
            <StatCard icon={Scale} bg="bg-weight-light" iconColor="text-weight" title="Kilo" value={`${currentWeight} kg`} sub={`Hedef: ${settings.targetWeight} kg`} />
            <StatCard icon={Droplets} bg="bg-water-light" iconColor="text-water" title="Su Tüketimi" value={`${(totalWater / 1000).toFixed(1)}L`} sub={`Hedef: ${(settings.waterGoalMl / 1000).toFixed(1)}L`} />
            <StatCard icon={Moon} bg="bg-sleep-light" iconColor="text-sleep" title="Uyku" value={sleepEntry ? `${Math.floor(sleepEntry.totalMinutes / 60)}s ${sleepEntry.totalMinutes % 60}dk` : 'Kayıt yok'} sub={sleepEntry ? `${sleepEntry.sleepTime} → ${sleepEntry.wakeTime}` : undefined} />
            <StatCard icon={Dumbbell} bg="bg-workout-light" iconColor="text-workout" title="Egzersiz" value={totalCal > 0 ? `${totalCal} kcal` : 'Egzersiz yok'} />

            {/* Meal Status */}
            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="w-4 h-4 text-meal" />
                <p className="text-sm font-semibold text-foreground">Öğün Durumu</p>
              </div>
              <div className="space-y-2">
                {mealStatuses.map(ms => (
                  <div key={ms.type} className="flex items-center gap-2">
                    <MealStatusIcon status={ms.status} />
                    <span className="text-sm text-foreground">{ms.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {ms.status === 'ontime' ? 'Zamanında' : ms.status === 'late' ? 'Geç' : 'Yok'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Öğün Çizelgesi */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Öğün Çizelgesi</h2>
            {entries.length === 0 ? (
              <div className="bg-card rounded-xl p-8 shadow-card text-center">
                <p className="text-muted-foreground text-sm">Bu gün için kayıt yok</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl px-5 shadow-card">
                {entries.map(entry => (
                  <EntryRow key={entry.id} entry={entry} onPhotoClick={(src) => setExpandedPhoto(src)} />
                ))}
              </div>
            )}
          </div>

          {/* Dietitian Comments */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Diyetisyen Yorumları</h2>
            <div className="bg-card rounded-xl p-5 shadow-card space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Bu gün için yorum yazın..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
              <Button onClick={addComment} className="w-full" disabled={!newComment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Yorum Ekle
              </Button>

              {dayComments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <AnimatePresence>
                    {dayComments.map(c => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-primary/5 rounded-xl p-4 relative group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(c.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{c.text}</p>
                        <button
                          onClick={() => removeComment(c.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {dayComments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Bu gün için henüz yorum yok</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo expand dialog */}
      <Dialog open={!!expandedPhoto} onOpenChange={() => setExpandedPhoto(null)}>
        <DialogContent className="max-w-2xl p-2 bg-black/90 border-none">
          {expandedPhoto && (
            <img src={expandedPhoto} alt="Öğün fotoğrafı" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
