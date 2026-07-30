import React from 'react';
import { mockStats } from '../data/mockData';

export default function Report() {
  return (
    <main className="pt-8 px-4 flex flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Sustainability Report</h2>
          <p className="text-sm text-on-surface-variant mt-1">Q3 2026 • Generates automatically on the 1st of every month.</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-card px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors rounded-lg">
            <span className="material-symbols-outlined text-sm">share</span>
            <span className="text-sm font-semibold">Share</span>
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 flex items-center gap-2 hover:bg-primary/90 transition-colors rounded-lg">
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="text-sm font-bold">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-12 relative overflow-hidden mb-4 rounded-2xl">
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
        
        <div className="text-center mb-12 relative z-10 flex flex-col items-center">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">eco</span>
          <h1 className="text-7xl font-extrabold m-0 leading-none text-primary" style={{ background: 'linear-gradient(90deg, var(--accent-secondary), #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {mockStats.sustainabilityScore}
          </h1>
          <p className="text-lg text-on-surface-variant mt-2">Composite Sustainability Score</p>
          <p className="mt-4 max-w-xl mx-auto text-sm text-on-surface-variant/80">
            Your organization is in the top 15% of peers. You have successfully reduced idle waste and migrated 3 high-intensity workloads to lower-carbon regions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 relative z-10">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider mb-2">Total Carbon Avoided</p>
            <h2 className="text-3xl font-bold text-secondary">{mockStats.carbonAvoided} MT</h2>
            <p className="text-xs text-on-surface-variant mt-1">Equivalent to driving 7,800 miles</p>
          </div>
          <div className="text-center border-l border-r border-white/10">
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider mb-2">Total Cost Saved</p>
            <h2 className="text-3xl font-bold text-on-surface">${mockStats.savingsIdentified.toLocaleString()}</h2>
            <p className="text-xs text-on-surface-variant mt-1">Through right-sizing & automation</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider mb-2">Automated Actions</p>
            <h2 className="text-3xl font-bold text-primary">142</h2>
            <p className="text-xs text-on-surface-variant mt-1">Zero downtime reported</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
          <h3 className="text-lg font-bold text-on-surface">Quarterly Progress</h3>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">
          By continuously right-sizing instances based on the AI demand forecast, your organization has flattened the carbon growth curve even as provisioned capacity increased by 12% to support business growth.
        </p>
        <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex">
          <div className="h-full w-[45%] bg-[#34d399]" title="Clean Energy Usage"></div>
          <div className="h-full w-[35%] bg-primary" title="Offset/Optimized"></div>
          <div className="h-full w-[20%] bg-surface-container-low" title="Remaining Carbon Footprint"></div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-semibold text-on-surface-variant tracking-wider">
          <span>45% Clean Grid</span>
          <span>35% Optimized</span>
          <span>20% Remaining</span>
        </div>
      </div>
    </main>
  );
}
