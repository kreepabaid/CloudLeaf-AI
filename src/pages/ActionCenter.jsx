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
import { mockInsights } from '../data/mockData';

const API_BASE = 'http://localhost:8000/api';

export default function ActionCenter({ onShowToast }) {
  const [insights, setInsights] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high_risk' | 'auto_approved' | 'awaiting' | 'executed'
  const [validatingInsight, setValidatingInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize items returned by GET /api/insights into card format
  const normalizeInsight = (item) => {
    const ins = item.insight || item;
    const val = item.validation || {};
    const autoRes = item.automation_result || null;
    const id = ins.insight_id || ins.id || ins.instance_id;

    return {
      id: id,
      insight_id: id,
      instance_id: ins.instance_id || id,
      title: ins.title || (ins.type === 'idle' ? `Stop Idle Instance (${ins.instance_id || id})` : `Downsize Instance (${ins.instance_id || id})`),
      resourceId: ins.instance_id || id,
      awsService: ins.awsService || 'EC2',
      region: ins.region || 'us-east-1',
      category: ins.category || (ins.type === 'idle' ? 'Idle Cleanup' : 'Right-sizing'),
      savings: ins.savings || (ins.estimated_savings_usd ? `$${ins.estimated_savings_usd}/mo` : '$45/mo'),
      co2Saved: ins.co2Saved || '25 kg CO2/mo',
      risk: ins.risk || ins.risk_level || (ins.tags?.critical ? 'high' : ins.tags?.env === 'prod' ? 'medium' : 'low'),
      requiresApproval: ins.requiresApproval ?? (ins.tags?.env === 'prod'),
      isCritical: ins.isCritical ?? (ins.tags?.critical || false),
      reasoning: ins.reasoning || ins.recommendation || 'Evaluated by CloudLeaf AI validator.',
      status: ins.status || (val.decision === 'auto_approve' && autoRes ? 'executed' : (val.decision === 'rejected' ? 'rejected' : 'pending')),
      decision: val.decision,
      validationReason: val.reason,
      automation_result: autoRes,
      executedAt: autoRes ? 'Just now' : null,
      tags: ins.tags || { env: 'dev', critical: false }
    };
  };

  // Fetch insights from backend API on mount
  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/insights`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const rawList = data.insights || (Array.isArray(data) ? data : []);
      
      // Combine API insights with sample mock insights for a comprehensive demo queue
      const normalizedApi = rawList.map(normalizeInsight);
      const apiIds = new Set(normalizedApi.map(i => i.id));
      const normalizedMock = mockInsights
        .filter(m => !apiIds.has(m.id))
        .map(normalizeInsight);

      setInsights([...normalizedApi, ...normalizedMock]);
    } catch (err) {
      console.warn('Backend API connection failed, using local demo recommendations queue:', err);
      setInsights(mockInsights.map(normalizeInsight));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'high_risk') return item.risk?.toLowerCase() === 'high' || item.isCritical;
    if (activeFilter === 'auto_approved') return !item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'awaiting') return item.requiresApproval && item.status !== 'executed';
    if (activeFilter === 'executed') return item.status === 'executed';
    // 'all' pending items default
    return item.status === 'pending' || item.status === 'executed' || item.status === 'rejected';
  });

  // Handle Approve button click -> Triggers ValidationModal animation
  const handleApprove = (insight) => {
    setValidatingInsight(insight);
  };

  // Called when ValidationModal finishes safety audit checks
  const handleValidationComplete = async (insight) => {
    setValidatingInsight(null);

    const insightId = insight.insight_id || insight.id;
    try {
      const response = await fetch(`${API_BASE}/actions/${insightId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_approve: false })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const resData = await response.json();

      const validation = resData.validation || {};
      const decision = validation.decision;
      const reason = validation.reason;
      const autoRes = resData.automation_result;

      if (decision === 'auto_approve') {
        setInsights((prev) =>
          prev.map((item) =>
            item.id === insight.id
              ? {
                  ...item,
                  status: 'executed',
                  decision: 'auto_approve',
                  validationReason: reason,
                  automation_result: autoRes,
                  executedAt: 'Just now'
                }
              : item
          )
        );

        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: `Action Executed: ${insight.awsService || 'EC2'}`,
            message: autoRes?.message || `Successfully executed optimization for ${insight.resourceId}. Saved ${insight.savings}.`,
          });
        }
      } else if (decision === 'rejected') {
        setInsights((prev) =>
          prev.map((item) =>
            item.id === insight.id
              ? {
                  ...item,
                  status: 'rejected',
                  decision: 'rejected',
                  validationReason: reason,
                  automation_result: null
                }
              : item
          )
        );

        if (onShowToast) {
          onShowToast({
            type: 'error',
            title: 'Action Rejected by AI Safety Engine',
            message: reason || 'Instance is tagged as critical — automated action is blocked.',
          });
        }
      } else {
        setInsights((prev) =>
          prev.map((item) =>
            item.id === insight.id
              ? {
                  ...item,
                  status: 'needs_approval',
                  decision: decision || 'needs_approval',
                  validationReason: reason,
                  automation_result: null
                }
              : item
          )
        );

        if (onShowToast) {
          onShowToast({
            type: 'warning',
            title: 'Manual Ops Sign-Off Required',
            message: reason || 'Instance is in production — manual approval required.',
          });
        }
      }
    } catch (err) {
      console.error('Failed to post approve action to backend:', err);
      // Fallback local behavior if backend server unreachable
      setInsights((prev) =>
        prev.map((item) =>
          item.id === insight.id
            ? { ...item, status: 'executed', executedAt: 'Just now' }
            : item
        )
      );
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: `Action Processed (${insight.awsService})`,
          message: `Processed optimization for ${insight.resourceId}. Saved ${insight.savings}.`,
        });
      }
    }
  };

  // Handle Dismiss action
  const handleDismiss = async (id) => {
    const item = insights.find((i) => i.id === id);
    try {
      await fetch(`${API_BASE}/actions/${id}/dismiss`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend dismiss endpoint unreachable:', e);
    }

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
    fetchInsights();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Queue Reset',
        message: 'Re-fetched recommendations queue from API.',
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
          Queue Overview ({insights.length})
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
          High Risk / Critical ({insights.filter((i) => i.risk?.toLowerCase() === 'high' || i.isCritical).length})
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
          Recently Actioned ({insights.filter((i) => i.status === 'executed' || i.status === 'rejected').length})
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
            View All Recommendations
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
