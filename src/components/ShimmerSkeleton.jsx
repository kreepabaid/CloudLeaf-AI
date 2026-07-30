import React from 'react';

export default function ShimmerSkeleton({ type = 'card' }) {
  if (type === 'kpi') {
    return (
      <div className="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden">
        <div className="h-4 w-24 bg-slate-800 rounded shimmer" />
        <div className="h-8 w-32 bg-slate-800 rounded shimmer" />
        <div className="h-3 w-40 bg-slate-800 rounded shimmer" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-40 bg-slate-800 rounded shimmer" />
          <div className="h-8 w-48 bg-slate-800 rounded shimmer" />
        </div>
        <div className="h-52 w-full bg-slate-900/60 rounded-xl shimmer" />
      </div>
    );
  }

  // Default insight card skeleton
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 bg-slate-800 rounded-lg shimmer" />
        <div className="h-6 w-24 bg-slate-800 rounded-full shimmer" />
      </div>
      <div className="h-6 w-3/4 bg-slate-800 rounded shimmer" />
      <div className="h-16 w-full bg-slate-900/80 rounded-xl shimmer" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-slate-800 rounded-xl shimmer" />
        <div className="h-14 bg-slate-800 rounded-xl shimmer" />
      </div>
    </div>
  );
}
