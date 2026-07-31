import React from 'react';
import { ServerOff, RotateCcw, AlertTriangle } from 'lucide-react';

export default function ErrorState({
  title = "Couldn't load data",
  message = "Could not connect to backend server. Please verify the FastAPI service is running at http://127.0.0.1:8000.",
  onRetry = null,
}) {
  return (
    <div className="glass-card p-10 sm:p-12 rounded-3xl text-center border border-error/20 my-6 space-y-5 max-w-xl mx-auto">
      <div className="p-4 rounded-2xl bg-error/10 border border-error/20 w-16 h-16 mx-auto flex items-center justify-center text-error">
        <ServerOff className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-on-surface flex items-center justify-center gap-2">
          {title}
          <AlertTriangle className="w-4 h-4 text-error" />
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant/80 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all inline-flex items-center gap-2 hover:bg-primary-container shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
}
