import { useState } from 'react';
import { useSettings } from '@/hooks/useHealthData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DietPlanItem } from '@/types/health';
import { ArrowLeft, Plus, Trash2, Link2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [newPlanCategory, setNewPlanCategory] = useState('');
  const [newPlanItem, setNewPlanItem] = useState('');
  const [newPlanAmount, setNewPlanAmount] = useState('');

  const addDietItem = () => {
    if (!newPlanCategory || !newPlanItem) return;
    const item: DietPlanItem = { id: Math.random().toString(36).slice(2), category: newPlanCategory, item: newPlanItem, amount: newPlanAmount };
    updateSettings({ dietPlan: [...settings.dietPlan, item] });
    setNewPlanCategory('');
    setNewPlanItem('');
    setNewPlanAmount('');
  };

  const removeDietItem = (id: string) => {
    updateSettings({ dietPlan: settings.dietPlan.filter(i => i.id !== id) });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Ayarlar</h1>
        </div>

        {/* Body Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg p-5 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground">Vücut Bilgileri</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Boy (cm)</Label>
              <Input type="number" value={settings.height} onChange={e => updateSettings({ height: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Başlangıç (kg)</Label>
              <Input type="number" value={settings.startingWeight} onChange={e => updateSettings({ startingWeight: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hedef (kg)</Label>
              <Input type="number" value={settings.targetWeight} onChange={e => updateSettings({ targetWeight: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Diyet Başlangıç Tarihi</Label>
            <Input type="date" value={settings.dietStartDate} onChange={e => updateSettings({ dietStartDate: e.target.value })} />
          </div>
        </motion.div>

        {/* Water Goal */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg p-5 shadow-card space-y-3">
          <h2 className="font-semibold text-foreground">Su Hedefi</h2>
          <div className="flex items-center gap-2">
            <Input type="number" value={settings.waterGoalMl} onChange={e => updateSettings({ waterGoalMl: Number(e.target.value) })} />
            <span className="text-sm text-muted-foreground">ml/gün</span>
          </div>
        </motion.div>

        {/* Meal Times */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-lg p-5 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground">Öğün Saatleri</h2>
          {(['breakfast', 'lunch', 'dinner'] as const).map(meal => {
            const labels = { breakfast: 'Kahvaltı', lunch: 'Öğle', dinner: 'Akşam' };
            return (
              <div key={meal} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-16">{labels[meal]}</span>
                <Input
                  type="time"
                  value={settings.mealTimes[meal].start}
                  onChange={e => updateSettings({
                    mealTimes: { ...settings.mealTimes, [meal]: { ...settings.mealTimes[meal], start: e.target.value } }
                  })}
                  className="flex-1"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={settings.mealTimes[meal].end}
                  onChange={e => updateSettings({
                    mealTimes: { ...settings.mealTimes, [meal]: { ...settings.mealTimes[meal], end: e.target.value } }
                  })}
                  className="flex-1"
                />
              </div>
            );
          })}
        </motion.div>

        {/* Diet Plan */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-lg p-5 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground">Haftalık Diyet Planı</h2>

          {settings.dietPlan.length > 0 && (
            <div className="space-y-2">
              {settings.dietPlan.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                  <div>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    <p className="text-sm font-medium text-foreground">{item.item} {item.amount && `(${item.amount})`}</p>
                  </div>
                  <button onClick={() => removeDietItem(item.id)} className="p-1 hover:bg-destructive/10 rounded">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Kategori" value={newPlanCategory} onChange={e => setNewPlanCategory(e.target.value)} />
            <Input placeholder="Yiyecek" value={newPlanItem} onChange={e => setNewPlanItem(e.target.value)} />
            <Input placeholder="Miktar" value={newPlanAmount} onChange={e => setNewPlanAmount(e.target.value)} />
          </div>
          <Button onClick={addDietItem} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Ekle
          </Button>
        </motion.div>

        {/* Dietitian Link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-lg p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Diyetisyen Linki</h2>
          </div>
          <p className="text-xs text-muted-foreground">Bu linki diyetisyeninize gönderin. Kayıtlarınızı görebilir ve günlük yorum bırakabilir.</p>
          <DietitianLinkButton />
        </motion.div>
      </div>
    </div>
  );
}
