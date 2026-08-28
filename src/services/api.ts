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
  account_type: 'ranger' | 'community' | 'base_camp' | 'operations' | string;
  site_id: string | null;
  site_type: string;
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
  contractor?: string;
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
  account_type: 'ranger' | 'community' | 'base_camp' | 'operations' | string;
  display_name: string | null;
  contractor?: string;
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
  purpose: string;
  loc: string;
  coords: [number, number];
  terminal_ids: string[];
  data_sources: string[];
  metrics: Record<string, number | string>;
  contractor?: string;
}

export interface ExportManifest {
  formats: string[];
  endpoints: Record<string, string>;
  openapi_json: string;
  swagger_docs: string;
  redoc_docs: string;
}

// ─── GPOC South Sudan & Ababa Group Ltd Mock Data (50 Field Kits) ────────────

const CONTRACTOR_NAME = 'Ababa Group Ltd';

const mockAccounts: StarlinkAccount[] = [
  {
    id: 1,
    email: 'operations@gpoc.co.ss',
    status: 'connected',
    terminal_count: 32,
    account_type: 'operations',
    display_name: 'GPOC Unity Field Operations Network',
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 2,
    email: 'telemetry@gpoc.co.ss',
    status: 'connected',
    terminal_count: 18,
    account_type: 'base_camp',
    display_name: 'GPOC SCADA & Wellhead Telemetry Stream',
    contractor: CONTRACTOR_NAME,
  },
];

// Raw site definitions for the 50 spaced-out field kits across Unity Oil Field
const rawKitConfigs = [
  { num: '01', name: 'Unity Central Processing Facility (CPF Main Rig)', type: 'operations', site: 'wellhead', lat: 9.4920, lng: 29.8410, status: 'ONLINE', mbps: 148.5, lat_ms: 58, dev: 48, soc: 96, up: 99.9 },
  { num: '02', name: 'Well Pad 01 - Alpha North', type: 'operations', site: 'wellhead', lat: 9.5280, lng: 29.8150, status: 'ONLINE', mbps: 112.4, lat_ms: 64, dev: 16, soc: 88, up: 99.4 },
  { num: '03', name: 'Well Pad 02 - Alpha East', type: 'operations', site: 'wellhead', lat: 9.5140, lng: 29.8520, status: 'ONLINE', mbps: 104.2, lat_ms: 69, dev: 14, soc: 84, up: 98.9 },
  { num: '04', name: 'Well Pad 03 - Bravo Central', type: 'operations', site: 'wellhead', lat: 9.4710, lng: 29.8730, status: 'ONLINE', mbps: 98.7, lat_ms: 72, dev: 12, soc: 91, up: 99.1 },
  { num: '05', name: 'Well Pad 04 - Bravo South', type: 'operations', site: 'wellhead', lat: 9.4530, lng: 29.8210, status: 'ONLINE', mbps: 118.0, lat_ms: 61, dev: 19, soc: 92, up: 99.5 },
  { num: '06', name: 'Well Pad 05 - Charlie West', type: 'operations', site: 'wellhead', lat: 9.5390, lng: 29.7890, status: 'ONLINE', mbps: 92.5, lat_ms: 76, dev: 11, soc: 78, up: 98.2 },
  { num: '07', name: 'Well Pad 06 - Charlie Far North', type: 'operations', site: 'wellhead', lat: 9.5580, lng: 29.8340, status: 'DEGRADED', mbps: 42.1, lat_ms: 118, dev: 9, soc: 39, up: 94.6 },
  { num: '08', name: 'Well Pad 07 - Delta Cluster A', type: 'operations', site: 'wellhead', lat: 9.5020, lng: 29.8910, status: 'ONLINE', mbps: 124.6, lat_ms: 59, dev: 22, soc: 94, up: 99.7 },
  { num: '09', name: 'Well Pad 08 - Delta Cluster B', type: 'operations', site: 'wellhead', lat: 9.4380, lng: 29.8650, status: 'ONLINE', mbps: 108.3, lat_ms: 67, dev: 15, soc: 86, up: 99.0 },
  { num: '10', name: 'Well Pad 09 - Echo South Basin', type: 'operations', site: 'wellhead', lat: 9.4120, lng: 29.8100, status: 'ONLINE', mbps: 95.8, lat_ms: 74, dev: 13, soc: 82, up: 98.8 },
  { num: '11', name: 'Well Pad 10 - Echo West Ridge', type: 'operations', site: 'wellhead', lat: 9.4670, lng: 29.7740, status: 'ONLINE', mbps: 115.2, lat_ms: 63, dev: 18, soc: 90, up: 99.3 },
  { num: '12', name: 'Well Pad 11 - Foxtrot Northwest', type: 'operations', site: 'wellhead', lat: 9.5620, lng: 29.7610, status: 'ONLINE', mbps: 88.9, lat_ms: 81, dev: 10, soc: 75, up: 97.9 },
  { num: '13', name: 'Well Pad 12 - Foxtrot North Peak', type: 'operations', site: 'wellhead', lat: 9.5840, lng: 29.8120, status: 'ONLINE', mbps: 102.7, lat_ms: 70, dev: 14, soc: 85, up: 98.9 },
  { num: '14', name: 'Well Pad 13 - Golf East Sector', type: 'operations', site: 'wellhead', lat: 9.5310, lng: 29.9180, status: 'OFFLINE', mbps: null, lat_ms: null, dev: 0, soc: 14, up: 89.4 },
  { num: '15', name: 'Well Pad 14 - Golf Spur', type: 'operations', site: 'wellhead', lat: 9.4890, lng: 29.9320, status: 'ONLINE', mbps: 110.1, lat_ms: 66, dev: 16, soc: 89, up: 99.2 },
  { num: '16', name: 'Well Pad 15 - Hotel Southeast', type: 'operations', site: 'wellhead', lat: 9.3950, lng: 29.8820, status: 'ONLINE', mbps: 94.3, lat_ms: 75, dev: 12, soc: 80, up: 98.5 },
  { num: '17', name: 'Well Pad 16 - Hotel Lowlands', type: 'operations', site: 'wellhead', lat: 9.3780, lng: 29.8240, status: 'ONLINE', mbps: 106.8, lat_ms: 68, dev: 15, soc: 87, up: 99.0 },
  { num: '18', name: 'Well Pad 17 - India Southwest', type: 'operations', site: 'wellhead', lat: 9.4230, lng: 29.7420, status: 'ONLINE', mbps: 99.4, lat_ms: 73, dev: 13, soc: 83, up: 98.7 },
  { num: '19', name: 'Well Pad 18 - India West Boundary', type: 'operations', site: 'wellhead', lat: 9.4850, lng: 29.7190, status: 'DEGRADED', mbps: 38.5, lat_ms: 125, dev: 8, soc: 35, up: 93.8 },
  { num: '20', name: 'Well Pad 19 - Juliet Highlands', type: 'operations', site: 'wellhead', lat: 9.5710, lng: 29.7280, status: 'ONLINE', mbps: 114.7, lat_ms: 62, dev: 17, soc: 91, up: 99.4 },
  { num: '21', name: 'Well Pad 20 - Juliet North Rim', type: 'operations', site: 'wellhead', lat: 9.6100, lng: 29.7850, status: 'ONLINE', mbps: 101.5, lat_ms: 71, dev: 14, soc: 84, up: 98.8 },
  { num: '22', name: 'Well Pad 21 - Kilo Northeast', type: 'operations', site: 'wellhead', lat: 9.5950, lng: 29.8640, status: 'ONLINE', mbps: 121.3, lat_ms: 58, dev: 20, soc: 93, up: 99.6 },
  { num: '23', name: 'Well Pad 22 - Kilo Deep Well', type: 'operations', site: 'wellhead', lat: 9.5200, lng: 29.9540, status: 'ONLINE', mbps: 97.6, lat_ms: 74, dev: 13, soc: 81, up: 98.6 },
  { num: '24', name: 'Well Pad 23 - Lima East Border', type: 'operations', site: 'wellhead', lat: 9.4480, lng: 29.9670, status: 'ONLINE', mbps: 105.4, lat_ms: 69, dev: 15, soc: 86, up: 99.1 },
  { num: '25', name: 'Well Pad 24 - Lima Southeast Marsh', type: 'operations', site: 'wellhead', lat: 9.3610, lng: 29.9120, status: 'ONLINE', mbps: 91.2, lat_ms: 78, dev: 11, soc: 76, up: 98.1 },
  { num: '26', name: 'Well Pad 25 - Mike South Well', type: 'operations', site: 'wellhead', lat: 9.3420, lng: 29.8450, status: 'ONLINE', mbps: 109.8, lat_ms: 65, dev: 16, soc: 88, up: 99.2 },
  { num: '27', name: 'Well Pad 26 - Mike Southwest', type: 'operations', site: 'wellhead', lat: 9.3890, lng: 29.7630, status: 'ONLINE', mbps: 96.5, lat_ms: 72, dev: 12, soc: 82, up: 98.7 },
  { num: '28', name: 'Drilling Rig Site 01 (Exploration Alpha)', type: 'base_camp', site: 'drilling_rig', lat: 9.5450, lng: 29.8680, status: 'OFFLINE', mbps: null, lat_ms: null, dev: 0, soc: 11, up: 91.2 },
  { num: '29', name: 'Drilling Rig Site 02 (Heavy Workover)', type: 'base_camp', site: 'drilling_rig', lat: 9.4620, lng: 29.7950, status: 'ONLINE', mbps: 138.4, lat_ms: 55, dev: 36, soc: 95, up: 99.7 },
  { num: '30', name: 'Drilling Rig Site 03 (North Extension)', type: 'base_camp', site: 'drilling_rig', lat: 9.6020, lng: 29.8250, status: 'ONLINE', mbps: 126.9, lat_ms: 61, dev: 32, soc: 92, up: 99.3 },
  { num: '31', name: 'Drilling Rig Site 04 (South Exploration)', type: 'base_camp', site: 'drilling_rig', lat: 9.3720, lng: 29.8750, status: 'DEGRADED', mbps: 45.2, lat_ms: 112, dev: 14, soc: 41, up: 95.1 },
  { num: '32', name: 'Drilling Rig Site 05 (West Appraisal)', type: 'base_camp', site: 'drilling_rig', lat: 9.5100, lng: 29.7450, status: 'ONLINE', mbps: 131.7, lat_ms: 57, dev: 34, soc: 94, up: 99.6 },
  { num: '33', name: 'Drilling Rig Site 06 (East Appraisal)', type: 'base_camp', site: 'drilling_rig', lat: 9.4250, lng: 29.9350, status: 'ONLINE', mbps: 119.5, lat_ms: 64, dev: 28, soc: 89, up: 99.2 },
  { num: '34', name: 'Flow Station 01 - North Central Manifold', type: 'operations', site: 'pipeline', lat: 9.5050, lng: 29.8350, status: 'ONLINE', mbps: 142.1, lat_ms: 52, dev: 24, soc: 97, up: 99.8 },
  { num: '35', name: 'Flow Station 02 - Central Gathering Unit', type: 'operations', site: 'pipeline', lat: 9.4750, lng: 29.8550, status: 'ONLINE', mbps: 135.6, lat_ms: 56, dev: 22, soc: 95, up: 99.7 },
  { num: '36', name: 'Flow Station 03 - Northwest Collector', type: 'operations', site: 'pipeline', lat: 9.5350, lng: 29.8050, status: 'ONLINE', mbps: 122.8, lat_ms: 60, dev: 19, soc: 92, up: 99.4 },
  { num: '37', name: 'Flow Station 04 - South Central Collector', type: 'operations', site: 'pipeline', lat: 9.4450, lng: 29.8450, status: 'ONLINE', mbps: 128.4, lat_ms: 58, dev: 21, soc: 93, up: 99.5 },
  { num: '38', name: 'Flow Station 05 - North Valley Separator', type: 'operations', site: 'pipeline', lat: 9.5650, lng: 29.8550, status: 'ONLINE', mbps: 117.3, lat_ms: 65, dev: 18, soc: 88, up: 99.1 },
  { num: '39', name: 'Flow Station 06 - South Valley Separator', type: 'operations', site: 'pipeline', lat: 9.4050, lng: 29.8250, status: 'ONLINE', mbps: 111.0, lat_ms: 67, dev: 17, soc: 86, up: 99.0 },
  { num: '40', name: 'Pipeline Pump Station 01 (Main Trunkline)', type: 'operations', site: 'pipeline', lat: 9.4300, lng: 29.9100, status: 'ONLINE', mbps: 152.4, lat_ms: 50, dev: 30, soc: 98, up: 99.9 },
  { num: '41', name: 'Pipeline Pump Station 02 (South Spur Hub)', type: 'operations', site: 'pipeline', lat: 9.3550, lng: 29.9550, status: 'ONLINE', mbps: 125.0, lat_ms: 62, dev: 20, soc: 91, up: 99.3 },
  { num: '42', name: 'Pipeline Pump Station 03 (North Delivery Hub)', type: 'operations', site: 'pipeline', lat: 9.5850, lng: 29.9250, status: 'ONLINE', mbps: 133.2, lat_ms: 59, dev: 23, soc: 94, up: 99.5 },
  { num: '43', name: 'Pipeline Pump Station 04 (Bentiu Terminal Valve)', type: 'operations', site: 'pipeline', lat: 9.2950, lng: 30.0100, status: 'ONLINE', mbps: 108.9, lat_ms: 70, dev: 16, soc: 85, up: 98.9 },
  { num: '44', name: 'Unity Base Camp 01 (Field Headquarters)', type: 'base_camp', site: 'field_camp', lat: 9.4880, lng: 29.8310, status: 'ONLINE', mbps: 165.8, lat_ms: 48, dev: 68, soc: 99, up: 99.9 },
  { num: '45', name: 'Unity Base Camp 02 (Logistics & Supply Depot)', type: 'base_camp', site: 'field_camp', lat: 9.4720, lng: 29.8150, status: 'ONLINE', mbps: 144.2, lat_ms: 54, dev: 52, soc: 96, up: 99.8 },
  { num: '46', name: 'Unity Base Camp 03 (Heavy Equipment Yard)', type: 'base_camp', site: 'field_camp', lat: 9.5250, lng: 29.8850, status: 'ONLINE', mbps: 132.6, lat_ms: 58, dev: 44, soc: 93, up: 99.4 },
  { num: '47', name: 'Unity Base Camp 04 (Field Airfield / Helipad)', type: 'base_camp', site: 'field_camp', lat: 9.4600, lng: 29.8600, status: 'ONLINE', mbps: 128.5, lat_ms: 61, dev: 38, soc: 92, up: 99.5 },
  { num: '48', name: 'Security Post 01 (North Perimeter Checkpoint)', type: 'operations', site: 'security', lat: 9.6250, lng: 29.7500, status: 'OFFLINE', mbps: null, lat_ms: null, dev: 0, soc: 18, up: 90.5 },
  { num: '49', name: 'Security Post 02 (South Road Barrier Checkpoint)', type: 'operations', site: 'security', lat: 9.3300, lng: 29.8900, status: 'DEGRADED', mbps: 48.0, lat_ms: 108, dev: 12, soc: 44, up: 95.8 },
  { num: '50', name: 'Security Post 03 (East River Gate Control)', type: 'operations', site: 'security', lat: 9.4950, lng: 29.9800, status: 'ONLINE', mbps: 98.2, lat_ms: 73, dev: 18, soc: 84, up: 98.7 },
];

const mockTerminals: Terminal[] = rawKitConfigs.map((cfg) => ({
  id: `Kit #${cfg.num} (ABABA-GPOC-${cfg.num})`,
  kit_number: `Kit #${cfg.num}`,
  account_id: cfg.type === 'operations' ? 'GPOC-OPS' : 'GPOC-FIELD',
  account_email: cfg.type === 'operations' ? 'operations@gpoc.co.ss' : 'telemetry@gpoc.co.ss',
  account_type: cfg.type,
  site_id: `UOF-SITE-${cfg.num}`,
  site_type: cfg.site,
  loc: `Kit #${cfg.num} - ${cfg.name}`,
  coords: [cfg.lat, cfg.lng],
  status: cfg.status as 'ONLINE' | 'OFFLINE' | 'DEGRADED',
  data_usage_gb: cfg.status === 'OFFLINE' ? 120.4 : Number((450 + parseInt(cfg.num, 10) * 28.5).toFixed(1)),
  latency_ms: cfg.lat_ms,
  download_mbps: cfg.mbps,
  connected_devices: cfg.dev,
  uptime_percent: cfg.up,
  data_sources: ['network', 'power', 'scada'],
  community_usage_sessions: null,
  ranger_voice_sessions: cfg.dev > 20 ? cfg.dev * 2 : null,
  bluetti_soc_percent: cfg.soc,
  contractor: CONTRACTOR_NAME,
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
  purpose: `${t.kit_number} telemetry & high-speed link for GPOC Unity Oil Field (${t.site_type})`,
  loc: t.loc,
  coords: t.coords,
  terminal_ids: [t.id],
  data_sources: t.data_sources,
  metrics: { uptime_percent: t.uptime_percent, connected_devices: t.connected_devices ?? 0 },
  contractor: CONTRACTOR_NAME,
}));

function mockResponse<T>(path: string, options?: RequestInit): T {
  if (path === '/auth/login') {
    const body = JSON.parse(String(options?.body ?? '{}'));
    const email = body.email || 'operator@gpoc.co.ss';
    return {
      email,
      name: email.includes('ababa') ? 'Ababa Field Engineer' : 'GPOC Operations Manager',
      role: 'Unity Oilfield Operations Manager',
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
      latency_ms: term.latency_ms ?? 65,
      download_mbps: term.download_mbps ?? 110,
      signal_percent: 94,
      uptime: `${term.uptime_percent}%`,
      sw_version: 'GPOC-Ababa-Edge v2.4.1',
      errors: term.status === 'DEGRADED' ? 2 : 0,
      warnings: term.status === 'DEGRADED' ? 3 : 0,
      location_type: 'Unity Oilfield Kit Station',
      location_value: 'Unity Oil Field, South Sudan',
      lat: term.coords[0],
      lng: term.coords[1],
    } as T;
  }
  if (path.startsWith('/terminals/') && path.endsWith('/wifi')) {
    return { ssid: 'ABABA-GPOC-UNITY-SECURE', hide_ssid: false, bypass_mode: false, connected_clients: 24 } as T;
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
