import { useState } from 'react';
import { useSettings } from '@/hooks/useHealthData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DietPlanItem } from '@/types/health';
import { ArrowLeft, Plus, Trash2, Link2, Copy, Check, Save, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DIET_CATEGORIES = [
  'Kahvaltı',
  'Ara Öğün (Kuşluk)',
  'Öğle Yemeği',
  'Ara Öğün (İkindi)',
  'Akşam Yemeği',
  'Gece Atıştırması',
];

function DietitianLinkButton() {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/dietitian`;
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex gap-2">
      <Input readOnly value={link} className="text-xs" />
      <Button variant="outline" size="icon" onClick={copy}>
        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
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

  const handleSave = () => {
    setSaved(true);
    toast.success('Ayarlar kaydedildi!');
    setTimeout(() => setSaved(false), 2000);
  };

  // Group diet plan items by category
  const groupedDietPlan = settings.dietPlan.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DietPlanItem[]>);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-secondary">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Ayarlar</h1>
          </div>
        </div>

        {/* Name */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg p-5 shadow-card space-y-3">
          <h2 className="font-semibold text-foreground">Kişisel Bilgiler</h2>
          <div>
            <Label className="text-xs text-muted-foreground">Ad Soyad</Label>
            <Input value={settings.fullName} onChange={e => updateSettings({ fullName: e.target.value })} placeholder="Adınızı girin" />
          </div>
        </motion.div>

        {/* Body Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card rounded-lg p-5 shadow-card space-y-4">
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

        {/* Diet Plan - Improved */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-lg p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Haftalık Diyet Planı</h2>
          </div>

          {/* Grouped display */}
          {Object.keys(groupedDietPlan).length > 0 && (
            <div className="space-y-4">
              {DIET_CATEGORIES.filter(cat => groupedDietPlan[cat]).map(category => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <h3 className="text-sm font-medium text-primary">{category}</h3>
                  </div>
                  <div className="space-y-1.5 ml-4">
                    <AnimatePresence>
                      {groupedDietPlan[category].map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{item.item}</span>
                            {item.amount && (
                              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{item.amount}</span>
                            )}
                          </div>
                          <button onClick={() => removeDietItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
              {/* Items with non-standard categories */}
              {Object.entries(groupedDietPlan)
                .filter(([cat]) => !DIET_CATEGORIES.includes(cat))
                .map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
                    </div>
                    <div className="space-y-1.5 ml-4">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 group">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{item.item}</span>
                            {item.amount && (
                              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{item.amount}</span>
                            )}
                          </div>
                          <button onClick={() => removeDietItem(item.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Add new item */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Yeni Yiyecek Ekle</p>
            <Select value={newPlanCategory} onValueChange={setNewPlanCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Öğün seçin" />
              </SelectTrigger>
              <SelectContent>
                {DIET_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Yiyecek adı" value={newPlanItem} onChange={e => setNewPlanItem(e.target.value)} />
              <Input placeholder="Miktar (ör: 100g)" value={newPlanAmount} onChange={e => setNewPlanAmount(e.target.value)} />
            </div>
            <Button onClick={addDietItem} variant="outline" className="w-full gap-2" disabled={!newPlanCategory || !newPlanItem}>
              <Plus className="w-4 h-4" /> Ekle
            </Button>
          </div>
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

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleSave} className="w-full gap-2 h-12 text-base font-semibold">
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
