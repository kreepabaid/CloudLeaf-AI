import React from 'react';

export default function MetricCard({ title, value, subtext, trend, trendPositive = true, icon: Icon, badgeText }) {
  return (
    <div className="glass-card hover-lift p-5 rounded-2xl relative overflow-hidden group">
      {/* Background glow circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />

      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary/5 border border-outline-variant/15 text-primary group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-on-surface font-number-display">{value}</span>
        {badgeText && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container/10 text-primary font-medium border border-primary/20">
            {badgeText}
          </span>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                trendPositive ? 'text-primary' : 'text-secondary'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtext && <span className="text-on-surface-variant/70">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
