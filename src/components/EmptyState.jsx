import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';

export default function EmptyState({
  title = "No data yet",
  message = "There are currently no records available to display.",
  icon: Icon = Inbox,
  actionText = null,
  onAction = null,
}) {
  return (
    <div className="glass-card p-10 sm:p-12 rounded-3xl text-center border border-outline-variant/15 my-6 space-y-5 max-w-xl mx-auto">
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/15 w-16 h-16 mx-auto flex items-center justify-center text-primary">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        <p className="text-xs sm:text-sm text-on-surface-variant/80 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all inline-flex items-center gap-2 hover:bg-primary-container shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
}
