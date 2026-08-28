import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playCriticalAlarmSound, playNotificationSound } from '../utils/audioAlert';

export interface FieldAlert {
  id: string;
  kitId: string;
  kitNumber: string;
  location: string;
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
    kitId: 'Kit #07 (ABABA-GPOC-07)',
    kitNumber: 'Kit #07',
    location: 'Well Pad 06 - Charlie Far North',
    title: 'High Thermal Throttling (74°C)',
    message: 'Internal dish thermistor exceeded safety threshold during midday flare operations. Automatic cooling cycle engaged.',
    severity: 'warning',
    metric: '74°C Dish Temp',
  },
  {
    kitId: 'Kit #14 (ABABA-GPOC-14)',
    kitNumber: 'Kit #14',
    location: 'Well Pad 13 - Golf East Sector',
    title: 'Satellite LOS Obstruction Detected',
    message: 'Workover rig crane arm positioned in northern dish azimuth (42° elevation). Link dropped to standby mode.',
    severity: 'critical',
    metric: '92% Sky Obstructed',
  },
  {
    kitId: 'Kit #19 (ABABA-GPOC-19)',
    kitNumber: 'Kit #19',
    location: 'Well Pad 18 - India West Boundary',
    title: 'Solar Backup Low Voltage (16% SOC)',
    message: 'Bluetti solar battery storage reached critical threshold after dust storm reduced panel generation.',
    severity: 'warning',
    metric: '16% Battery SOC',
  },
  {
    kitId: 'Kit #28 (ABABA-GPOC-28)',
    kitNumber: 'Kit #28',
    location: 'Drilling Rig Site 01 (Exploration Alpha)',
    title: 'Drilling Rig SCADA Stream Interrupted',
    message: 'Heavy drill mud pump vibration caused local Ethernet PoE injector reboot. Starlink link reconnecting.',
    severity: 'critical',
    metric: '0 Mbps Telemetry',
  },
  {
    kitId: 'Kit #48 (ABABA-GPOC-48)',
    kitNumber: 'Kit #48',
    location: 'Security Post 01 (North Perimeter)',
    title: 'Perimeter Starlink Offline - Security Alert',
    message: 'Power line disconnection detected at north perimeter checkpoint. Field maintenance team dispatched.',
    severity: 'critical',
    metric: 'Terminal Offline',
  },
  {
    kitId: 'Kit #03 (ABABA-GPOC-03)',
    kitNumber: 'Kit #03',
    location: 'Well Pad 02 - Alpha East',
    title: 'LEO Constellation Handover - Optimal',
    message: 'Seamless satellite handover to Starlink-v2 shell completed. Latency stabilized at 54ms.',
    severity: 'success',
    metric: '13.2 dB SNR',
  },
];

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<FieldAlert[]>([
    {
      id: 'initial-alert-1',
      kitId: 'Kit #07 (ABABA-GPOC-07)',
      kitNumber: 'Kit #07',
      location: 'Well Pad 06 - Charlie Far North',
      title: 'Solar Storage Degraded - 39% SOC',
      message: 'Kit #07 running on limited solar charge. Scheduled for Ababa Group field battery maintenance.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      read: false,
      acknowledged: true,
      metric: '39% SOC',
    },
    {
      id: 'initial-alert-2',
      kitId: 'Kit #14 (ABABA-GPOC-14)',
      kitNumber: 'Kit #14',
      location: 'Well Pad 13 - Golf East Sector',
      title: 'Kit Offline - No Satellite Ping',
      message: 'Telemetry lost. Autonomous diagnostic indicates power loss or obstruction at wellpad.',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
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
          kitId: customAlert.kitId || 'Kit #07 (ABABA-GPOC-07)',
          kitNumber: customAlert.kitNumber || 'Kit #07',
          location: customAlert.location || 'Unity Well Pad 06',
          title: customAlert.title,
          message: customAlert.message || 'Field telemetry anomaly detected.',
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

  // Periodic simulated incident trigger (every 30 seconds for live dynamic demo)
  useEffect(() => {
    // Initial demo trigger after 15 seconds
    const initialTimer = window.setTimeout(() => {
      triggerSimulatedAlert();
    }, 15000);

    // Recurring demo trigger every 35 seconds
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
