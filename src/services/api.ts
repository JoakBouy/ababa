/**
 * Frontend API service layer.
 * All calls go to the Python FastAPI backend at /api (proxied by Vite in dev).
 * Falls back to mock data if the backend is unreachable.
 */

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
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

export interface LoginResponse {
  email: string;
  name: string;
  role: string;
}

export function authLogin(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ─── Terminals ───────────────────────────────────────────────────────────────

export interface Terminal {
  id: string;
  account_id: string;
  account_email: string;
  loc: string;
  coords: [number, number];
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  data_usage_gb: number;
  latency_ms: number | null;
  connected_devices: number;
  uptime_percent: number;
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

export interface FleetStats {
  total: number;
  online: number;
  offline: number;
  degraded: number;
  total_data_tb: number;
  avg_uptime_percent: number;
}

export function getFleetStats() {
  return request<FleetStats>('/analytics/fleet-stats');
}

// ─── Starlink Accounts ───────────────────────────────────────────────────────

export interface StarlinkAccount {
  id: number;
  email: string;
  status: string;
  terminal_count: number;
}

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
