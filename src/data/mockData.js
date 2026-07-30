export const mockStats = {
  activeResources: 1243,
  idleAlerts: 18,
  costRunRate: 42500,
  carbonRunRate: 12.4, // in Metric Tons
  sustainabilityScore: 78,
  savingsIdentified: 8400,
  carbonAvoided: 3.1
};

export const forecastData = [
  { day: 'Mon', capacity: 100, actual: 65, predicted: 65 },
  { day: 'Tue', capacity: 100, actual: 70, predicted: 70 },
  { day: 'Wed', capacity: 100, actual: 68, predicted: 68 },
  { day: 'Thu', capacity: 100, actual: null, predicted: 62 },
  { day: 'Fri', capacity: 100, actual: null, predicted: 55 },
  { day: 'Sat', capacity: 100, actual: null, predicted: 30 },
  { day: 'Sun', capacity: 100, actual: null, predicted: 25 },
];

export const insights = [
  {
    id: 1,
    type: 'idle',
    title: 'Idle EC2 Instance Detected',
    description: 'i-0abcd1234efgh5678 (t3.xlarge) in us-east-1 has been idle for 6 days.',
    confidence: 99,
    savings: '$134.00/mo',
    carbon: '45kg CO₂e/mo',
    action: 'Shutdown',
    critical: false
  },
  {
    id: 2,
    type: 'over-provisioned',
    title: 'RDS Database Over-provisioned',
    description: 'db-prod-main CPU utilization hasn\'t exceeded 15% in 30 days. Recommend downsizing to db.r6g.large.',
    confidence: 92,
    savings: '$320.00/mo',
    carbon: '85kg CO₂e/mo',
    action: 'Right-size',
    critical: true
  },
  {
    id: 3,
    type: 'carbon',
    title: 'High-Carbon Region Usage',
    description: 'Batch processing workload is running in ap-northeast-1 (coal-heavy). Moving to us-west-2 (hydro/solar) reduces emissions by 60%.',
    confidence: 88,
    savings: '$0.00',
    carbon: '210kg CO₂e/mo',
    action: 'Migrate',
    critical: false
  }
];
