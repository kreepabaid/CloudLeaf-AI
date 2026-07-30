import React from 'react';
import { AlertCircle, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InsightCard({ insight }) {
  const getIcon = () => {
    switch (insight.type) {
      case 'idle': return <AlertCircle size={20} color="var(--accent-warning)" />;
      case 'over-provisioned': return <Zap size={20} color="var(--accent-primary)" />;
      case 'carbon': return <ShieldAlert size={20} color="var(--accent-secondary)" />;
      default: return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="glass-panel hover-lift animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${insight.critical ? 'var(--accent-danger)' : 'var(--accent-primary)'}` }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{insight.title}</h4>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
              {insight.confidence}% confidence
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
            {insight.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-secondary)' }}>Save {insight.savings}</span>
              <span style={{ color: '#34d399' }}>Cut {insight.carbon}</span>
            </div>
            <Link to="/action-center" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
              Review <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
