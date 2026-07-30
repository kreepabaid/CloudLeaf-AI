import React, { useState } from 'react';
import { 
  Zap, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  Inbox
} from 'lucide-react';
import InsightCard from '../components/InsightCard';
import ValidationModal from '../components/ValidationModal';
import ShimmerSkeleton from '../components/ShimmerSkeleton';
import { mockInsights } from '../data/mockData';

export default function ActionCenter({ onShowToast }) {
  const [insights, setInsights] = useState(mockInsights);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high_risk' | 'auto_approved' | 'awaiting' | 'executed'
  const [validatingInsight, setValidatingInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter logic
  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'high_risk') return item.risk?.toLowerCase() === 'high' || item.isCritical;
    if (activeFilter === 'auto_approved') return !item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'awaiting') return item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'executed') return item.status === 'executed';
    // 'all' pending items default
    return item.status === 'pending';
  });

  // Handle Approve button click -> Triggers Task 2 ValidationModal animation
  const handleApprove = (insight) => {
    setValidatingInsight(insight);
  };

  // Called when ValidationModal finishes sequential checkmarks
  const handleValidationComplete = (insight) => {
    setValidatingInsight(null);

    // Move insight to executed status
    setInsights((prev) =>
      prev.map((item) =>
        item.id === insight.id
          ? { ...item, status: 'executed', executedAt: 'Just now' }
          : item
      )
    );

    // Trigger Toast confirmation
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: `Action Executed: ${insight.awsService}`,
        message: `Successfully executed optimization for ${insight.resourceId}. Saved ${insight.savings} & ${insight.co2Saved}. Risk level: ${insight.risk.toUpperCase()}.`,
      });
    }
  };

  // Handle Dismiss action
  const handleDismiss = (id) => {
    const item = insights.find((i) => i.id === id);
    setInsights((prev) => prev.filter((i) => i.id !== id));

    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Recommendation Dismissed',
        message: `Dismissed recommendation ${item?.resourceId || id}.`,
      });
    }
  };

  // Reset queue button
  const handleResetQueue = () => {
    setInsights(mockInsights);
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Queue Reset',
        message: 'Restored original hackathon mock recommendations queue.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Validation Animation Modal Overlay */}
      {validatingInsight && (
        <ValidationModal
          insight={validatingInsight}
          onComplete={handleValidationComplete}
          onCancel={() => setValidatingInsight(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight flex items-center gap-2.5">
            Cloud Optimization Action Center
            <Zap className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant/80 mt-1">
            Review, validate, and execute Bedrock AI recommendations across AWS EC2, RDS, S3, and EKS.
          </p>
        </div>

        <button
          onClick={handleResetQueue}
          className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface-variant border border-outline-variant/20 transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Queue
        </button>
      </div>

      {/* Filter Tabs Header Bar */}
      <div className="flex items-center gap-2 bg-surface-container-low/60 p-1.5 rounded-2xl border border-outline-variant/15 overflow-x-auto">
        <span className="text-xs font-bold text-on-surface-variant/70 px-3 flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-primary" /> Filter Queue:
        </span>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
              : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          Pending Queue ({insights.filter((i) => i.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveFilter('auto_approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'auto_approved'
              ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
              : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          ⚡ Auto-Approved ({insights.filter((i) => !i.requiresApproval && i.status !== 'executed').length})
        </button>

        <button
          onClick={() => setActiveFilter('awaiting')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'awaiting'
              ? 'bg-white text-secondary border border-outline-variant/20 shadow-sm'
              : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          Awaiting Approval ({insights.filter((i) => i.requiresApproval && i.status !== 'executed').length})
        </button>

        <button
          onClick={() => setActiveFilter('high_risk')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'high_risk'
              ? 'bg-white text-error border border-outline-variant/20 shadow-sm'
              : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-error" />
          High Risk / Locked ({insights.filter((i) => i.risk?.toLowerCase() === 'high' || i.isCritical).length})
        </button>

        <button
          onClick={() => setActiveFilter('executed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'executed'
              ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
              : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          Recently Executed ({insights.filter((i) => i.status === 'executed').length})
        </button>
      </div>

      {/* Insights List / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShimmerSkeleton />
          <ShimmerSkeleton />
        </div>
      ) : filteredInsights.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-2xl text-center border border-outline-variant/15 my-8">
          <div className="p-4 rounded-full bg-surface-container border border-outline-variant/15 w-16 h-16 mx-auto mb-4 flex items-center justify-center text-primary">
            <Inbox className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Queue Empty for Selected Filter</h3>
          <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto mb-6">
            There are currently no items matching "{activeFilter}". All recommendations in this view have either been executed, dismissed, or cleared.
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-colors inline-flex items-center gap-2 hover:bg-primary-container"
          >
            View All Pending Queue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              isExecuting={validatingInsight?.id === insight.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
