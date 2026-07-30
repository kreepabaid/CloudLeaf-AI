import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { forecastData } from '../data/mockData';

export default function Dashboard() {
  return (
    <main className="pt-8 px-4 flex flex-col gap-6 pb-20" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Welcome Section */}
      <section>
        <h1 className="text-2xl font-bold text-on-surface">Digital Tranquility</h1>
        <p className="text-sm text-on-surface-variant">Your cloud ecosystem is optimized and thriving.</p>
      </section>

      {/* KPI Cards */}
      <section className="flex flex-wrap gap-4">
        {/* Card 1: Cost */}
        <div className="glass-card flex-1 min-w-[240px] p-6 rounded-xl flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">payments</span>
            </div>
            <span className="text-primary-container font-medium flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-full text-sm">
              <span className="material-symbols-outlined text-xs">trending_down</span>
              4.2%
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Cost Run-Rate</p>
            <h2 className="text-3xl font-bold text-on-surface mt-1">$12.4k<span className="text-on-surface-variant text-sm font-normal">/mo</span></h2>
          </div>
        </div>

        {/* Card 2: Carbon */}
        <div className="glass-card flex-1 min-w-[240px] p-6 rounded-xl flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">eco</span>
            </div>
            <span className="text-secondary font-medium flex items-center gap-1 bg-secondary/5 px-2 py-0.5 rounded-full text-sm">
              <span className="material-symbols-outlined text-xs">trending_down</span>
              2.1%
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Carbon Footprint</p>
            <h2 className="text-3xl font-bold text-on-surface mt-1">2.1t<span className="text-on-surface-variant text-sm font-normal"> CO2e</span></h2>
          </div>
        </div>
      </section>

      {/* Main Chart Section */}
      <section className="glass-card rounded-2xl p-6 overflow-hidden relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Capacity Forecast</h3>
            <p className="text-sm text-on-surface-variant">Efficiency vs Demand</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Capacity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Demand</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0566d9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0566d9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="#bbcabf" tick={{ fill: '#bbcabf', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#bbcabf" tick={{ fill: '#bbcabf', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#161d19', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#dde4dd' }}
              />
              <ReferenceLine x="Wed" stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#f59e0b', fontSize: 12 }} />
              
              <Area type="monotone" dataKey="capacity" stroke="#10b981" fillOpacity={1} fill="url(#colorCapacity)" strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" stroke="#0566d9" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" stroke="#dde4dd" fill="none" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Active Insights Feed */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Active Insights</h3>
          <button className="text-primary text-sm font-semibold flex items-center gap-1">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Insight 1 */}
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary-container">
          <div className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">memory</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-on-surface">Idle EC2 Instance Detected</h4>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">98% Conf.</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-3">i-0a12b34c56 has had 0% CPU utilization for 7 days.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary-container text-sm">savings</span>
                  <span className="text-primary-container font-medium text-sm">$420/mo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm">cloud_done</span>
                  <span className="text-secondary font-medium text-sm">0.2t CO2e</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Insight 2 */}
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-secondary">
          <div className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-2xl">database</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-on-surface">RDS Over-provisioned</h4>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase">92% Conf.</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-3">Production DB is running on db.m5.4xlarge but peak load only requires 2xlarge.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary-container text-sm">savings</span>
                  <span className="text-primary-container font-medium text-sm">$150/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
