/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const BASE = '/api';

// Default to frontend-only mode for immediate demo execution unless explicitly set to false
const FRONTEND_ONLY = import.meta.env.VITE_FRONTEND_ONLY !== 'false';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface LoginResponse {
  email: string;
  name: string;
  role: string;
}

export interface Terminal {
  id: string;
  kit_number: string;
  account_id: string;
  account_email: string;
  account_type: 'enterprise' | 'energy' | 'humanitarian' | 'government' | 'logistics' | string;
  site_id: string | null;
  site_type: string;
  state: string;
  loc: string;
  coords: [number, number];
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  data_usage_gb: number;
  latency_ms: number | null;
  download_mbps: number | null;
  connected_devices: number | null;
  uptime_percent: number;
  data_sources: string[];
  community_usage_sessions: number | null;
  ranger_voice_sessions: number | null;
  bluetti_soc_percent: number | null;
  contractor: string;
  client: string;
}

export interface TerminalTelemetry {
  latency_ms: number;
  download_mbps: number;
  signal_percent: number;
  uptime: string;
  sw_version: string;
  errors: number;
  warnings: number;
  location_type: string;
  location_value: string;
  lat: number;
  lng: number;
}

export interface WifiConfig {
  ssid: string;
  hide_ssid: boolean;
  bypass_mode: boolean;
  connected_clients: number;
}

export interface DishConfig {
  snow_melt_mode: string;
  power_saving: boolean;
}

export interface FleetStats {
  total: number;
  online: number;
  offline: number;
  degraded: number;
  total_data_tb: number;
  current_download_mbps: number;
  avg_uptime_percent: number;
}

export interface StarlinkAccount {
  id: number;
  email: string;
  status: string;
  terminal_count: number;
  account_type: string;
  display_name: string | null;
  contractor: string;
}

export interface FleetSnapshot {
  accounts: StarlinkAccount[];
  terminals: Terminal[];
  fleet_stats: FleetStats;
}

export interface DeploymentSite {
  id: string;
  name: string;
  account_email: string;
  account_type: string;
  site_type: string;
  state: string;
  purpose: string;
  loc: string;
  coords: [number, number];
  terminal_ids: string[];
  data_sources: string[];
  metrics: Record<string, number | string>;
  contractor: string;
  client: string;
}

export interface ExportManifest {
  formats: string[];
  endpoints: Record<string, string>;
  openapi_json: string;
  swagger_docs: string;
  redoc_docs: string;
}

// ─── Ababa Group Limited Nationwide South Sudan Fleet Mock Data (50 Kits) ─────

const OPERATOR_NAME = 'Ababa Group Limited';

const mockAccounts: StarlinkAccount[] = [
  {
    id: 1,
    email: 'ops@ababagroup.com',
    status: 'connected',
    terminal_count: 32,
    account_type: 'enterprise',
    display_name: 'Ababa Group Master NOC - National Fleet (South Sudan)',
    contractor: OPERATOR_NAME,
  },
  {
    id: 2,
    email: 'energy.telemetry@ababagroup.com',
    status: 'connected',
    terminal_count: 18,
    account_type: 'energy',
    display_name: 'Ababa Group - Energy & Oilfield Remote Telemetry',
    contractor: OPERATOR_NAME,
  },
];

// Raw site definitions for 50 kits distributed across all 10 states of South Sudan
const rawKitConfigs = [
  // Central Equatoria
  { num: '01', name: 'Ababa Group Master NOC & HQ (Airport Road)', state: 'Central Equatoria', client: 'Ababa Group Internal', type: 'enterprise', site: 'noc_hub', lat: 4.8594, lng: 31.5713, status: 'ONLINE', mbps: 188.5, lat_ms: 46, dev: 64, soc: 99, up: 99.9 },
  { num: '02', name: 'Juba International Airport Aviation Terminal', state: 'Central Equatoria', client: 'Civil Aviation Authority', type: 'logistics', site: 'airfield', lat: 4.8720, lng: 31.6011, status: 'ONLINE', mbps: 165.2, lat_ms: 48, dev: 42, soc: 98, up: 99.8 },
  { num: '03', name: 'Gumbo Central Warehousing & Freight Depot', state: 'Central Equatoria', client: 'National Freight Lines', type: 'logistics', site: 'logistics', lat: 4.8320, lng: 31.6320, status: 'ONLINE', mbps: 142.0, lat_ms: 52, dev: 36, soc: 95, up: 99.6 },
  { num: '04', name: 'UNMISS Tongping Humanitarian Hub', state: 'Central Equatoria', client: 'UN Operations', type: 'humanitarian', site: 'humanitarian', lat: 4.8690, lng: 31.5840, status: 'ONLINE', mbps: 154.6, lat_ms: 50, dev: 58, soc: 97, up: 99.7 },
  { num: '05', name: 'Luri Heavy Equipment & Quarry Base', state: 'Central Equatoria', client: 'Rhino Infrastructure', type: 'enterprise', site: 'industrial', lat: 4.9120, lng: 31.4890, status: 'ONLINE', mbps: 118.4, lat_ms: 58, dev: 18, soc: 91, up: 99.2 },
  { num: '06', name: 'Terekeka River Nile Barge Terminal', state: 'Central Equatoria', client: 'River Navigation Corp', type: 'logistics', site: 'port', lat: 5.4410, lng: 31.7520, status: 'ONLINE', mbps: 112.5, lat_ms: 62, dev: 22, soc: 89, up: 99.1 },
  { num: '07', name: 'Yei Commercial Banking & NGO Gateway', state: 'Central Equatoria', client: 'Equity Bank & NGOs', type: 'enterprise', site: 'commercial', lat: 4.0950, lng: 30.6740, status: 'ONLINE', mbps: 135.0, lat_ms: 54, dev: 38, soc: 94, up: 99.5 },
  { num: '08', name: 'Kajo-Keji Cross-Border Customs Station', state: 'Central Equatoria', client: 'South Sudan Customs', type: 'government', site: 'security', lat: 3.8560, lng: 31.6580, status: 'ONLINE', mbps: 104.2, lat_ms: 65, dev: 19, soc: 86, up: 98.9 },

  // Eastern Equatoria
  { num: '09', name: 'Nimule One-Stop Border Post & Customs', state: 'Eastern Equatoria', client: 'Revenue Authority', type: 'government', site: 'customs', lat: 3.6003, lng: 32.0478, status: 'ONLINE', mbps: 172.4, lat_ms: 49, dev: 78, soc: 98, up: 99.9 },
  { num: '10', name: 'Torit State Administration Telecom Backhaul', state: 'Eastern Equatoria', client: 'State Secretariat', type: 'government', site: 'government', lat: 4.4120, lng: 32.5690, status: 'ONLINE', mbps: 128.5, lat_ms: 57, dev: 32, soc: 92, up: 99.4 },
  { num: '11', name: 'Kapoeta Commercial Gold Mining Camp', state: 'Eastern Equatoria', client: 'Equator Gold Mining Ltd', type: 'enterprise', site: 'mining', lat: 4.7730, lng: 33.5870, status: 'ONLINE', mbps: 138.2, lat_ms: 55, dev: 28, soc: 94, up: 99.6 },
  { num: '12', name: 'Budi Hills Agricultural Research Station', state: 'Eastern Equatoria', client: 'Agri-Development Fund', type: 'humanitarian', site: 'field_camp', lat: 4.3210, lng: 33.1200, status: 'DEGRADED', mbps: 44.8, lat_ms: 114, dev: 12, soc: 42, up: 95.1 },
  { num: '13', name: 'Narus Transit Logistics & Fuel Depot', state: 'Eastern Equatoria', client: 'Great Lakes Transport', type: 'logistics', site: 'logistics', lat: 4.8420, lng: 33.9120, status: 'ONLINE', mbps: 119.6, lat_ms: 61, dev: 20, soc: 90, up: 99.3 },

  // Western Equatoria
  { num: '14', name: 'Yambio Regional Agro-Processing Hub', state: 'Western Equatoria', client: 'Greenbelt Agro Ltd', type: 'enterprise', site: 'industrial', lat: 4.5680, lng: 28.3950, status: 'ONLINE', mbps: 124.0, lat_ms: 59, dev: 30, soc: 93, up: 99.4 },
  { num: '15', name: 'Maridi Water & Power Utility Telemetry', state: 'Western Equatoria', client: 'State Power Utility', type: 'enterprise', site: 'utility', lat: 4.9120, lng: 29.4750, status: 'ONLINE', mbps: 108.5, lat_ms: 66, dev: 16, soc: 88, up: 99.0 },
  { num: '16', name: 'Tambura Health Clinic & Frontier Post', state: 'Western Equatoria', client: 'MSF Healthcare', type: 'humanitarian', site: 'humanitarian', lat: 5.6020, lng: 27.4680, status: 'ONLINE', mbps: 98.4, lat_ms: 72, dev: 24, soc: 85, up: 98.8 },
  { num: '17', name: 'Nzara Teak Timber & Forest Station', state: 'Western Equatoria', client: 'Equatoria Forestry Co', type: 'enterprise', site: 'field_camp', lat: 4.6420, lng: 28.2560, status: 'ONLINE', mbps: 112.0, lat_ms: 63, dev: 18, soc: 89, up: 99.2 },

  // Jonglei State
  { num: '18', name: 'Bor River Port & Humanitarian Dock', state: 'Jonglei', client: 'World Food Programme', type: 'humanitarian', site: 'port', lat: 6.2072, lng: 31.5591, status: 'ONLINE', mbps: 156.0, lat_ms: 51, dev: 52, soc: 97, up: 99.8 },
  { num: '19', name: 'Pibor Relief Emergency Base', state: 'Jonglei', client: 'UN Humanitarian Fund', type: 'humanitarian', site: 'humanitarian', lat: 6.7950, lng: 33.1310, status: 'DEGRADED', mbps: 41.5, lat_ms: 122, dev: 14, soc: 38, up: 94.2 },
  { num: '20', name: 'Akobo Eastern Border Communications Hub', state: 'Jonglei', client: 'Border Security & UN', type: 'government', site: 'security', lat: 7.7890, lng: 33.0040, status: 'ONLINE', mbps: 105.8, lat_ms: 68, dev: 22, soc: 87, up: 98.9 },
  { num: '21', name: 'Ayod Sudd Wetland Environmental Station', state: 'Jonglei', client: 'Ministry of Environment', type: 'government', site: 'utility', lat: 8.0940, lng: 31.4120, status: 'ONLINE', mbps: 94.2, lat_ms: 75, dev: 11, soc: 82, up: 98.5 },
  { num: '22', name: 'Pochalla Mineral Exploration Compound', state: 'Jonglei', client: 'Nile Mining Exploration', type: 'enterprise', site: 'mining', lat: 6.8620, lng: 34.1120, status: 'OFFLINE', mbps: null, lat_ms: null, dev: 0, soc: 14, up: 90.1 },

  // Lakes State
  { num: '23', name: 'Rumbek Central Commercial & Telecom Base', state: 'Lakes', client: 'Ababa Group Regional NOC', type: 'enterprise', site: 'noc_hub', lat: 6.8062, lng: 29.6774, status: 'ONLINE', mbps: 148.0, lat_ms: 53, dev: 46, soc: 96, up: 99.7 },
  { num: '24', name: 'Yirol Commercial Fisheries Telemetry', state: 'Lakes', client: 'Lakes Fish Corporation', type: 'enterprise', site: 'commercial', lat: 6.5540, lng: 30.5020, status: 'ONLINE', mbps: 114.2, lat_ms: 61, dev: 19, soc: 91, up: 99.3 },
  { num: '25', name: 'Cueibet Transport Corridor Relay Node', state: 'Lakes', client: 'Inter-State Logistics', type: 'logistics', site: 'logistics', lat: 6.9940, lng: 29.2890, status: 'ONLINE', mbps: 102.6, lat_ms: 69, dev: 15, soc: 86, up: 98.9 },
  { num: '26', name: 'Awerial Nile Crossing Ferry Terminal', state: 'Lakes', client: 'River Nile Ferries', type: 'logistics', site: 'port', lat: 6.1820, lng: 31.3210, status: 'ONLINE', mbps: 121.5, lat_ms: 58, dev: 26, soc: 93, up: 99.5 },

  // Unity State (Oilfields & Regional Centers)
  { num: '27', name: 'Bentiu State Operations Base & Gateway', state: 'Unity', client: 'Ababa Group Unity Ops', type: 'enterprise', site: 'noc_hub', lat: 9.2333, lng: 29.8333, status: 'ONLINE', mbps: 162.0, lat_ms: 50, dev: 54, soc: 98, up: 99.8 },
  { num: '28', name: 'Rubkona Airfield Cargo & Fuel Hub', state: 'Unity', client: 'United Nations Aviation', type: 'logistics', site: 'airfield', lat: 9.2780, lng: 29.7950, status: 'ONLINE', mbps: 144.5, lat_ms: 54, dev: 38, soc: 95, up: 99.6 },
  { num: '29', name: 'Unity Oilfield Central Processing Facility (CPF)', state: 'Unity', client: 'Unity Petroleum Operations', type: 'energy', site: 'oilfield', lat: 9.4920, lng: 29.8410, status: 'ONLINE', mbps: 178.0, lat_ms: 48, dev: 62, soc: 99, up: 99.9 },
  { num: '30', name: 'Unity Well Pad Alpha Telemetry Station', state: 'Unity', client: 'Unity Petroleum Operations', type: 'energy', site: 'oilfield', lat: 9.5280, lng: 29.8150, status: 'ONLINE', mbps: 122.4, lat_ms: 59, dev: 18, soc: 92, up: 99.4 },
  { num: '31', name: 'Unity Well Pad Bravo Telemetry Station', state: 'Unity', client: 'Unity Petroleum Operations', type: 'energy', site: 'oilfield', lat: 9.4710, lng: 29.8730, status: 'ONLINE', mbps: 116.8, lat_ms: 62, dev: 16, soc: 90, up: 99.2 },
  { num: '32', name: 'Unity Exploration Drilling Rig #1 Camp', state: 'Unity', client: 'Unity Petroleum Operations', type: 'energy', site: 'oilfield', lat: 9.5450, lng: 29.8680, status: 'ONLINE', mbps: 136.5, lat_ms: 56, dev: 34, soc: 94, up: 99.6 },
  { num: '33', name: 'Pariang North Oilfield Logistics Yard', state: 'Unity', client: 'Nile Basin Petroleum Consortium', type: 'energy', site: 'logistics', lat: 9.7620, lng: 30.1240, status: 'ONLINE', mbps: 126.0, lat_ms: 58, dev: 28, soc: 93, up: 99.4 },
  { num: '34', name: 'Mankien Security & Telecom Outpost', state: 'Unity', client: 'Field Security Ops', type: 'government', site: 'security', lat: 9.0520, lng: 29.2150, status: 'OFFLINE', mbps: null, lat_ms: null, dev: 0, soc: 12, up: 90.4 },
  { num: '35', name: 'Mayom Commercial Transport Depot', state: 'Unity', client: 'Nile Petroleum Distribution', type: 'logistics', site: 'logistics', lat: 9.2840, lng: 29.3620, status: 'ONLINE', mbps: 108.0, lat_ms: 66, dev: 17, soc: 88, up: 99.0 },

  // Upper Nile State (Oilfields & Nile Corridor)
  { num: '36', name: 'Malakal River Port & Regional NOC', state: 'Upper Nile', client: 'Ababa Group Upper Nile', type: 'enterprise', site: 'noc_hub', lat: 9.5334, lng: 31.6605, status: 'ONLINE', mbps: 168.0, lat_ms: 49, dev: 58, soc: 98, up: 99.8 },
  { num: '37', name: 'Dar Petroleum Paloch CPF Main Terminal', state: 'Upper Nile', client: 'Dar Petroleum (DPOC)', type: 'energy', site: 'oilfield', lat: 9.9850, lng: 32.5420, status: 'ONLINE', mbps: 182.5, lat_ms: 47, dev: 72, soc: 99, up: 99.9 },
  { num: '38', name: 'Paloch Oilfield Airfield & Operations Camp', state: 'Upper Nile', client: 'Dar Petroleum (DPOC)', type: 'energy', site: 'airfield', lat: 10.0210, lng: 32.5890, status: 'ONLINE', mbps: 158.4, lat_ms: 51, dev: 48, soc: 97, up: 99.7 },
  { num: '39', name: 'Renk Northern Agricultural Grain Silos', state: 'Upper Nile', client: 'Sudan-South Sudan Trade', type: 'enterprise', site: 'commercial', lat: 11.8310, lng: 32.7980, status: 'ONLINE', mbps: 132.0, lat_ms: 56, dev: 36, soc: 94, up: 99.5 },
  { num: '40', name: 'Melut Crude Oil Pumping Station #2', state: 'Upper Nile', client: 'Petroleum Pipeline Corp', type: 'energy', site: 'oilfield', lat: 10.4420, lng: 32.2010, status: 'ONLINE', mbps: 145.2, lat_ms: 53, dev: 26, soc: 96, up: 99.7 },
  { num: '41', name: 'Maban Humanitarian Refugee Operations', state: 'Upper Nile', client: 'UNHCR Refugee Mission', type: 'humanitarian', site: 'humanitarian', lat: 9.9320, lng: 33.8210, status: 'ONLINE', mbps: 124.8, lat_ms: 60, dev: 44, soc: 92, up: 99.3 },
  { num: '42', name: 'Bunj Field Health & Water Logistics Hub', state: 'Upper Nile', client: 'Relief International', type: 'humanitarian', site: 'humanitarian', lat: 9.9650, lng: 33.6420, status: 'DEGRADED', mbps: 39.4, lat_ms: 128, dev: 11, soc: 36, up: 93.8 },
  { num: '43', name: 'Kodok Nile Shipping Checkpoint', state: 'Upper Nile', client: 'River Navigation Security', type: 'government', site: 'port', lat: 9.8920, lng: 32.1120, status: 'ONLINE', mbps: 106.2, lat_ms: 67, dev: 15, soc: 87, up: 98.9 },

  // Warrap State
  { num: '44', name: 'Kuajok State Capital Telecom Node', state: 'Warrap', client: 'Warrap State Ministry', type: 'government', site: 'government', lat: 8.3090, lng: 27.9940, status: 'ONLINE', mbps: 136.0, lat_ms: 55, dev: 38, soc: 94, up: 99.6 },
  { num: '45', name: 'Tonj Solar Health & Community Gateway', state: 'Warrap', client: 'Catholic Health Mission', type: 'humanitarian', site: 'humanitarian', lat: 7.2780, lng: 28.6820, status: 'ONLINE', mbps: 118.5, lat_ms: 61, dev: 29, soc: 91, up: 99.3 },
  { num: '46', name: 'Gogrial Cattle & Trade Market Network', state: 'Warrap', client: 'Rural Commerce Initiative', type: 'enterprise', site: 'commercial', lat: 8.5320, lng: 28.1150, status: 'ONLINE', mbps: 104.0, lat_ms: 68, dev: 19, soc: 86, up: 98.9 },

  // Western Bahr el Ghazal
  { num: '47', name: 'Wau Commercial Logistics & Rail Hub', state: 'Western Bahr el Ghazal', client: 'Ababa Group Bahr el Ghazal', type: 'enterprise', site: 'noc_hub', lat: 7.7028, lng: 27.9953, status: 'ONLINE', mbps: 164.0, lat_ms: 49, dev: 60, soc: 98, up: 99.8 },
  { num: '48', name: 'Raja Western Frontier Border Post', state: 'Western Bahr el Ghazal', client: 'Border Defense Unit', type: 'government', site: 'security', lat: 8.4590, lng: 25.6780, status: 'DEGRADED', mbps: 46.2, lat_ms: 118, dev: 13, soc: 40, up: 94.8 },
  { num: '49', name: 'Bussere University Telemetry Station', state: 'Western Bahr el Ghazal', client: 'University of Bahr el Ghazal', type: 'enterprise', site: 'commercial', lat: 7.5120, lng: 27.8420, status: 'ONLINE', mbps: 122.0, lat_ms: 60, dev: 42, soc: 92, up: 99.4 },

  // Northern Bahr el Ghazal
  { num: '50', name: 'Aweil Central Rail & Trade Terminal', state: 'Northern Bahr el Ghazal', client: 'Cross-Border Commerce Corp', type: 'logistics', site: 'logistics', lat: 8.7680, lng: 27.4010, status: 'ONLINE', mbps: 142.5, lat_ms: 54, dev: 45, soc: 95, up: 99.6 },
];

const mockTerminals: Terminal[] = rawKitConfigs.map((cfg) => ({
  id: `Kit #${cfg.num} (ABABA-SSD-${cfg.num})`,
  kit_number: `Kit #${cfg.num}`,
  account_id: cfg.type === 'energy' ? 'ABABA-ENERGY' : 'ABABA-ENTERPRISE',
  account_email: cfg.type === 'energy' ? 'energy.telemetry@ababagroup.com' : 'ops@ababagroup.com',
  account_type: cfg.type,
  site_id: `ABABA-SITE-${cfg.num}`,
  site_type: cfg.site,
  state: cfg.state,
  loc: `Kit #${cfg.num} - ${cfg.name}`,
  coords: [cfg.lat, cfg.lng],
  status: cfg.status as 'ONLINE' | 'OFFLINE' | 'DEGRADED',
  data_usage_gb: cfg.status === 'OFFLINE' ? 140.2 : Number((520 + parseInt(cfg.num, 10) * 32.4).toFixed(1)),
  latency_ms: cfg.lat_ms,
  download_mbps: cfg.mbps,
  connected_devices: cfg.dev,
  uptime_percent: cfg.up,
  data_sources: ['network', 'power', 'telemetry'],
  community_usage_sessions: null,
  ranger_voice_sessions: cfg.dev > 25 ? cfg.dev * 2 : null,
  bluetti_soc_percent: cfg.soc,
  contractor: OPERATOR_NAME,
  client: cfg.client,
}));

const mockFleetStats: FleetStats = {
  total: mockTerminals.length,
  online: mockTerminals.filter((t) => t.status === 'ONLINE').length,
  offline: mockTerminals.filter((t) => t.status === 'OFFLINE').length,
  degraded: mockTerminals.filter((t) => t.status === 'DEGRADED').length,
  total_data_tb: Number((mockTerminals.reduce((sum, t) => sum + t.data_usage_gb, 0) / 1024).toFixed(2)),
  current_download_mbps: Number(mockTerminals.reduce((sum, t) => sum + (t.download_mbps ?? 0), 0).toFixed(1)),
  avg_uptime_percent: Number((mockTerminals.reduce((sum, t) => sum + t.uptime_percent, 0) / mockTerminals.length).toFixed(1)),
};

const mockSites: DeploymentSite[] = mockTerminals.map((t) => ({
  id: t.site_id ?? t.id,
  name: t.loc,
  account_email: t.account_email,
  account_type: t.account_type,
  site_type: t.site_type,
  state: t.state,
  purpose: `${t.kit_number} deployed for ${t.client} in ${t.state}, maintained by Ababa Group Limited`,
  loc: t.loc,
  coords: t.coords,
  terminal_ids: [t.id],
  data_sources: t.data_sources,
  metrics: { uptime_percent: t.uptime_percent, connected_devices: t.connected_devices ?? 0 },
  contractor: OPERATOR_NAME,
  client: t.client,
}));

function mockResponse<T>(path: string, options?: RequestInit): T {
  if (path === '/auth/login') {
    const body = JSON.parse(String(options?.body ?? '{}'));
    const email = body.email || 'ops@ababagroup.com';
    return {
      email,
      name: email.includes('admin') ? 'Ababa NOC Administrator' : 'Ababa Network Engineer',
      role: 'Ababa Group Fleet Operations Lead',
    } as T;
  }
  if (path === '/analytics/fleet-snapshot') {
    return { accounts: mockAccounts, terminals: mockTerminals, fleet_stats: mockFleetStats } as T;
  }
  if (path === '/analytics/fleet-stats') return mockFleetStats as T;
  if (path === '/platform/sites') return mockSites as T;
  if (path === '/accounts') return mockAccounts as T;
  if (path.startsWith('/terminals/') && path.endsWith('/telemetry')) {
    const decodedPath = decodeURIComponent(path);
    const parts = decodedPath.split('/');
    const id = parts[2];
    const term = mockTerminals.find((t) => t.id === id || encodeURIComponent(t.id) === id) || mockTerminals[0];
    return {
      latency_ms: term.latency_ms ?? 55,
      download_mbps: term.download_mbps ?? 135,
      signal_percent: 96,
      uptime: `${term.uptime_percent}%`,
      sw_version: 'Ababa-Starlink-Edge v3.2.0',
      errors: term.status === 'DEGRADED' ? 2 : 0,
      warnings: term.status === 'DEGRADED' ? 3 : 0,
      location_type: 'Ababa Maintained Station',
      location_value: `${term.state}, South Sudan`,
      lat: term.coords[0],
      lng: term.coords[1],
    } as T;
  }
  if (path.startsWith('/terminals/') && path.endsWith('/wifi')) {
    return { ssid: 'ABABA-GROUP-SECURE', hide_ssid: false, bypass_mode: false, connected_clients: 28 } as T;
  }
  if (path.startsWith('/terminals/') && path.endsWith('/dish')) {
    return { snow_melt_mode: 'auto', power_saving: false } as T;
  }
  if (path.startsWith('/terminals/')) {
    const decodedPath = decodeURIComponent(path);
    const parts = decodedPath.split('/');
    const id = parts[2];
    const term = mockTerminals.find((t) => t.id === id || encodeURIComponent(t.id) === id);
    return (term ?? mockTerminals[0]) as T;
  }
  if (path === '/platform/exports') {
    return {
      formats: ['json', 'csv'],
      endpoints: { sites: '/api/platform/sites', fleet: '/api/analytics/fleet-snapshot' },
      openapi_json: '/api/openapi.json',
      swagger_docs: '/docs',
      redoc_docs: '/redoc',
    } as T;
  }
  return { message: 'Demo action completed successfully' } as T;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (FRONTEND_ONLY) {
    return Promise.resolve(mockResponse<T>(path, options));
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function authLogin(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ─── Terminals ───────────────────────────────────────────────────────────────

export function getTerminals() {
  return request<Terminal[]>('/terminals');
}

export function getTerminal(id: string) {
  return request<Terminal>(`/terminals/${encodeURIComponent(id)}`);
}

export function getTerminalTelemetry(id: string) {
  return request<TerminalTelemetry>(`/terminals/${encodeURIComponent(id)}/telemetry`);
}

export function getWifiConfig(id: string) {
  return request<WifiConfig>(`/terminals/${encodeURIComponent(id)}/wifi`);
}

export function getDishConfig(id: string) {
  return request<DishConfig>(`/terminals/${encodeURIComponent(id)}/dish`);
}

export function rebootTerminal(id: string) {
  return request<{ message: string }>(`/terminals/${encodeURIComponent(id)}/reboot`, { method: 'POST' });
}

export function saveWifiConfig(id: string, config: Partial<WifiConfig>) {
  return request<{ message: string }>(`/terminals/${encodeURIComponent(id)}/wifi`, {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}

export function saveDishConfig(id: string, config: Partial<DishConfig>) {
  return request<{ message: string }>(`/terminals/${encodeURIComponent(id)}/dish`, {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function getFleetStats() {
  return request<FleetStats>('/analytics/fleet-stats');
}

export function getFleetSnapshot() {
  return request<FleetSnapshot>('/analytics/fleet-snapshot');
}

// ─── Starlink Accounts ───────────────────────────────────────────────────────

export function getStarlinkAccounts() {
  return request<StarlinkAccount[]>('/accounts');
}

export function linkStarlinkAccount(email: string, cookieJson: string) {
  return request<StarlinkAccount>('/accounts', {
    method: 'POST',
    body: JSON.stringify({ email, cookie_json: cookieJson }),
  });
}

export function removeStarlinkAccount(id: number) {
  return request<{ message: string }>(`/accounts/${id}`, { method: 'DELETE' });
}

// ─── Platform Exports ───────────────────────────────────────────────────────

export function getDeploymentSites() {
  return request<DeploymentSite[]>('/platform/sites');
}

export function getExportManifest() {
  return request<ExportManifest>('/platform/exports');
}
