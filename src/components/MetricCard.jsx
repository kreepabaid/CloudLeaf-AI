import React from 'react';

export default function MetricCard({ title, value, icon, gradientClass, trend, trendLabel }) {
  return (
    <div className="glass-panel hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</h3>
        <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <h2 className={gradientClass || ''} style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{value}</h2>
        {trend && (
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600,
            color: trend === 'down' ? 'var(--accent-secondary)' : (trend === 'up' ? 'var(--accent-danger)' : 'var(--accent-primary)'),
            backgroundColor: trend === 'down' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
          }}>
            {trend === 'down' ? '↓' : '↑'} {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
