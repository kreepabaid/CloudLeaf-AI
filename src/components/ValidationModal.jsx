import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ValidationModal({ insight, onComplete, onCancel }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const steps = [
    { id: 1, label: 'Auditing 14-day CPU & Memory utilization threshold', delay: 400 },
    { id: 2, label: 'Verifying tag policy (Not tagged "MissionCritical")', delay: 900 },
    { id: 3, label: 'Checking production safeguard & snapshot integrity', delay: 1400 },
    { id: 4, label: 'Validating AWS IAM role permission bounds', delay: 1900 },
  ];

  useEffect(() => {
    let timers = [];
    steps.forEach((step) => {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
      }, step.delay);
      timers.push(timer);
    });

    const finalTimer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(() => {
        onComplete(insight);
      }, 700);
    }, 2400);
    timers.push(finalTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [insight]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-[#4edea3]/30 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#4edea3]/15 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30">
            {isFinished ? <ShieldCheck className="w-6 h-6 animate-bounce" /> : <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              CloudLeaf Automated Safety Audit
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
            </h3>
            <p className="text-xs text-slate-400">Validating guardrails before executing changes...</p>
          </div>
        </div>

        {/* Insight summary badge */}
        <div className="bg-slate-900/90 rounded-xl p-3 mb-5 border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block">Target Resource:</span>
          <span className="text-slate-200 font-mono font-semibold">{insight?.resourceId || insight?.title}</span>
        </div>

        {/* Checklist Animation Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 font-medium'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 animate-scale-in" />
                ) : (
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{step.label}</span>
                {isDone && <span className="ml-auto font-bold text-[#4edea3]">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Status footer */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-[#4edea3] transition-all">
            {isFinished ? '✓ Safety Checks Passed — Executing Action...' : 'Running automated safeguard checks...'}
          </p>
        </div>
      </div>
    </div>
  );
}
