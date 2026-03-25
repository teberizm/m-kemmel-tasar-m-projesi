import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface DietitianComment {
  id: string;
  date: string;
  text: string;
  timestamp: string;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

interface Props {
  dateStr: string;
}

export default function DietitianNotes({ dateStr }: Props) {
  const [comments, setComments] = useState<DietitianComment[]>([]);

  useEffect(() => {
    setComments(loadFromStorage('dietitian_comments', []));
  }, [dateStr]);

  const dayComments = comments.filter(c => c.date === dateStr);

  if (dayComments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-4 shadow-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Diyetisyen Notları</p>
          <p className="text-xs text-muted-foreground">Bugün için bırakılan yorumlar</p>
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {dayComments.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 rounded-lg p-3 border border-primary/10"
            >
              <p className="text-sm text-foreground">{c.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(c.timestamp), 'HH:mm')}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
