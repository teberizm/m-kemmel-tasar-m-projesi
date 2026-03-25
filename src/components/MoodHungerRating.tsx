import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  dateStr: string;
  readOnly?: boolean;
}

const MOOD_EMOJIS = ['😢', '😠', '😐', '🙂', '😁'];
const HUNGER_EMOJIS = ['😢', '😠', '😐', '🙂', '😁'];
const MOOD_LABELS = ['Çok Kötü', 'Kötü', 'Normal', 'İyi', 'Çok İyi'];
const HUNGER_LABELS = ['Çok Aç', 'Aç', 'Normal', 'Tok', 'Çok Tok'];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function EmojiRow({ label, emojis, labels, value, onChange, readOnly }: {
  label: string;
  emojis: string[];
  labels: string[];
  value: number | null;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-card">
      <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
      {value !== null && (
        <p className="text-xs text-muted-foreground mb-2">{labels[value - 1]}</p>
      )}
      {value === null && !readOnly && (
        <p className="text-xs text-muted-foreground mb-2">Bugün nasıl hissediyorsun?</p>
      )}
      <div className="flex items-center justify-between gap-1">
        {emojis.map((emoji, i) => {
          const selected = value === i + 1;
          return (
            <motion.button
              key={i}
              whileTap={readOnly ? {} : { scale: 0.85 }}
              onClick={() => !readOnly && onChange(i + 1)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                selected
                  ? 'bg-primary/15 ring-2 ring-primary'
                  : value !== null && !selected
                  ? 'opacity-40'
                  : 'hover:bg-secondary'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className={`text-2xl ${selected ? 'scale-110' : ''} transition-transform`}>{emoji}</span>
              <span className="text-[10px] text-muted-foreground">{i + 1}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function MoodHungerRating({ dateStr, readOnly }: Props) {
  const storageKey = `health_${dateStr}_mood_hunger`;
  const [mood, setMood] = useState<number | null>(null);
  const [hunger, setHunger] = useState<number | null>(null);

  useEffect(() => {
    const data = loadFromStorage<{ mood: number | null; hunger: number | null }>(storageKey, { mood: null, hunger: null });
    setMood(data.mood);
    setHunger(data.hunger);
  }, [storageKey]);

  const update = (field: 'mood' | 'hunger', value: number) => {
    const newMood = field === 'mood' ? value : mood;
    const newHunger = field === 'hunger' ? value : hunger;
    setMood(newMood);
    setHunger(newHunger);
    saveToStorage(storageKey, { mood: newMood, hunger: newHunger });
  };

  return (
    <div className="space-y-3">
      <EmojiRow
        label="🧠 Ruh Hali"
        emojis={MOOD_EMOJIS}
        labels={MOOD_LABELS}
        value={mood}
        onChange={(v) => update('mood', v)}
        readOnly={readOnly}
      />
      <EmojiRow
        label="🍽️ Açlık Seviyesi"
        emojis={HUNGER_EMOJIS}
        labels={HUNGER_LABELS}
        value={hunger}
        onChange={(v) => update('hunger', v)}
        readOnly={readOnly}
      />
    </div>
  );
}
