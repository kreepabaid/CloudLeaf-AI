import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Lock, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Leaf, 
  Sparkles,
  Server,
  AlertTriangle
} from 'lucide-react';

export default function InsightCard({ insight, onApprove, onDismiss, isExecuting }) {
  const [showReasoning, setShowReasoning] = useState(true);

  // Risk styling mappings
  const riskBadgeConfig = {
    low: {
      bg: 'bg-primary/10 text-primary border-primary/20',
      label: 'Risk: Low',
      icon: ShieldCheck,
    },
    medium: {
      bg: 'bg-secondary-container/30 text-secondary border-secondary/20',
      label: 'Risk: Medium',
      icon: ShieldAlert,
    },
    high: {
      bg: 'bg-error-container/30 text-error border-error/20',
      label: 'Risk: High',
      icon: ShieldAlert,
    },
  };

  const currentRisk = riskBadgeConfig[insight.risk?.toLowerCase()] || riskBadgeConfig.low;
  const RiskIcon = currentRisk.icon;

  const isCritical = insight.isCritical || insight.tags?.critical;

  return (
    <div className="glass-card hover-lift p-6 rounded-2xl border border-outline-variant/15 relative overflow-hidden transition-all duration-300">
      {/* Top Header Row: Service Badge, Risk Badge, Approval Status Chip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface-variant border border-outline-variant/15 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-secondary" />
            {insight.awsService || 'AWS'} • {insight.region}
          </span>
          <span className="text-xs text-on-surface-variant/70 font-medium px-2 py-0.5 rounded bg-surface-container border border-outline-variant/10">
            {insight.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Risk Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${currentRisk.bg}`}>
            <RiskIcon className="w-3.5 h-3.5" />
            {currentRisk.label}
          </span>

          {/* Real Backend Decision Chip */}
          {insight.decision === 'rejected' || insight.status === 'rejected' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-error" />
              Rejected
            </span>
          ) : insight.decision === 'needs_approval' || insight.status === 'needs_approval' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Needs Approval
            </span>
          ) : insight.requiresApproval ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Awaiting Approval
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              ⚡ Auto-Approved
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Resource ID */}
      <h3 className="text-lg font-bold text-on-surface leading-snug mb-1 group-hover:text-primary transition-colors">
        {insight.title}
      </h3>
      <p className="text-xs text-on-surface-variant/70 font-mono mb-4">
        Resource ID: <span className="text-on-surface-variant">{insight.resourceId || insight.instance_id}</span>
      </p>

      {/* Reasoning Section ("Why" Line & Tooltip) */}
      <div className="mb-4 bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/10">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:text-primary-container transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI Reasoning & Safety Audit</span>
            <div className="group/why relative inline-block">
              <HelpCircle className="w-3.5 h-3.5 text-on-surface-variant hover:text-on-surface" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/why:block w-64 p-2 bg-surface text-[11px] text-on-surface rounded-lg border border-outline-variant shadow-xl z-20 pointer-events-none">
                Evaluated by CloudLeaf AI validator against workload safety tag policies.
              </div>
            </div>
          </div>
          {showReasoning ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
        </button>

        {showReasoning && (
          <p className="mt-2 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-2 font-sans">
            <strong className="text-primary">Why: </strong>
            {insight.reasoning}
          </p>
        )}
      </div>

      {/* Metrics Row: Cost Saved & Carbon Saved */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-on-surface-variant/70 block font-medium">Est. Financial Savings</span>
            <span className="text-base font-bold text-on-surface">{insight.savings}</span>
          </div>
        </div>

        <div className="bg-primary-container/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-on-surface-variant/70 block font-medium">Est. Carbon Reduction</span>
            <span className="text-base font-bold text-primary">{insight.co2Saved}</span>
          </div>
        </div>
      </div>

      {/* Action Outcome Row / Buttons */}
      {insight.status === 'executed' || insight.decision === 'auto_approve' ? (
        <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span>Auto-approved ✓ • {insight.automation_result?.message || `Executed optimization on ${insight.resourceId || insight.instance_id}`}</span>
        </div>
      ) : insight.status === 'rejected' || insight.decision === 'rejected' ? (
        <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-error shrink-0" />
          <span>Rejected ✗ • {insight.validationReason || 'Instance is tagged as critical — automated action is blocked.'}</span>
        </div>
      ) : insight.status === 'needs_approval' || insight.decision === 'needs_approval' ? (
        <div className="bg-secondary-container/20 border border-secondary/20 text-secondary p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-secondary shrink-0" />
          <span>Needs Approval ⏳ • {insight.validationReason || 'Instance is in production — manual approval required.'}</span>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/10">
          <button
            onClick={() => onDismiss && onDismiss(insight.id || insight.insight_id)}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Dismiss
          </button>

          <button
            onClick={() => onApprove && onApprove(insight)}
            disabled={isExecuting}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              isCritical
                ? 'bg-error/10 text-error border border-error/30 hover:bg-error/20'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-lg shadow-primary/20 active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Validating with API...
              </>
            ) : isCritical ? (
              <>
                <Lock className="w-4 h-4 text-error" />
                Test Critical Approval
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Approve Optimization
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
