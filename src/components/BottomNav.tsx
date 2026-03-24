import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, Settings } from 'lucide-react';

const items = [
  { path: '/', icon: Home, label: 'Ana Sayfa' },
  { path: '/progress', icon: BarChart3, label: 'İlerleme' },
  { path: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-50 lg:hidden">
      <div className="flex justify-around py-2">
        {items.map(item => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
