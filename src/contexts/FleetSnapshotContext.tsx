import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getFleetSnapshot,
  type FleetStats,
  type StarlinkAccount,
  type Terminal,
} from '../services/api';

interface FleetSnapshotState {
  accounts: StarlinkAccount[];
  terminals: Terminal[];
  fleetStats: FleetStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
  refreshFleetSnapshot: (reason?: 'manual' | 'accounts') => Promise<void>;
}

const FleetSnapshotContext = createContext<FleetSnapshotState | null>(null);

function mergeTerminals(previous: Terminal[], next: Terminal[]): Terminal[] {
  const previousById = new Map(previous.map((terminal) => [terminal.id, terminal]));

  return next.map((terminal) => {
    const previousTerminal = previousById.get(terminal.id);
    if (!previousTerminal) {
      return terminal;
    }

    return {
      ...terminal,
      loc: terminal.loc || previousTerminal.loc,
      coords: terminal.coords ?? previousTerminal.coords,
      latency_ms: terminal.latency_ms ?? previousTerminal.latency_ms,
      download_mbps: terminal.download_mbps ?? previousTerminal.download_mbps,
      connected_devices: terminal.connected_devices ?? previousTerminal.connected_devices,
    };
  });
}

function buildFleetStats(terminals: Terminal[], totalDataTb: number): FleetStats {
  const total = terminals.length;
  const online = terminals.filter((terminal) => terminal.status === 'ONLINE').length;
  const offline = terminals.filter((terminal) => terminal.status === 'OFFLINE').length;
  const degraded = terminals.filter((terminal) => terminal.status === 'DEGRADED').length;
  const currentDownload = terminals.reduce((sum, terminal) => sum + (terminal.download_mbps ?? 0), 0);
  const avgUptime = terminals.reduce((sum, terminal) => sum + terminal.uptime_percent, 0) / Math.max(total, 1);

  return {
    total,
    online,
    offline,
    degraded,
    total_data_tb: totalDataTb,
    current_download_mbps: Number(currentDownload.toFixed(1)),
    avg_uptime_percent: Number(avgUptime.toFixed(1)),
  };
}

export function FleetSnapshotProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<StarlinkAccount[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const inFlightRef = useRef(false);
  const loadSnapshotRef = useRef<((reason: 'initial' | 'accounts' | 'manual', showLoader: boolean) => Promise<void>) | null>(null);
  const terminalsRef = useRef<Terminal[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot(
      reason: 'initial' | 'accounts' | 'manual',
      showLoader: boolean,
    ) {
      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      setIsRefreshing(true);
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const snapshot = await getFleetSnapshot();
        if (cancelled) {
          return;
        }
        const mergedTerminals = mergeTerminals(terminalsRef.current, snapshot.terminals);
        terminalsRef.current = mergedTerminals;
        setAccounts(snapshot.accounts);
        setTerminals(mergedTerminals);
        setFleetStats(buildFleetStats(mergedTerminals, snapshot.fleet_stats.total_data_tb));
        setLastUpdatedAt(Date.now());
        setIsLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load live fleet data.');
        setIsLoading(false);
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
        inFlightRef.current = false;
      }
    }

    loadSnapshotRef.current = loadSnapshot;

    const refreshOnAccountsChange = () => {
      void loadSnapshot('accounts', false);
    };

    void loadSnapshot('initial', true);

    window.addEventListener('starlink-accounts-changed', refreshOnAccountsChange);

    return () => {
      cancelled = true;
      loadSnapshotRef.current = null;
      window.removeEventListener('starlink-accounts-changed', refreshOnAccountsChange);
    };
  }, []);

  const value = useMemo<FleetSnapshotState>(() => ({
    accounts,
    terminals,
    fleetStats,
    isLoading,
    isRefreshing,
    error,
    lastUpdatedAt,
    refreshFleetSnapshot: async (reason = 'manual') => {
      await loadSnapshotRef.current?.(reason, false);
    },
  }), [accounts, terminals, fleetStats, isLoading, isRefreshing, error, lastUpdatedAt]);

  return (
    <FleetSnapshotContext.Provider value={value}>
      {children}
    </FleetSnapshotContext.Provider>
  );
}

export function useFleetSnapshot() {
  const ctx = useContext(FleetSnapshotContext);
  if (!ctx) {
    throw new Error('useFleetSnapshot must be used inside FleetSnapshotProvider');
  }
  return ctx;
}
