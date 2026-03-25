export interface Account {
  id: string;
  name: string;
  plan: string;
  monthlyCost: number;
}

export interface Terminal {
  id: string;
  accountId: string;
  loc: string;
  dataUsageGB: number;
  latency: number | null;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  coords: [number, number];
  connectedDevices: number;
  uptimePercent: number;
}

export const accounts: Account[] = [
  { id: 'ACC-001', name: 'Enjojo Alpha (Juba Hub)', plan: 'Priority 1TB', monthlyCost: 250 },
  { id: 'ACC-002', name: 'Enjojo Beta (Kampala)', plan: 'Mobile Regional', monthlyCost: 50 },
  { id: 'ACC-003', name: 'Enjojo Gamma (Gulu)', plan: 'Mobile Regional', monthlyCost: 50 },
  { id: 'ACC-004', name: 'Enjojo Delta (Arua)', plan: 'Priority 1TB', monthlyCost: 250 },
  { id: 'ACC-005', name: 'Enjojo Epsilon (Malakal)', plan: 'Mobile Regional', monthlyCost: 50 },
  { id: 'ACC-006', name: 'Enjojo Zeta (Nimule)', plan: 'Mobile Regional', monthlyCost: 50 },
  { id: 'ACC-007', name: 'Enjojo Eta (Mbarara)', plan: 'Priority 1TB', monthlyCost: 250 },
  { id: 'ACC-008', name: 'Enjojo Theta (Bor)', plan: 'Mobile Regional', monthlyCost: 50 },
];

// Helper to generate random coordinates around a center point
const generateCoords = (centerLat: number, centerLng: number, spread: number): [number, number] => {
  return [
    centerLat + (Math.random() - 0.5) * spread,
    centerLng + (Math.random() - 0.5) * spread
  ];
};

export const regions = [
  { lat: 4.85, lng: 31.6, name: 'Juba Region', spread: 1.5, accId: 'ACC-001' },
  { lat: 0.34, lng: 32.58, name: 'Kampala Region', spread: 1.0, accId: 'ACC-002' },
  { lat: 2.77, lng: 32.29, name: 'Gulu Region', spread: 0.8, accId: 'ACC-003' },
  { lat: 3.03, lng: 30.9, name: 'Arua Region', spread: 0.8, accId: 'ACC-004' },
  { lat: 9.53, lng: 31.66, name: 'Malakal Region', spread: 1.2, accId: 'ACC-005' },
  { lat: 3.59, lng: 32.05, name: 'Nimule Region', spread: 0.5, accId: 'ACC-006' },
  { lat: -0.6, lng: 30.65, name: 'Mbarara Region', spread: 0.8, accId: 'ACC-007' },
  { lat: 6.2, lng: 31.55, name: 'Bor Region', spread: 1.0, accId: 'ACC-008' },
];

export const terminals: Terminal[] = [];

let terminalCounter = 1;

regions.forEach(region => {
  // Generate 6-8 terminals per region
  const numTerminals = Math.floor(Math.random() * 3) + 6; 
  for (let i = 0; i < numTerminals; i++) {
    const isOnline = Math.random() > 0.15;
    const isDegraded = isOnline && Math.random() > 0.8;
    
    terminals.push({
      id: `EA-${region.name.substring(0, 3).toUpperCase()}-${terminalCounter.toString().padStart(3, '0')}`,
      accountId: region.accId,
      loc: `${region.name} Node ${i + 1}`,
      dataUsageGB: isOnline ? parseFloat((Math.random() * 500).toFixed(1)) : 0,
      latency: isOnline ? Math.floor(Math.random() * 60) + 20 : null,
      status: isOnline ? (isDegraded ? 'DEGRADED' : 'ONLINE') : 'OFFLINE',
      coords: generateCoords(region.lat, region.lng, region.spread),
      connectedDevices: isOnline ? Math.floor(Math.random() * 40) + 2 : 0,
      uptimePercent: isOnline ? parseFloat((90 + Math.random() * 10).toFixed(1)) : parseFloat((Math.random() * 50).toFixed(1))
    });
    terminalCounter++;
  }
});

// Historical data for Community Reach chart
export const historicalConnections = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    devices: Math.floor(800 + Math.random() * 200 + (i * 5)) // Upward trend
  };
});

// Generate mock conflict data (Before vs After)
export const conflictData = {
  before: regions.flatMap(r => 
    Array.from({ length: Math.floor(Math.random() * 5) + 5 }).map(() => ({
      lat: r.lat + (Math.random() - 0.5) * r.spread * 1.5,
      lng: r.lng + (Math.random() - 0.5) * r.spread * 1.5,
      intensity: Math.random() * 0.6 + 0.4, // 0.4 to 1.0
      radius: Math.floor(Math.random() * 15000) + 10000
    }))
  ),
  after: regions.flatMap(r => 
    Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map(() => ({
      // Push remaining conflicts further away from the center (where Starlinks usually are)
      lat: r.lat + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * r.spread * 1.5,
      lng: r.lng + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * r.spread * 1.5,
      intensity: Math.random() * 0.3 + 0.2, // 0.2 to 0.5
      radius: Math.floor(Math.random() * 8000) + 5000
    }))
  )
};

// Trend data for Impact Page
export const conflictTrendData = [
  { month: 'Jan', incidents: 142, activeNodes: 0, responseTime: 72 },
  { month: 'Feb', incidents: 128, activeNodes: 4, responseTime: 65 },
  { month: 'Mar', incidents: 110, activeNodes: 12, responseTime: 48 },
  { month: 'Apr', incidents: 85, activeNodes: 24, responseTime: 24 },
  { month: 'May', incidents: 65, activeNodes: 38, responseTime: 12 },
  { month: 'Jun', incidents: 54, activeNodes: 48, responseTime: 4 },
];

export const impactComparisonData = [
  { metric: 'Incidents/mo', before: 142, after: 54 },
  { metric: 'Response (h)', before: 72, after: 4 },
  { metric: 'Trust Index', before: 32, after: 87 }, // Scaled 0-100 for chart
];
