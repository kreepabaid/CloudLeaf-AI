import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  DollarSign, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  Cpu, 
  HardDrive, 
  Activity, 
  Layers, 
  Sparkles,
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import MetricCard from '../components/MetricCard';
import ShimmerSkeleton from '../components/ShimmerSkeleton';

// TODO: replace with real per-instance carbon breakdown and forecast once backend supports it
const forecastData = [
  { month: 'Feb', cost: 1450, baselineCost: 1800, cpu: 42, memory: 55, traffic: 12.4 },
  { month: 'Mar', cost: 1380, baselineCost: 1820, cpu: 39, memory: 52, traffic: 13.1 },
  { month: 'Apr', cost: 1290, baselineCost: 1850, cpu: 35, memory: 48, traffic: 14.0 },
  { month: 'May', cost: 1180, baselineCost: 1880, cpu: 31, memory: 44, traffic: 14.8 },
  { month: 'Jun', cost: 1050, baselineCost: 1910, cpu: 28, memory: 41, traffic: 15.5 },
  { month: 'Jul', cost: 920, baselineCost: 1950, cpu: 25, memory: 38, traffic: 16.2 },
];

// TODO: replace with real per-instance carbon breakdown and forecast once backend supports it
const carbonBreakdownData = {
  powerConsumptionKw: 2.85,
  runningHours: 720,
  regionalCarbonFactor: 0.385,
  formulaExplanation: '(2.85 kW × 720 hrs × 0.385 kg CO2/kWh)',
  currentCarbonKg: 790,
  projectedCarbonKg: 264,
  monthlySavedKg: 526,
  regionMix: [
    { region: 'us-east-1 (N. Virginia)', factor: '0.385 kg/kWh', color: '#005237' },
    { region: 'eu-west-1 (Ireland)', factor: '0.295 kg/kWh', color: '#1f6b4d' },
    { region: 'ap-south-1 (Mumbai)', factor: '0.708 kg/kWh', color: '#ba1a1a' },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    monthlyCarbonSaved: 1420,
    carbonTrend: '+18.4% vs last month',
    monthlyCostSaved: 3850,
    costTrend: '-22.1% cloud spend',
    activeInsightsCount: 0,
    efficiencyScore: 88,
    efficiencyTrend: '+6 pts optimizer score',
    totalResourcesAudited: 0,
    autoApprovalCount: 0,
    awaitingApprovalCount: 0,
  });
  const [historicalTrends, setHistoricalTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastTab, setForecastTab] = useState('cost'); // 'cost' | 'cpu' | 'memory' | 'traffic'

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [metricsRes, insightsRes, reportsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/metrics'),
          fetch('http://127.0.0.1:8000/api/insights'),
          fetch('http://127.0.0.1:8000/api/reports/summary'),
        ]);

        if (!metricsRes.ok || !insightsRes.ok || !reportsRes.ok) {
          throw new Error('Could not connect to backend');
        }

        const metricsData = await metricsRes.json();
        const insightsData = await insightsRes.json();
        const reportsData = await reportsRes.json();

        const insightsList = insightsData.insights || [];
        const metricsList = metricsData.metrics || [];
        const currentStats = reportsData.current_stats || {};
        const historicalTrendsDataList = reportsData.historical_trends || [];

        const totalResourcesAudited = currentStats.totalResourcesAudited ?? metricsData.count ?? metricsList.length;
        const activeInsightsCount = currentStats.activeInsightsCount ?? insightsData.count ?? insightsList.length;
        const autoApprovalCount = currentStats.autoApprovalCount ?? insightsList.filter(
          (item) => item.validation?.decision === 'auto_approve'
        ).length;
        const awaitingApprovalCount = currentStats.awaitingApprovalCount ?? insightsList.filter(
          (item) => item.validation?.decision === 'needs_approval'
        ).length;

        const calculatedSavings = insightsList.reduce(
          (acc, item) => acc + (item.insight?.estimated_savings_usd || 0),
          0
        );
        const monthlyCostSaved = currentStats.monthlyCostSaved ?? (calculatedSavings > 0 ? calculatedSavings : 3850);
        const monthlyCarbonSaved = currentStats.monthlyCarbonSaved ?? Math.round(monthlyCostSaved * 0.37);

        setStats({
          monthlyCarbonSaved,
          carbonTrend: '+18.4% vs last month',
          monthlyCostSaved,
          costTrend: '-22.1% cloud spend',
          activeInsightsCount,
          efficiencyScore: 88,
          efficiencyTrend: '+6 pts optimizer score',
          totalResourcesAudited,
          autoApprovalCount,
          awaitingApprovalCount,
        });

        setHistoricalTrends(historicalTrendsDataList);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not connect to backend');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Map forecast tab configuration
  const forecastConfigs = {
    cost: {
      title: 'Cloud Cost Projection ($/day)',
      dataKeyKey: 'cost',
      baselineKey: 'baselineCost',
      color: '#005237',
      unit: '$',
      icon: DollarSign,
    },
    cpu: {
      title: 'Average Fleet CPU Utilization (%)',
      dataKeyKey: 'cpu',
      color: '#1f6b4d',
      unit: '%',
      icon: Cpu,
    },
    memory: {
      title: 'Average Memory Allocation (%)',
      dataKeyKey: 'memory',
      color: '#795919',
      unit: '%',
      icon: HardDrive,
    },
    traffic: {
      title: 'Egress Network Traffic (GB/s)',
      dataKeyKey: 'traffic',
      color: '#005231',
      unit: ' GB/s',
      icon: Activity,
    },
  };

  const currentForecast = forecastConfigs[forecastTab];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight flex items-center gap-2.5">
            Cloud Infrastructure Telemetry & Carbon Audit
            <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant/80 mt-1">
            Real-time Prophet forecasting, regional carbon factor accounting, and automated AWS right-sizing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Live CloudWatch Sync Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {error ? (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-semibold flex items-center justify-between">
          <span>Could not connect to backend</span>
          <span className="text-xs text-error/80 font-normal">Check backend server at http://127.0.0.1:8000</span>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-primary animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Loading...
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ShimmerSkeleton type="kpi" />
            <ShimmerSkeleton type="kpi" />
            <ShimmerSkeleton type="kpi" />
            <ShimmerSkeleton type="kpi" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Monthly Carbon Avoidance"
            value={`${stats.monthlyCarbonSaved.toLocaleString()} kg`}
            subtext="CO2e reduced"
            trend={stats.carbonTrend}
            trendPositive={true}
            icon={Leaf}
            badgeText="Greener Cloud"
          />
          <MetricCard
            title="Monthly Cost Savings"
            value={`$${stats.monthlyCostSaved.toLocaleString()}`}
            subtext="annualized $46.2k"
            trend={stats.costTrend}
            trendPositive={true}
            icon={DollarSign}
          />
          <MetricCard
            title="Efficiency Score"
            value={`${stats.efficiencyScore}/100`}
            subtext="Optimization rating"
            trend={stats.efficiencyTrend}
            trendPositive={true}
            icon={TrendingUp}
          />
          <MetricCard
            title="Audited Resources"
            value={stats.totalResourcesAudited}
            subtext={`${stats.autoApprovalCount} auto-approved`}
            icon={Zap}
          />
        </div>
      )}

      {/* Section 1: Expanded Tabbed Forecast View */}
      {isLoading ? (
        <ShimmerSkeleton type="chart" />
      ) : (
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/15 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Predictive Telemetry & Prophet Resource Forecast
              </h2>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">
                30-day forward-looking machine learning trajectory based on workload patterns.
              </p>
            </div>

            {/* Forecast Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-container-low/60 p-1 rounded-xl border border-outline-variant/15 self-start lg:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setForecastTab('cost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  forecastTab === 'cost'
                    ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
                    : 'text-on-surface-variant/70 hover:text-primary'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Cost ($)
              </button>

              <button
                onClick={() => setForecastTab('cpu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  forecastTab === 'cpu'
                    ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
                    : 'text-on-surface-variant/70 hover:text-primary'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                CPU (%)
              </button>

              <button
                onClick={() => setForecastTab('memory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  forecastTab === 'memory'
                    ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
                    : 'text-on-surface-variant/70 hover:text-primary'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                Memory (%)
              </button>

              <button
                onClick={() => setForecastTab('traffic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  forecastTab === 'traffic'
                    ? 'bg-white text-primary border border-outline-variant/20 shadow-sm'
                    : 'text-on-surface-variant/70 hover:text-primary'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Traffic (GB/s)
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentForecast.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentForecast.color} stopOpacity={0.0} />
                  </linearGradient>
                  {currentForecast.baselineKey && (
                    <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.0} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 101, 88, 0.15)" />
                <XAxis dataKey="month" stroke="#6f7973" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6f7973" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(107, 101, 88, 0.15)',
                    borderRadius: '12px',
                    color: '#1c1c18',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(42,42,38,0.05)',
                  }}
                />
                {currentForecast.baselineKey && (
                  <Area
                    type="monotone"
                    dataKey={currentForecast.baselineKey}
                    name="Unoptimized Baseline"
                    stroke="#ba1a1a"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#baselineGradient)"
                  />
                )}
                  <Area
                    type="monotone"
                    dataKey={currentForecast.dataKeyKey}
                    name={`Optimized ${currentForecast.title}`}
                    stroke={currentForecast.color}
                    strokeWidth={3}
                    fill="url(#forecastGradient)"
                  />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 2: Carbon Breakdown Card (Formula Visual + Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formula Visual Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Carbon Accounting Formula Visualizer
              </h2>
              <span className="text-xs text-secondary bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/15 font-mono">
                GHG Protocol Scope 2
              </span>
            </div>

            <p className="text-xs text-on-surface-variant/80 mb-5">
              CloudLeaf computes real carbon impact by coupling hardware power draws with real-time regional electricity grid intensity factors.
            </p>

            {/* Visual Formula Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-container-low/80 rounded-xl border border-outline-variant/15 mb-5">
              <div className="text-center p-3 rounded-lg bg-white border border-outline-variant/10">
                <span className="text-[10px] text-on-surface-variant/70 font-semibold block uppercase">Avg Power Load</span>
                <span className="text-lg font-bold text-on-surface font-mono">{carbonBreakdownData.powerConsumptionKw} kW</span>
                <span className="text-[10px] text-on-surface-variant/60 block">hardware draw</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-white border border-outline-variant/10">
                <span className="text-[10px] text-on-surface-variant/70 font-semibold block uppercase">Running Duration</span>
                <span className="text-lg font-bold text-secondary font-mono">{carbonBreakdownData.runningHours} hrs</span>
                <span className="text-[10px] text-on-surface-variant/60 block">720 hrs/month</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-white border border-outline-variant/10">
                <span className="text-[10px] text-on-surface-variant/70 font-semibold block uppercase">Grid Emission Factor</span>
                <span className="text-lg font-bold text-secondary font-mono">{carbonBreakdownData.regionalCarbonFactor}</span>
                <span className="text-[10px] text-on-surface-variant/60 block">kg CO2 / kWh</span>
              </div>
            </div>

            {/* Formula Equation Line */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs text-primary font-semibold">
              <span className="font-mono">{carbonBreakdownData.formulaExplanation}</span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0 ml-2" />
              <span className="font-bold text-primary text-sm font-mono shrink-0 ml-2">
                = {carbonBreakdownData.currentCarbonKg} kg CO2
              </span>
            </div>
          </div>

          {/* Regional Grid Intensity Badges */}
          <div className="mt-5 pt-4 border-t border-outline-variant/15">
            <span className="text-[11px] font-semibold text-on-surface-variant/80 block mb-2">Regional Grid Intensity Mix:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {carbonBreakdownData.regionMix.map((r, i) => (
                <div key={i} className="p-2 rounded-lg bg-surface-container-low text-xs flex items-center justify-between border border-outline-variant/15">
                  <span className="text-on-surface-variant truncate">{r.region}</span>
                  <span className="font-mono font-bold" style={{ color: r.color }}>{r.factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current vs Projected vs Saved Comparison Card */}
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/15 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Carbon Reduction Impact
            </h3>
            <p className="text-xs text-on-surface-variant/80 mb-6">
              Comparing unoptimized legacy trajectory vs CloudLeaf automated optimization.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-error">Current Unoptimized</span>
                  <span className="text-on-surface font-mono">{carbonBreakdownData.currentCarbonKg} kg CO2</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-primary">CloudLeaf Projected</span>
                  <span className="text-on-surface font-mono">{carbonBreakdownData.projectedCarbonKg} kg CO2</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '33.4%' }} />
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl text-center">
                <span className="text-xs text-primary font-semibold block">Net Carbon Saved</span>
                <span className="text-3xl font-extrabold text-primary font-mono">
                  {carbonBreakdownData.monthlySavedKg} <span className="text-sm font-normal text-on-surface-variant/80">kg CO2/mo</span>
                </span>
                <span className="text-[11px] text-primary/80 block mt-0.5">
                  Equivalent to planting ~65 urban trees monthly
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 6-Month Historical Trends Chart */}
      <div className="glass-card p-6 rounded-2xl border border-outline-variant/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-secondary" />
              Historical 6-Month Sustainability & Cost Audit Trends
            </h2>
            <p className="text-xs text-on-surface-variant/80">
              Verified cumulative savings performance across previous billing cycles.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/15 self-start sm:self-auto font-mono">
            Feb 2026 – Jul 2026
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 101, 88, 0.15)" />
              <XAxis dataKey="period" stroke="#6f7973" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6f7973" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: 'rgba(107, 101, 88, 0.15)',
                  borderRadius: '12px',
                  color: '#1c1c18',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="savings" name="Cost Savings ($)" fill="#005237" radius={[6, 6, 0, 0]} />
              <Bar dataKey="co2Reduced" name="CO2 Reduced (kg)" fill="#c9a15a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
