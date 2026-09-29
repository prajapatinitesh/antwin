import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type TelemetryMode = 'LIVE_DEMO' | 'REPLAY';

export interface StationLiveTelemetry {
  stationId: 'MAITRI' | 'BHARATI';
  temperatureC: number;
  windSpeedKmh: number;
  windSpeedKnots: number;
  windDir: string;
  pressureHpa: number;
  humidityPct: number;
  weatherSeverity: 'NOMINAL' | 'ELEVATED' | 'HIGH';

  // Power & Thermal
  powerDemandKwe: number;
  powerGenerationKwe: number;
  powerMarginPct: number;
  heatingDemandKwth: number;

  // Fuel
  fuelBurnRateLDay: number;
  fuelReserveL: number;
  fuelEnduranceDays: number;

  // Water / Life Support
  waterProductionLDay: number;
  waterStoragePct: number;
  waterIntakeStatus: string;

  // Mission Autonomy
  missionAutonomyDays: number;
  limitingConstraint: string;
  secondaryConstraint: string;

  // Station Specific Details
  specifics: {
    maitriTraceHeatingKw?: number;
    maitriLakeStatus?: string;
    maitriFleetReadyPct?: number;
    bharatiChp1LoadKva?: number;
    bharatiChp2LoadKva?: number;
    bharatiChp3LoadKva?: number;
    bharatiWasteHeatKwth?: number;
    bharatiRoPressureBar?: number;
  };

  // Trend buffer for charts (last 30 points)
  trend: Array<{
    timeStr: string;
    temperatureC: number;
    powerKwe: number;
    fuelLDay: number;
    waterLDay: number;
    autonomyDays: number;
  }>;
}

interface TelemetryContextType {
  telemetryMode: TelemetryMode;
  setTelemetryMode: (mode: TelemetryMode) => void;
  isLiveRunning: boolean;
  liveSpeed: number;
  setLiveSpeed: (speed: number) => void;
  pauseLive: () => void;
  resumeLive: () => void;
  resetLive: () => void;
  liveDemoTimestamp: string;
  secondsElapsed: number;
  maitriLive: StationLiveTelemetry;
  bharatiLive: StationLiveTelemetry;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to LIVE_DEMO as per Phase X and Phase 12 requirements
  const [telemetryMode, setTelemetryMode] = useState<TelemetryMode>('LIVE_DEMO');
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true);
  const [liveSpeed, setLiveSpeed] = useState<number>(1.0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Simulation start anchor
  const startTimeRef = useRef<Date>(new Date());
  const elapsedRef = useRef<number>(0);

  // Formatted Live Demo Timestamp
  const getLiveTimestamp = (offsetSec: number) => {
    const current = new Date(startTimeRef.current.getTime() + offsetSec * 1000);
    const dateStr = current.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${dateStr} ${timeStr} IST`;
  };

  const [liveDemoTimestamp, setLiveDemoTimestamp] = useState<string>(() => getLiveTimestamp(0));

  // Compute correlated deterministic telemetry for Maitri
  const computeMaitriTelemetry = (sec: number, prevTrend: any[]): StationLiveTelemetry => {
    // Deterministic diurnal/wave modulation
    const temp = -24.8 + 2.2 * Math.sin(0.015 * sec) + 0.6 * Math.cos(0.04 * sec);
    const windKmh = 14.2 + 3.8 * Math.cos(0.02 * sec) + 1.2 * Math.sin(0.06 * sec);
    const windKnots = windKmh / 1.852;
    const press = 973.5 + 1.5 * Math.sin(0.008 * sec);
    const humid = 64 + 3 * Math.cos(0.012 * sec);

    // Physical correlations:
    // Cold triggers increased thermal building envelope demand
    const tempDelta = Math.max(0, -20.0 - temp);
    const heatingDemand = 112.0 + tempDelta * 2.4;
    const traceHeating = 7.5 + (windKmh > 18 ? 3.0 : 0);

    // Power demand correlates with heating trace + base station load
    const powerDemand = 62.0 + (heatingDemand - 112.0) * 0.35 + traceHeating * 0.8;
    const powerGen = 125.0; // 2x62.5 kVA gensets online
    const powerMargin = Math.max(12, Math.round(((powerGen - powerDemand) / powerGen) * 100));

    // Fuel burn rate in L/day correlates with total kWe load
    const fuelBurn = 760.0 + (powerDemand - 62.0) * 3.2;
    const fuelReserve = 92400.0 - (sec * (fuelBurn / 86400));
    const fuelEndurance = fuelReserve / fuelBurn;

    // Water utility from Lake Priyadarshini
    const waterIntake = windKmh > 24 ? 'Sub-ice circulation heated (8.2 kW)' : 'Flowing freely (nominal)';
    const waterStorage = 94.5 + 1.5 * Math.sin(0.01 * sec);

    // Mission Autonomy in days = min(energy, fuel, water, spares, logistics)
    const energyEndurance = (powerMargin / 100) * 18.0;
    const waterEndurance = (waterStorage / 100) * 16.0;
    const sparesEndurance = 14.0;
    const logisticsEndurance = 12.0;

    const constraints = [
      { name: 'Fuel Reserves', days: fuelEndurance },
      { name: 'Power Bus Margin', days: energyEndurance },
      { name: 'Lake Water Storage', days: waterEndurance },
      { name: 'Critical Spares', days: sparesEndurance },
      { name: 'Logistics Window', days: logisticsEndurance }
    ];
    constraints.sort((a, b) => a.days - b.days);

    const autonomyDays = Math.max(4.0, Math.round(constraints[0].days * 10) / 10);

    const nowTime = new Date(startTimeRef.current.getTime() + sec * 1000);
    const timeStr = nowTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newPoint = {
      timeStr,
      temperatureC: Math.round(temp * 10) / 10,
      powerKwe: Math.round(powerDemand * 10) / 10,
      fuelLDay: Math.round(fuelBurn),
      waterLDay: 1450,
      autonomyDays
    };

    const nextTrend = [...prevTrend, newPoint].slice(-30);

    return {
      stationId: 'MAITRI',
      temperatureC: Math.round(temp * 10) / 10,
      windSpeedKmh: Math.round(windKmh * 10) / 10,
      windSpeedKnots: Math.round(windKnots * 10) / 10,
      windDir: 'ESE',
      pressureHpa: Math.round(press * 10) / 10,
      humidityPct: Math.round(humid),
      weatherSeverity: windKmh > 20 ? 'ELEVATED' : 'NOMINAL',
      powerDemandKwe: Math.round(powerDemand * 10) / 10,
      powerGenerationKwe: powerGen,
      powerMarginPct: powerMargin,
      heatingDemandKwth: Math.round(heatingDemand * 10) / 10,
      fuelBurnRateLDay: Math.round(fuelBurn),
      fuelReserveL: Math.round(fuelReserve),
      fuelEnduranceDays: Math.round(fuelEndurance * 10) / 10,
      waterProductionLDay: 1450,
      waterStoragePct: Math.round(waterStorage),
      waterIntakeStatus: waterIntake,
      missionAutonomyDays: autonomyDays,
      limitingConstraint: constraints[0].name,
      secondaryConstraint: constraints[1].name,
      specifics: {
        maitriTraceHeatingKw: Math.round(traceHeating * 10) / 10,
        maitriLakeStatus: waterIntake,
        maitriFleetReadyPct: 92
      },
      trend: nextTrend
    };
  };

  // Compute correlated deterministic telemetry for Bharati
  const computeBharatiTelemetry = (sec: number, prevTrend: any[]): StationLiveTelemetry => {
    // Distinct Larsemann Hills coastal microclimate
    const temp = -21.3 + 1.8 * Math.sin(0.018 * sec + 1.2) + 0.5 * Math.cos(0.035 * sec);
    const windKmh = 9.4 + 3.2 * Math.cos(0.025 * sec + 0.8);
    const windKnots = windKmh / 1.852;
    const press = 982.8 + 1.8 * Math.cos(0.009 * sec);
    const humid = 71 + 2 * Math.sin(0.014 * sec);

    // Thermal demand across Bharati main architectural envelope (capacity 47)
    const tempDelta = Math.max(0, -18.0 - temp);
    const heatingDemand = 138.0 + tempDelta * 2.8;

    // Bharati 3x100 kVA Combined Heat & Power (CHP) Units
    // Units 1 and 2 operate in shared dispatch; Unit 3 is on hot standby
    const powerDemand = 78.0 + (heatingDemand - 138.0) * 0.25;
    const chp1Load = Math.round((powerDemand * 0.52) * 10) / 10;
    const chp2Load = Math.round((powerDemand * 0.48) * 10) / 10;
    const wasteHeat = Math.round((chp1Load + chp2Load) * 0.85 * 10) / 10;

    const totalKva = 200.0;
    const powerMargin = Math.max(15, Math.round(((totalKva - powerDemand) / totalKva) * 100));

    // Jet A-1 fuel consumption in 300,000 L class farm
    const fuelBurn = 890.0 + (powerDemand - 78.0) * 3.5;
    const fuelReserve = 296400.0 - (sec * (fuelBurn / 86400));
    const fuelEndurance = fuelReserve / fuelBurn;

    // Quilty Bay Seawater Intake & Reverse Osmosis (RO) Desalination
    const roOutput = 2850 + Math.round(50 * Math.sin(0.03 * sec));
    const pumpPressure = 58.5 + 1.2 * Math.cos(0.02 * sec);
    const waterStorage = 95.0 + 2.0 * Math.cos(0.008 * sec);

    // Mission Autonomy in days = min(energy, fuel, water, spares, logistics)
    const energyEndurance = (powerMargin / 100) * 22.0;
    const waterEndurance = (waterStorage / 100) * 19.0;
    const sparesEndurance = 18.0;
    const logisticsEndurance = 14.5;

    const constraints = [
      { name: 'Jet A-1 Fuel Farm', days: fuelEndurance },
      { name: 'CHP Electrical Bus', days: energyEndurance },
      { name: 'Quilty Bay RO Storage', days: waterEndurance },
      { name: 'Critical Spares Margin', days: sparesEndurance },
      { name: 'Maritime Resupply Corridor', days: logisticsEndurance }
    ];
    constraints.sort((a, b) => a.days - b.days);

    const autonomyDays = Math.max(5.0, Math.round(constraints[0].days * 10) / 10);

    const nowTime = new Date(startTimeRef.current.getTime() + sec * 1000);
    const timeStr = nowTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newPoint = {
      timeStr,
      temperatureC: Math.round(temp * 10) / 10,
      powerKwe: Math.round(powerDemand * 10) / 10,
      fuelLDay: Math.round(fuelBurn),
      waterLDay: roOutput,
      autonomyDays
    };

    const nextTrend = [...prevTrend, newPoint].slice(-30);

    return {
      stationId: 'BHARATI',
      temperatureC: Math.round(temp * 10) / 10,
      windSpeedKmh: Math.round(windKmh * 10) / 10,
      windSpeedKnots: Math.round(windKnots * 10) / 10,
      windDir: 'NE',
      pressureHpa: Math.round(press * 10) / 10,
      humidityPct: Math.round(humid),
      weatherSeverity: windKmh > 16 ? 'ELEVATED' : 'NOMINAL',
      powerDemandKwe: Math.round(powerDemand * 10) / 10,
      powerGenerationKwe: totalKva,
      powerMarginPct: powerMargin,
      heatingDemandKwth: Math.round(heatingDemand * 10) / 10,
      fuelBurnRateLDay: Math.round(fuelBurn),
      fuelReserveL: Math.round(fuelReserve),
      fuelEnduranceDays: Math.round(fuelEndurance * 10) / 10,
      waterProductionLDay: roOutput,
      waterStoragePct: Math.round(waterStorage),
      waterIntakeStatus: 'Quilty Bay Seawater Intake active (4.2°C)',
      missionAutonomyDays: autonomyDays,
      limitingConstraint: constraints[0].name,
      secondaryConstraint: constraints[1].name,
      specifics: {
        bharatiChp1LoadKva: chp1Load,
        bharatiChp2LoadKva: chp2Load,
        bharatiChp3LoadKva: 0.0, // Hot standby
        bharatiWasteHeatKwth: wasteHeat,
        bharatiRoPressureBar: Math.round(pumpPressure * 10) / 10
      },
      trend: nextTrend
    };
  };

  // State holders for live station telemetry
  const [maitriLive, setMaitriLive] = useState<StationLiveTelemetry>(() => computeMaitriTelemetry(0, []));
  const [bharatiLive, setBharatiLive] = useState<StationLiveTelemetry>(() => computeBharatiTelemetry(0, []));

  // Central simulation heartbeat timer (advances simulated clock)
  useEffect(() => {
    if (!isLiveRunning) return;

    const intervalMs = Math.max(400, Math.floor(1000 / Math.max(0.5, liveSpeed)));

    const timer = setInterval(() => {
      elapsedRef.current += 1.0;
      setSecondsElapsed(elapsedRef.current);

      setLiveDemoTimestamp(getLiveTimestamp(elapsedRef.current));

      setMaitriLive(prev => computeMaitriTelemetry(elapsedRef.current, prev.trend));
      setBharatiLive(prev => computeBharatiTelemetry(elapsedRef.current, prev.trend));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isLiveRunning, liveSpeed]);

  const pauseLive = () => setIsLiveRunning(false);
  const resumeLive = () => setIsLiveRunning(true);
  const resetLive = () => {
    startTimeRef.current = new Date();
    elapsedRef.current = 0;
    setSecondsElapsed(0);
    setLiveDemoTimestamp(getLiveTimestamp(0));
    setMaitriLive(computeMaitriTelemetry(0, []));
    setBharatiLive(computeBharatiTelemetry(0, []));
  };

  return (
    <TelemetryContext.Provider
      value={{
        telemetryMode,
        setTelemetryMode,
        isLiveRunning,
        liveSpeed,
        setLiveSpeed,
        pauseLive,
        resumeLive,
        resetLive,
        liveDemoTimestamp,
        secondsElapsed,
        maitriLive,
        bharatiLive
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextType => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
