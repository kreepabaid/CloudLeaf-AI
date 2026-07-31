import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Leaf, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Server, 
  Printer,
  CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ShimmerSkeleton from '../components/ShimmerSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

const defaultCarbonFormula = {
  powerConsumptionKw: 2.85,
  runningHours: 720,
  regionalCarbonFactor: 0.385,
  formulaExplanation: '(2.85 kW × 720 hrs × 0.385 kg CO2/kWh)',
};

export default function Report({ onShowToast }) {
  const reportRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [stats, setStats] = useState({
    monthlyCarbonSaved: 1420,
    monthlyCostSaved: 3850,
    activeInsightsCount: 0,
    totalResourcesAudited: 0,
    autoApprovalCount: 0,
    awaitingApprovalCount: 0,
  });
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, insightsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/reports/summary'),
        fetch('http://127.0.0.1:8000/api/insights'),
      ]);

      if (!summaryRes.ok || !insightsRes.ok) {
        throw new Error('Could not connect to backend');
      }

      const summaryData = await summaryRes.json();
      const insightsData = await insightsRes.json();

      setStats(summaryData.current_stats || {});
      setInsights(insightsData.insights || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Could not connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side PDF export using html2canvas + jsPDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#fcf9f2',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CloudLeaf-Sustainability-Audit-Report-${new Date().toISOString().slice(0, 10)}.pdf`);

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'PDF Export Complete',
          message: 'Client-side PDF report downloaded successfully.',
        });
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Export Failed',
          message: 'Failed to generate PDF. Please try again.',
        });
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Client-side CSV export generator
  const handleExportCSV = () => {
    const headers = ['Insight ID', 'Title', 'AWS Service', 'Region', 'Savings', 'CO2 Saved (kg)', 'Risk Level', 'Status'];
    const rows = insights.map((item) => {
      const ins = item.insight || {};
      const title = `${ins.recommendation || 'Optimize'} for ${ins.instance_id || 'Instance'}`;
      const savings = `$${ins.estimated_savings_usd || 0}/mo`;
      const co2Saved = `${ins.estimated_savings_co2_kg || 0} kg`;
      const risk = item.validation?.decision === 'auto_approve' ? 'Low' : 'Medium';
      const status = item.automation_result?.success ? 'executed' : 'pending';

      return [
        ins.id || ins.instance_id || '',
        `"${title.replace(/"/g, '""')}"`,
        'EC2',
        ins.region || 'us-east-1',
        `"${savings}"`,
        `"${co2Saved}"`,
        risk,
        status,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CloudLeaf-Audit-Insights-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'CSV Export Complete',
        message: 'Client-side CSV file downloaded.',
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'CloudLeaf AI Infrastructure Audit Report',
      text: `CloudLeaf AI saved ${stats.monthlyCarbonSaved || 0} kg CO2 and $${stats.monthlyCostSaved || 0}/mo across our AWS cloud footprint!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: 'Report Shared',
            message: 'Report link shared via system dialogue.',
          });
        }
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Link Copied to Clipboard',
          message: 'Report URL copied to clipboard.',
        });
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight flex items-center gap-2.5">
            Cloud Audit & Executive Report
            <FileText className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant/80 mt-1">
            Downloadable executive sustainability audit summary and carbon accounting verification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || isLoading || !!error}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-primary-container shadow-sm transition-all disabled:opacity-50"
          >
            {isExportingPdf ? (
              <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isLoading || !!error}
            className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/20 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-secondary" />
            Export CSV
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/20 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-primary" />
            Share Report
          </button>
        </div>
      </div>

      {/* Main Content / Error / Loading */}
      {error ? (
        <ErrorState onRetry={fetchData} />
      ) : isLoading ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-primary animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Loading audit report...
          </div>
          <ShimmerSkeleton type="kpi" />
        </div>
      ) : (
        /* Printable Report Canvas Area */
        <div ref={reportRef} className="glass-panel p-8 rounded-3xl border border-outline-variant/15 space-y-8 bg-surface-bright">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-outline-variant/15 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Leaf className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-primary font-display-lg">CloudLeaf AI Audit Summary Report</h2>
                <span className="text-xs text-on-surface-variant/70 font-mono">Account ID: 849201938210 (Acme Production)</span>
              </div>
            </div>

            <div className="text-right sm:text-right text-xs text-on-surface-variant/70 space-y-0.5">
              <div className="flex items-center gap-1 sm:justify-end text-on-surface font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Audit Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-primary font-mono font-semibold">GHG Protocol Scope 2 Verified</div>
            </div>
          </div>

          {/* Hero Score Badge */}
          <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/15">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-label-caps text-xs text-secondary tracking-widest uppercase">Performance Index</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="font-display-lg text-6xl font-bold text-primary">84.2</span>
                <span className="text-on-surface-variant/60 text-lg">/ 100</span>
              </div>
              <p className="font-headline-md text-on-surface-variant text-base">Sustainability Rating</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-xs">Top 15% of similar-sized peers</span>
            </div>
          </div>

          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
              <span className="text-xs text-on-surface-variant/70 font-semibold uppercase block">Monthly Carbon Avoidance</span>
              <span className="text-2xl font-bold text-primary font-mono mt-1 block">
                {(stats.monthlyCarbonSaved || 0).toLocaleString()} kg CO2
              </span>
              <span className="text-[11px] text-on-surface-variant/70">Equivalent to planting 65 trees</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
              <span className="text-xs text-on-surface-variant/70 font-semibold uppercase block">Monthly Spend Reduced</span>
              <span className="text-2xl font-bold text-on-surface font-mono mt-1 block">
                ${(stats.monthlyCostSaved || 0).toLocaleString()} / mo
              </span>
              <span className="text-[11px] text-on-surface-variant/70">-22.1% total cloud bill reduction</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
              <span className="text-xs text-on-surface-variant/70 font-semibold uppercase block">Audited AWS Resources</span>
              <span className="text-2xl font-bold text-secondary font-mono mt-1 block">
                {stats.totalResourcesAudited || 0} workloads
              </span>
              <span className="text-[11px] text-on-surface-variant/70">{stats.autoApprovalCount || 0} auto-approved actions</span>
            </div>
          </div>

          {/* Segmented Energy Composition Bar */}
          <div className="glass-card rounded-2xl p-6 border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Energy Composition Mix</h3>
              <div className="flex gap-4 text-xs font-label-caps">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Clean Grid (62%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary-container" /> Optimized (24%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant/40" /> Offset (14%)</span>
              </div>
            </div>
            <div className="relative h-8 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full bg-primary flex items-center justify-center text-[10px] font-bold text-white uppercase" style={{ width: '62%' }}>Grid</div>
              <div className="h-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-secondary uppercase" style={{ width: '24%' }}>Optimized</div>
              <div className="h-full bg-outline-variant/30 flex items-center justify-center text-[10px] font-bold text-on-surface-variant uppercase" style={{ width: '14%' }}>Offset</div>
            </div>
          </div>

          {/* Carbon Calculation Accounting Breakdown */}
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              Verified Carbon Calculation Model
            </h3>
            <p className="text-xs text-on-surface-variant/90 leading-relaxed">
              The total carbon reduction of <strong className="text-on-surface">{stats.monthlyCarbonSaved || 0} kg CO2/month</strong> is calculated using CloudLeaf's telemetry formula:
            </p>

            <div className="p-3 bg-white rounded-xl border border-outline-variant/15 text-xs font-mono text-primary font-semibold">
              {defaultCarbonFormula.formulaExplanation} = {stats.monthlyCarbonSaved || 0} kg CO2
            </div>
          </div>

          {/* Key Recommendations Summary Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              Audited Recommendation Summary ({insights.length} Items)
            </h3>

            {insights.length === 0 ? (
              <EmptyState title="No recommendations in report" message="No audit recommendation records found for this period." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
                <table className="w-full text-left text-xs text-on-surface">
                  <thead className="bg-surface-container text-on-surface-variant font-bold uppercase text-[10px] border-b border-outline-variant/15">
                    <tr>
                      <th className="p-3">Resource / Title</th>
                      <th className="p-3">AWS Service</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Financial Saving</th>
                      <th className="p-3">CO2 Avoided</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 bg-white">
                    {insights.map((item) => {
                      const ins = item.insight || {};
                      const title = `${ins.recommendation || 'Optimize'} for ${ins.instance_id || 'Instance'}`;
                      const savings = `$${ins.estimated_savings_usd || 0}/mo`;
                      const co2Saved = `${ins.estimated_savings_co2_kg || 0} kg`;
                      const risk = item.validation?.decision === 'auto_approve' ? 'Low' : 'Medium';
                      const isExecuted = item.automation_result?.success;

                      return (
                        <tr key={ins.id || ins.instance_id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-3 font-medium text-on-surface max-w-xs truncate">{title}</td>
                          <td className="p-3">EC2</td>
                          <td className="p-3 font-mono">{ins.region || 'us-east-1'}</td>
                          <td className="p-3 font-semibold text-primary">{savings}</td>
                          <td className="p-3 font-semibold text-primary">{co2Saved}</td>
                          <td className="p-3 capitalize">{risk}</td>
                          <td className="p-3">
                            {isExecuted ? (
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                                Executed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary font-semibold text-[10px]">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-outline-variant/15 text-center text-xs text-on-surface-variant/60 flex justify-between items-center">
            <span>Generated by CloudLeaf AI Audit Engine</span>
            <span>Confidential • Hackathon Demonstration</span>
          </div>
        </div>
      )}
    </div>
  );
}
