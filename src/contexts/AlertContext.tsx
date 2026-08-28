import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playCriticalAlarmSound, playNotificationSound } from '../utils/audioAlert';

export interface FieldAlert {
  id: string;
  kitId: string;
  kitNumber: string;
  location: string;
  state: string;
  client: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  metric?: string;
}

interface AlertContextValue {
  alerts: FieldAlert[];
  unreadCount: number;
  activeBanner: FieldAlert | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  acknowledgeBanner: () => void;
  markAllRead: () => void;
  dismissAlert: (id: string) => void;
  triggerSimulatedAlert: (customAlert?: Partial<FieldAlert>) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

const SIMULATED_SCENARIOS: Array<Omit<FieldAlert, 'id' | 'timestamp' | 'read' | 'acknowledged'>> = [
  {
    kitId: 'Kit #09 (ABABA-SSD-09)',
    kitNumber: 'Kit #09',
    location: 'Nimule One-Stop Border Post & Customs',
    state: 'Eastern Equatoria',
    client: 'Revenue Authority',
    title: 'High Bandwidth Congestion - Customs Clearing',
    message: 'Heavy morning truck freight traffic at Nimule border crossing caused local router queue saturation. Dynamic QoS prioritization active.',
    severity: 'warning',
    metric: '172 Mbps (98% Cap)',
  },
  {
    kitId: 'Kit #22 (ABABA-SSD-22)',
    kitNumber: 'Kit #22',
    location: 'Pochalla Mineral Exploration Compound',
    state: 'Jonglei',
    client: 'Nile Mining Exploration',
    title: 'Solar Backup Depleted - Kit Offline',
    message: 'Three days of heavy overcast rain in Pochalla drained the secondary battery bank to 14% SOC. Starlink dish entering deep sleep.',
    severity: 'critical',
    metric: '14% Battery SOC',
  },
  {
    kitId: 'Kit #29 (ABABA-SSD-29)',
    kitNumber: 'Kit #29',
    location: 'GPOC Unity Oilfield Central Processing (CPF)',
    state: 'Unity',
    client: 'GPOC Oil Operations',
    title: 'High Thermal Throttling Alert (72°C)',
    message: 'Internal dish thermistor alert at Unity CPF during high daytime temperatures. Automatic thermal dissipation protocol engaged.',
    severity: 'warning',
    metric: '72°C Array Temp',
  },
  {
    kitId: 'Kit #34 (ABABA-SSD-34)',
    kitNumber: 'Kit #34',
    location: 'Mankien Security & Telecom Outpost',
    state: 'Unity',
    client: 'Field Security Ops',
    title: 'Perimeter Power Interrupted - Offline',
    message: 'Mankien outpost generator power tripped. Ababa Group dispatch alerting Unity state maintenance crew for backup switchover.',
    severity: 'critical',
    metric: 'Terminal Offline',
  },
  {
    kitId: 'Kit #37 (ABABA-SSD-37)',
    kitNumber: 'Kit #37',
    location: 'Dar Petroleum Paloch CPF Main Terminal',
    state: 'Upper Nile',
    client: 'Dar Petroleum (DPOC)',
    title: 'Starlink Uplink Restored - Optimal Link',
    message: 'Paloch crude oil telemetry link synchronized to LEO orbital constellation shell. Roundtrip ping settled at 47ms.',
    severity: 'success',
    metric: '182.5 Mbps • 47ms',
  },
  {
    kitId: 'Kit #48 (ABABA-SSD-48)',
    kitNumber: 'Kit #48',
    location: 'Raja Western Frontier Border Post',
    state: 'Western Bahr el Ghazal',
    client: 'Border Defense Unit',
    title: 'Foliage Obstruction Detected on Azimuth',
    message: 'Seasonal forest canopy growth in Raja obstructing northern horizon (18% sky field blocked). Dish re-aiming initiated.',
    severity: 'warning',
    metric: '18% Sky Obstructed',
  },
  {
    kitId: 'Kit #01 (ABABA-SSD-01)',
    kitNumber: 'Kit #01',
    location: 'Ababa Group Master NOC & HQ (Airport Road)',
    state: 'Central Equatoria',
    client: 'Ababa Group Internal',
    title: 'Nationwide Gateway Sync Completed',
    message: 'All 50 Starlink kits across 10 states reported telemetry successfully to Ababa Group Central NOC in Juba.',
    severity: 'success',
    metric: '50/50 Synchronized',
  },
];

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<FieldAlert[]>([
    {
      id: 'initial-alert-1',
      kitId: 'Kit #12 (ABABA-SSD-12)',
      kitNumber: 'Kit #12',
      location: 'Budi Hills Agricultural Research Station',
      state: 'Eastern Equatoria',
      client: 'Agri-Development Fund',
      title: 'Solar Backup Storage Degraded (42% SOC)',
      message: 'Ababa Group remote diagnostic flagged reduced solar panel charging in Budi Hills. Scheduled for battery maintenance.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
      read: false,
      acknowledged: true,
      metric: '42% SOC',
    },
    {
      id: 'initial-alert-2',
      kitId: 'Kit #22 (ABABA-SSD-22)',
      kitNumber: 'Kit #22',
      location: 'Pochalla Mineral Exploration Compound',
      state: 'Jonglei',
      client: 'Nile Mining Exploration',
      title: 'Pochalla Kit Offline - Low Battery',
      message: 'Telemetry lost after prolonged solar storage discharge. Field team notified.',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 42),
      read: false,
      acknowledged: true,
      metric: 'Offline',
    },
  ]);

  const [activeBanner, setActiveBanner] = useState<FieldAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scenarioIndexRef = useRef(0);

  const triggerSimulatedAlert = useCallback((customAlert?: Partial<FieldAlert>) => {
    const scenario = customAlert?.title
      ? {
          kitId: customAlert.kitId || 'Kit #09 (ABABA-SSD-09)',
          kitNumber: customAlert.kitNumber || 'Kit #09',
          location: customAlert.location || 'Nimule Customs Post',
          state: customAlert.state || 'Eastern Equatoria',
          client: customAlert.client || 'Revenue Authority',
          title: customAlert.title,
          message: customAlert.message || 'National fleet telemetry anomaly detected.',
          severity: customAlert.severity || 'critical',
          metric: customAlert.metric || 'Alert Active',
        }
      : SIMULATED_SCENARIOS[scenarioIndexRef.current % SIMULATED_SCENARIOS.length];

    scenarioIndexRef.current += 1;

    const newAlert: FieldAlert = {
      id: `alert-${Date.now()}`,
      kitId: scenario.kitId,
      kitNumber: scenario.kitNumber,
      location: scenario.location,
      state: scenario.state,
      client: scenario.client,
      title: scenario.title,
      message: scenario.message,
      severity: scenario.severity,
      timestamp: new Date(),
      read: false,
      acknowledged: false,
      metric: scenario.metric,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setActiveBanner(newAlert);

    // Play sound if enabled
    if (soundEnabled) {
      if (scenario.severity === 'critical') {
        playCriticalAlarmSound();
      } else {
        playNotificationSound();
      }
    }
  }, [soundEnabled]);

  // Periodic simulated incident trigger (every 35 seconds for live demo presentation)
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      triggerSimulatedAlert();
    }, 15000);

    const intervalTimer = window.setInterval(() => {
      triggerSimulatedAlert();
    }, 35000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalTimer);
    };
  }, [triggerSimulatedAlert]);

  const acknowledgeBanner = useCallback(() => {
    if (activeBanner) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === activeBanner.id ? { ...a, acknowledged: true } : a))
      );
      setActiveBanner(null);
    }
  }, [activeBanner]);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (activeBanner?.id === id) {
      setActiveBanner(null);
    }
  }, [activeBanner]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        activeBanner,
        soundEnabled,
        setSoundEnabled,
        acknowledgeBanner,
        markAllRead,
        dismissAlert,
        triggerSimulatedAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlerts must be used inside AlertProvider');
  }
  return ctx;
}
