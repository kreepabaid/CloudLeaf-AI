export const mockStats = {
  monthlyCarbonSaved: 1420, // kg CO2
  carbonTrend: '+18.4% vs last month',
  monthlyCostSaved: 3850, // USD
  costTrend: '-22.1% cloud spend',
  activeInsightsCount: 12,
  efficiencyScore: 88, // %
  efficiencyTrend: '+6 pts optimizer score',
  totalResourcesAudited: 248,
  autoApprovalCount: 8,
  awaitingApprovalCount: 4,
};

export const carbonBreakdownData = {
  powerConsumptionKw: 1.85, // kW per workload avg
  runningHours: 720, // monthly hours
  regionalCarbonFactor: 0.385, // kg CO2 per kWh (us-east-1 grid mix)
  currentCarbonKg: 2132,
  projectedCarbonKg: 712,
  monthlySavedKg: 1420,
  formulaExplanation: "Power Consumption (1.85 kW) × Running Hours (720 hrs) × Regional Carbon Factor (0.385 kg/kWh)",
  regionMix: [
    { region: 'us-east-1 (N. Virginia)', factor: 0.385, usagePct: 65, color: '#f59e0b' },
    { region: 'eu-west-1 (Ireland)', factor: 0.210, usagePct: 25, color: '#4edea3' },
    { region: 'us-west-2 (Oregon)', factor: 0.095, usagePct: 10, color: '#3b82f6' },
  ]
};

export const forecastData = [
  { month: 'Day 1', cpu: 62, memory: 75, traffic: 120, cost: 420, carbon: 85, baselineCost: 520, baselineCarbon: 130 },
  { month: 'Day 5', cpu: 58, memory: 72, traffic: 135, cost: 410, carbon: 82, baselineCost: 530, baselineCarbon: 132 },
  { month: 'Day 10', cpu: 54, memory: 68, traffic: 150, cost: 395, carbon: 78, baselineCost: 540, baselineCarbon: 135 },
  { month: 'Day 15', cpu: 48, memory: 62, traffic: 165, cost: 370, carbon: 71, baselineCost: 545, baselineCarbon: 138 },
  { month: 'Day 20', cpu: 42, memory: 58, traffic: 180, cost: 340, carbon: 65, baselineCost: 550, baselineCarbon: 140 },
  { month: 'Day 25', cpu: 38, memory: 54, traffic: 195, cost: 315, carbon: 59, baselineCost: 560, baselineCarbon: 145 },
  { month: 'Day 30 (FC)', cpu: 35, memory: 50, traffic: 210, cost: 290, carbon: 52, baselineCost: 570, baselineCarbon: 148 },
];

export const historicalTrendsData = [
  { period: 'Feb 2026', spend: 6400, carbon: 2850, savings: 450, co2Reduced: 320 },
  { period: 'Mar 2026', spend: 6100, carbon: 2620, savings: 820, co2Reduced: 540 },
  { period: 'Apr 2026', spend: 5750, carbon: 2400, savings: 1200, co2Reduced: 780 },
  { period: 'May 2026', spend: 5200, carbon: 2150, savings: 1950, co2Reduced: 1050 },
  { period: 'Jun 2026', spend: 4600, carbon: 1800, savings: 2800, co2Reduced: 1280 },
  { period: 'Jul 2026', spend: 3850, carbon: 1420, savings: 3850, co2Reduced: 1420 },
];

export const mockInsights = [
  {
    id: 'ins-001',
    title: 'Downsize Unutilized EC2 Instance (i-03f92a18d9)',
    resourceId: 'i-03f92a18d9',
    awsService: 'EC2',
    region: 'us-east-1',
    category: 'Right-sizing',
    savings: '$420/mo',
    co2Saved: '185 kg CO2/mo',
    impact: 'High',
    risk: 'low',
    requiresApproval: false, // Auto-approved because low risk
    isCritical: false,
    reasoning: 'AI audit detected average CPU utilization < 6.4% over 14 consecutive days on m5.2xlarge. Recommending transition to t4g.xlarge Graviton3.',
    status: 'pending',
    createdAt: '10 mins ago',
  },
  {
    id: 'ins-002',
    title: 'Schedule Staging RDS Database Sleep Hours',
    resourceId: 'db-staging-aurora-01',
    awsService: 'RDS',
    region: 'us-east-1',
    category: 'Scheduling',
    savings: '$650/mo',
    co2Saved: '290 kg CO2/mo',
    impact: 'High',
    risk: 'low',
    requiresApproval: false, // Auto-approved
    isCritical: false,
    reasoning: 'Non-prod database shows 0 active client connections between 20:00 - 07:00 UTC on weekdays and full weekend idling. Automating bedtime pause.',
    status: 'pending',
    createdAt: '45 mins ago',
  },
  {
    id: 'ins-003',
    title: 'Migrate S3 Standard Storage to Intelligent-Tiering',
    resourceId: 'cloudleaf-telemetry-logs-archive',
    awsService: 'S3',
    region: 'eu-west-1',
    category: 'Storage Tiering',
    savings: '$310/mo',
    co2Saved: '120 kg CO2/mo',
    impact: 'Medium',
    risk: 'medium',
    requiresApproval: true, // Awaiting Approval
    isCritical: false,
    reasoning: 'Over 14.8 TB of log objects have not been accessed for 60+ days. Lifecycle policy migration drops storage overhead without retrieval penalties.',
    status: 'pending',
    createdAt: '2 hours ago',
  },
  {
    id: 'ins-004',
    title: 'Terminate Unattached EBS Volume (vol-0aa18bf92)',
    resourceId: 'vol-0aa18bf92',
    awsService: 'EBS',
    region: 'us-west-2',
    category: 'Zombie Cleanup',
    savings: '$180/mo',
    co2Saved: '65 kg CO2/mo',
    impact: 'Medium',
    risk: 'low',
    requiresApproval: false, // Auto-approved
    isCritical: false,
    reasoning: 'gp3 SSD volume has remained in "available" (unattached) state for 32 days following instance decommissioning. Snapshot verified.',
    status: 'pending',
    createdAt: '3 hours ago',
  },
  {
    id: 'ins-005',
    title: 'Drain & Deprovision Overprovisioned EKS Node Group',
    resourceId: 'eks-prod-analytics-nodegroup-2',
    awsService: 'EKS',
    region: 'us-east-1',
    category: 'Kubernetes Scaling',
    savings: '$1,250/mo',
    co2Saved: '540 kg CO2/mo',
    impact: 'Critical',
    risk: 'high',
    requiresApproval: true,
    isCritical: true, // Locked Approve button!
    reasoning: 'High risk cluster modification: Node group contains production pod replicas tagged "MissionCritical". Automated drain disabled by safety policy. Manual ops approval required.',
    status: 'pending',
    createdAt: '5 hours ago',
  },
  {
    id: 'ins-006',
    title: 'Convert On-Demand ElastiCache to Savings Plans',
    resourceId: 'redis-cache-cluster-prod',
    awsService: 'ElastiCache',
    region: 'us-east-1',
    category: 'Commitment',
    savings: '$480/mo',
    co2Saved: '190 kg CO2/mo',
    impact: 'Medium',
    risk: 'medium',
    requiresApproval: true,
    isCritical: false,
    reasoning: 'Stable baseline memory utilization exceeding 82% over 90 days qualifies for 1-year Reserved Instance coverage with zero workload disruption.',
    status: 'pending',
    createdAt: '1 day ago',
  },
  {
    id: 'ins-007',
    title: 'Purge Legacy Lambda Function Versions',
    resourceId: 'arn:aws:lambda:us-east-1:849201938210:function:CostCollector',
    awsService: 'Lambda',
    region: 'us-east-1',
    category: 'Serverless Clean',
    savings: '$95/mo',
    co2Saved: '30 kg CO2/mo',
    impact: 'Low',
    risk: 'low',
    requiresApproval: false,
    isCritical: false,
    reasoning: '42 unreferenced Lambda versions accumulating code storage limits. Deleting inactive historical artifacts.',
    status: 'executed',
    executedAt: 'Yesterday at 14:22',
  }
];

export const mockNotifications = [
  {
    id: 'notif-001',
    title: 'High Carbon Usage Detected',
    message: 'us-east-1 region carbon intensity spiked by +34% due to grid fossil fuel dispatch.',
    timestamp: '12 mins ago',
    type: 'carbon_alert',
    unread: true,
    severity: 'warning',
  },
  {
    id: 'notif-002',
    title: 'Idle Resource Found',
    message: 'EBS Volume vol-0aa18bf92 has been unattached for 30+ days. Recommended for cleanup.',
    timestamp: '1 hour ago',
    type: 'idle_resource',
    unread: true,
    severity: 'info',
  },
  {
    id: 'notif-003',
    title: 'Potential Saving Identified',
    message: 'S3 Intelligent-Tiering candidate found. Estimated saving $310/mo + 120kg CO2.',
    timestamp: '2 hours ago',
    type: 'saving_found',
    unread: true,
    severity: 'success',
  },
  {
    id: 'notif-004',
    title: 'Recommendation Applied',
    message: 'Auto-Approved action ins-007 (Lambda Purge) executed successfully.',
    timestamp: '1 day ago',
    type: 'action_executed',
    unread: false,
    severity: 'success',
  },
];

export const mockAccountDetails = {
  accountName: 'Acme Cloud Production',
  accountId: '849201938210',
  iamRoleArn: 'arn:aws:iam::849201938210:role/CloudLeafAuditRole',
  status: 'Connected',
  lastSync: '2 minutes ago',
  regionsMonitored: ['us-east-1', 'eu-west-1', 'us-west-2'],
  collectorVersion: 'v2.4.0-cloudwatch-collector',
};
