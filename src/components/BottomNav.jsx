import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, FileText, Settings } from 'lucide-react';

export default function BottomNav() {
  const items = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Action Center', path: '/action-center', icon: Zap },
    { label: 'Reports', path: '/report', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-outline-variant/15 shadow-[0_-4px_24px_rgba(42,42,38,0.04)] rounded-t-xl px-2 py-2">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant/70 hover:text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
