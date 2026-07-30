import React from 'react';
import { 
  Bell, 
  Flame, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  X, 
  CheckCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function NotificationPanel({ 
  notifications, 
  onClose, 
  onMarkAllRead, 
  onMarkRead 
}) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  const getAlertIcon = (type) => {
    switch (type) {
      case 'carbon_alert':
        return <Flame className="w-4 h-4 text-[#f59e0b]" />;
      case 'idle_resource':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'saving_found':
        return <Sparkles className="w-4 h-4 text-[#4edea3]" />;
      case 'action_executed':
        return <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />;
      default:
        return <Info className="w-4 h-4 text-[#adc6ff]" />;
    }
  };

  return (
    <div className="absolute right-0 top-14 w-96 z-50 glass-panel rounded-2xl border border-outline-variant/25 shadow-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container/95">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/20">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-secondary hover:text-secondary-container px-2 py-1 rounded hover:bg-surface-container-low transition-colors flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/10">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant/60">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-on-surface-variant" />
            <p className="text-xs font-medium">No notifications right now.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onMarkRead(item.id)}
              className={`p-4 transition-colors cursor-pointer flex items-start gap-3 relative ${
                item.unread ? 'bg-surface-container-low hover:bg-surface-container' : 'hover:bg-surface-container-low/50 opacity-80'
              }`}
            >
              {item.unread && (
                <span className="absolute left-2 top-5 w-1.5 h-1.5 rounded-full bg-secondary" />
              )}
              <div className="p-2 rounded-xl bg-white border border-outline-variant/15 shrink-0 mt-0.5">
                {getAlertIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-on-surface truncate">{item.title}</h4>
                  <span className="text-[10px] text-on-surface-variant/70 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 text-center bg-surface-container border-t border-outline-variant/10">
        <span className="text-[11px] text-on-surface-variant/70">CloudLeaf Continuous Monitoring Active</span>
      </div>
    </div>
  );
}
