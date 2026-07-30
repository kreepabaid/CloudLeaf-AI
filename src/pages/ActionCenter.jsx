import React, { useState } from 'react';
import { insights } from '../data/mockData';

export default function ActionCenter() {
  const [actionItems, setActionItems] = useState(insights);
  const [approvedItems, setApprovedItems] = useState([]);

  const handleApprove = (id) => {
    const item = actionItems.find(i => i.id === id);
    setActionItems(actionItems.filter(i => i.id !== id));
    setApprovedItems([...approvedItems, item]);
  };

  const handleReject = (id) => {
    setActionItems(actionItems.filter(i => i.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'idle': return <span className="material-symbols-outlined text-[#f59e0b]">warning</span>;
      case 'over-provisioned': return <span className="material-symbols-outlined text-primary">flash_on</span>;
      case 'carbon': return <span className="material-symbols-outlined text-secondary">eco</span>;
      default: return <span className="material-symbols-outlined">info</span>;
    }
  };

  return (
    <main className="pt-8 px-4 flex flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <section>
        <h1 className="text-2xl font-bold text-on-surface">Optimization Queue</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review and approve AI-recommended infrastructure changes.</p>
      </section>

      {actionItems.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">All caught up!</h3>
            <p className="text-sm text-on-surface-variant mt-2">Your infrastructure is running at peak efficiency.</p>
          </div>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {actionItems.map((item) => (
            <div key={item.id} className="glass-card rounded-xl border-l-4 border-l-primary flex overflow-hidden">
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface flex items-center gap-2">
                        {item.title}
                        {item.critical && (
                          <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Critical
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-on-surface-variant">{item.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <span className="block text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">Action</span>
                    <span className="font-medium text-sm text-on-surface">{item.action}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">Est. Savings</span>
                    <span className="font-medium text-sm text-primary-container">{item.savings}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">Carbon Cut</span>
                    <span className="font-medium text-sm text-secondary">{item.carbon}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">Confidence</span>
                    <span className="font-medium text-sm text-on-surface">{item.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="w-32 bg-surface-container-low border-l border-white/5 flex flex-col">
                <button 
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined">check</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Approve</span>
                </button>
                <div className="h-[1px] bg-white/5"></div>
                <button 
                  onClick={() => handleReject(item.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Dismiss</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {approvedItems.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-bold text-on-surface mb-4">Recently Executed</h3>
          <div className="flex flex-col gap-2">
            {approvedItems.map(item => (
              <div key={item.id} className="glass-card p-4 rounded-lg flex justify-between items-center opacity-60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="text-sm line-through text-on-surface-variant">{item.title}</span>
                </div>
                <span className="text-xs text-on-surface-variant">Success</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
