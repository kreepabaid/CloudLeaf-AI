import React, { useState, useEffect } from 'react';
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

function mapApiInsightToCard(apiItem) {
  const ins = apiItem.insight || apiItem;
  const val = apiItem.validation || {};
  const isNeedsApprove = val.decision === 'needs_approval';
  const isHighRisk = ins.tags?.critical === true || ins.risk === 'high';

  return {
    id: ins.id || ins.instance_id,
    title: ins.recommendation ? `${ins.recommendation} (${ins.instance_id})` : (ins.title || `Optimize ${ins.instance_id}`),
    resourceId: ins.instance_id || ins.resourceId || 'i-unknown',
    awsService: ins.awsService || 'EC2',
    region: ins.region || 'us-east-1',
    category: ins.type === 'idle' ? 'Zombie Cleanup' : ins.type === 'over-provisioned' ? 'Right-sizing' : (ins.category || 'Optimization'),
    savings: ins.estimated_savings_usd ? `$${ins.estimated_savings_usd}/mo` : (ins.savings || '$25/mo'),
    co2Saved: ins.estimated_savings_usd ? `${Math.round(ins.estimated_savings_usd * 4.2)} kg CO2/mo` : (ins.co2Saved || '105 kg CO2/mo'),
    impact: ins.impact || (ins.confidence > 80 ? 'High' : 'Medium'),
    risk: isHighRisk ? 'high' : (ins.risk || 'low'),
    requiresApproval: isNeedsApprove,
    isCritical: isHighRisk,
    reasoning: val.reason || ins.reasoning || `CloudWatch metrics show CPU avg of ${ins.cpu_avg_7d}%. Recommending ${ins.recommendation}.`,
    status: apiItem.automation_result?.status === 'success' ? 'executed' : (ins.status || 'pending'),
    createdAt: ins.createdAt || 'Just now',
  };
}

export default function ActionCenter({ onShowToast }) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [executingId, setExecutingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high_risk' | 'auto_approved' | 'awaiting' | 'executed'
  const [validatingInsight, setValidatingInsight] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/insights');
      if (!res.ok) {
        throw new Error('Could not connect to backend');
      }
      const data = await res.json();
      const rawList = data.insights || [];
      setInsights(rawList.map(mapApiInsightToCard));
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Could not connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // Filter logic
  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'high_risk') return item.risk?.toLowerCase() === 'high' || item.isCritical;
    if (activeFilter === 'auto_approved') return !item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'awaiting') return item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'executed') return item.status === 'executed';
    // 'all' pending items default
    return item.status === 'pending';
  });

  // Handle Approve button click
  const handleApprove = async (insight) => {
    setActionError(null);
    setExecutingId(insight.id);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/actions/${insight.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_approve: true }),
      });

      if (!res.ok) {
        throw new Error(`Failed to approve action for ${insight.id}`);
      }

      // Remove insight from displayed list on success
      setInsights((prev) => prev.filter((item) => item.id !== insight.id));

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: `Action Executed: ${insight.awsService}`,
          message: `Successfully executed optimization for ${insight.resourceId}.`,
        });
      }
    } catch (err) {
      console.error('Approve POST error:', err);
      setActionError(`Failed to approve recommendation for ${insight.resourceId || insight.id}`);
    } finally {
      setExecutingId(null);
    }
  };

  // Handle Dismiss action
  const handleDismiss = async (id) => {
    setActionError(null);
    setExecutingId(id);
    const item = insights.find((i) => i.id === id);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/actions/${id}/dismiss`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Failed to dismiss recommendation ${id}`);
      }

      // Remove insight from displayed list on success
      setInsights((prev) => prev.filter((i) => i.id !== id));

      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Recommendation Dismissed',
          message: `Dismissed recommendation ${item?.resourceId || id}.`,
        });
      }
    } catch (err) {
      console.error('Dismiss POST error:', err);
      setActionError(`Failed to dismiss recommendation ${item?.resourceId || id}`);
    } finally {
      setExecutingId(null);
    }
  };

  // Reset queue button (refetch from API)
  const handleResetQueue = () => {
    fetchInsights();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Queue Refreshed',
        message: 'Refreshed recommendations from backend API.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Validation Animation Modal Overlay */}
      {validatingInsight && (
        <ValidationModal
          insight={validatingInsight}
          onComplete={() => setValidatingInsight(null)}
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
          Refresh Recommendations
        </button>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button 
            onClick={() => setActionError(null)}
            className="text-xs underline hover:text-error/80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main fetch error banner */}
      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-semibold flex items-center justify-between">
          <span>Could not connect to backend</span>
          <span className="text-xs text-error/80 font-normal">Check FastAPI server at http://127.0.0.1:8000</span>
        </div>
      )}

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

      {/* Insights List / Loading / Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-primary animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Loading...
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShimmerSkeleton />
            <ShimmerSkeleton />
          </div>
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
              isExecuting={executingId === insight.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
