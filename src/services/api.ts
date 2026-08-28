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

// ─── GPOC South Sudan & Ababa Group Ltd Mock Data ────────────────────────────

const CONTRACTOR_NAME = 'Ababa Group Ltd';

const mockAccounts: StarlinkAccount[] = [
  {
    id: 1,
    email: 'operations@gpoc.co.ss',
    status: 'connected',
    terminal_count: 6,
    account_type: 'operations',
    display_name: 'GPOC Field Operations Network (Ababa Group Ltd)',
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 2,
    email: 'telemetry@gpoc.co.ss',
    status: 'connected',
    terminal_count: 3,
    account_type: 'base_camp',
    display_name: 'Unity Oilfield Wellhead SCADA Telemetry',
    contractor: CONTRACTOR_NAME,
  },
];

const mockTerminals: Terminal[] = [
  {
    id: 'ABABA-GPOC-UOF-001',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-CPF-01',
    site_type: 'operations',
    loc: 'Unity Central Processing Facility (CPF Main)',
    coords: [9.4920, 29.8410],
    status: 'ONLINE',
    data_usage_gb: 1240.8,
    latency_ms: 62,
    download_mbps: 142.5,
    connected_devices: 54,
    uptime_percent: 99.8,
    data_sources: ['network', 'power', 'scada'],
    community_usage_sessions: null,
    ranger_voice_sessions: 42,
    bluetti_soc_percent: 94,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-002',
    account_id: 'GPOC-SCADA',
    account_email: 'telemetry@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-PAD-A',
    site_type: 'wellhead',
    loc: 'Unity Well Pad Alpha (Production Wellhead A)',
    coords: [9.5085, 29.8250],
    status: 'ONLINE',
    data_usage_gb: 680.4,
    latency_ms: 71,
    download_mbps: 98.4,
    connected_devices: 14,
    uptime_percent: 99.1,
    data_sources: ['network', 'power', 'telemetry'],
    community_usage_sessions: null,
    ranger_voice_sessions: null,
    bluetti_soc_percent: 82,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-003',
    account_id: 'GPOC-SCADA',
    account_email: 'telemetry@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-PAD-B',
    site_type: 'wellhead',
    loc: 'Unity Well Pad Bravo (Production Wellhead B)',
    coords: [9.4750, 29.8600],
    status: 'DEGRADED',
    data_usage_gb: 512.3,
    latency_ms: 115,
    download_mbps: 46.2,
    connected_devices: 11,
    uptime_percent: 94.5,
    data_sources: ['network', 'power'],
    community_usage_sessions: null,
    ranger_voice_sessions: null,
    bluetti_soc_percent: 38,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-004',
    account_id: 'GPOC-SCADA',
    account_email: 'telemetry@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-PAD-C',
    site_type: 'wellhead',
    loc: 'Unity Well Pad Charlie (Production Wellhead C)',
    coords: [9.5150, 29.8020],
    status: 'ONLINE',
    data_usage_gb: 720.9,
    latency_ms: 68,
    download_mbps: 112.0,
    connected_devices: 18,
    uptime_percent: 98.9,
    data_sources: ['network', 'power', 'telemetry'],
    community_usage_sessions: null,
    ranger_voice_sessions: null,
    bluetti_soc_percent: 89,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-005',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'base_camp',
    site_id: 'UOF-RIG-01',
    site_type: 'drilling_rig',
    loc: 'Unity Drilling Rig #1 (Exploration & Drilling Camp)',
    coords: [9.4610, 29.8800],
    status: 'ONLINE',
    data_usage_gb: 985.6,
    latency_ms: 65,
    download_mbps: 134.8,
    connected_devices: 36,
    uptime_percent: 99.4,
    data_sources: ['network', 'power'],
    community_usage_sessions: null,
    ranger_voice_sessions: 19,
    bluetti_soc_percent: 91,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-006',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-PUMP-01',
    site_type: 'pipeline',
    loc: 'Unity Pipeline Pump Station #1',
    coords: [9.4300, 29.9100],
    status: 'OFFLINE',
    data_usage_gb: 310.2,
    latency_ms: null,
    download_mbps: null,
    connected_devices: 0,
    uptime_percent: 89.2,
    data_sources: ['network', 'power'],
    community_usage_sessions: null,
    ranger_voice_sessions: null,
    bluetti_soc_percent: 12,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-007',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'base_camp',
    site_id: 'UOF-CAMP-01',
    site_type: 'field_camp',
    loc: 'Unity Field Base Camp & Maintenance Depot',
    coords: [9.4880, 29.8310],
    status: 'ONLINE',
    data_usage_gb: 1450.0,
    latency_ms: 59,
    download_mbps: 126.1,
    connected_devices: 45,
    uptime_percent: 99.7,
    data_sources: ['network', 'power', 'impact'],
    community_usage_sessions: 24,
    ranger_voice_sessions: 35,
    bluetti_soc_percent: 96,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-008',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'operations',
    site_id: 'UOF-SEC-01',
    site_type: 'security',
    loc: 'Unity Emergency Response & Security Post',
    coords: [9.5220, 29.8450],
    status: 'ONLINE',
    data_usage_gb: 410.7,
    latency_ms: 74,
    download_mbps: 88.3,
    connected_devices: 19,
    uptime_percent: 98.6,
    data_sources: ['network', 'power'],
    community_usage_sessions: null,
    ranger_voice_sessions: 58,
    bluetti_soc_percent: 85,
    contractor: CONTRACTOR_NAME,
  },
  {
    id: 'ABABA-GPOC-UOF-009',
    account_id: 'GPOC-OPS',
    account_email: 'operations@gpoc.co.ss',
    account_type: 'community',
    site_id: 'UOF-COMM-01',
    site_type: 'community_hub',
    loc: 'Unity Community & Field Worker Welfare Hub',
    coords: [9.4450, 29.7900],
    status: 'ONLINE',
    data_usage_gb: 890.3,
    latency_ms: 78,
    download_mbps: 78.5,
    connected_devices: 62,
    uptime_percent: 97.9,
    data_sources: ['network', 'impact'],
    community_usage_sessions: 148,
    ranger_voice_sessions: 12,
    bluetti_soc_percent: 76,
    contractor: CONTRACTOR_NAME,
  },
];

const mockFleetStats: FleetStats = {
  total: mockTerminals.length,
  online: mockTerminals.filter((t) => t.status === 'ONLINE').length,
  offline: mockTerminals.filter((t) => t.status === 'OFFLINE').length,
  degraded: mockTerminals.filter((t) => t.status === 'DEGRADED').length,
  total_data_tb: Number((mockTerminals.reduce((sum, t) => sum + t.data_usage_gb, 0) / 1024).toFixed(2)),
  current_download_mbps: 826.8,
  avg_uptime_percent: 97.4,
};

const mockSites: DeploymentSite[] = mockTerminals.map((t) => ({
  id: t.site_id ?? t.id,
  name: t.loc,
  account_email: t.account_email,
  account_type: t.account_type,
  site_type: t.site_type,
  purpose: t.account_type === 'community' ? 'Community & Welfare Connectivity' : 'GPOC Oilfield Operations & Telemetry',
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
    const id = path.split('/')[2];
    const term = mockTerminals.find((t) => t.id === id) || mockTerminals[0];
    return {
      latency_ms: term.latency_ms ?? 70,
      download_mbps: term.download_mbps ?? 100,
      signal_percent: 93,
      uptime: `${term.uptime_percent}%`,
      sw_version: 'GPOC-Ababa-Edge v2.4.1',
      errors: term.status === 'DEGRADED' ? 2 : 0,
      warnings: term.status === 'DEGRADED' ? 3 : 0,
      location_type: 'Oilfield Site',
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
    const id = path.split('/')[2];
    const term = mockTerminals.find((t) => t.id === id);
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
  return request<Terminal>(`/terminals/${id}`);
}

export function getTerminalTelemetry(id: string) {
  return request<TerminalTelemetry>(`/terminals/${id}/telemetry`);
}

export function getWifiConfig(id: string) {
  return request<WifiConfig>(`/terminals/${id}/wifi`);
}

export function getDishConfig(id: string) {
  return request<DishConfig>(`/terminals/${id}/dish`);
}

export function rebootTerminal(id: string) {
  return request<{ message: string }>(`/terminals/${id}/reboot`, { method: 'POST' });
}

export function saveWifiConfig(id: string, config: Partial<WifiConfig>) {
  return request<{ message: string }>(`/terminals/${id}/wifi`, {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}

export function saveDishConfig(id: string, config: Partial<DishConfig>) {
  return request<{ message: string }>(`/terminals/${id}/dish`, {
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
