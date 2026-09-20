import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Thermometer, 
  BatteryCharging, 
  Gauge, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Radio, 
  Play, 
  Pause, 
  CheckCircle2,
  RefreshCw,
  Zap,
  Building,
  Map as MapIcon
} from 'lucide-react';
import { TransitTelemetry, EmergencyRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { RealTransitMap } from './RealTransitMap';

interface LiveGpsTrackingProps {
  request: EmergencyRequest;
  telemetry: TransitTelemetry;
  onUpdateTelemetry: (updated: TransitTelemetry) => void;
  onConfirmDelivery: () => void;
}

export const LiveGpsTracking: React.FC<LiveGpsTrackingProps> = ({
  request,
  telemetry,
  onUpdateTelemetry,
  onConfirmDelivery,
}) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [carrierMode, setCarrierMode] = useState<'ambulance' | 'drone'>('ambulance');
  const [mapViewMode, setMapViewMode] = useState<'real' | 'schematic'>('real');

  // Progressive simulation of transit telemetry
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      onUpdateTelemetry({
        ...telemetry,
        // Minor realistic temperature jitter within safe range
        coldChainTempCelsius: +(
          (telemetry.coldChainTempCelsius + (Math.random() * 0.2 - 0.1))
        ).toFixed(1),
        currentSpeedKmh: carrierMode === 'drone' ? 68 : Math.max(30, Math.min(65, telemetry.currentSpeedKmh + Math.floor(Math.random() * 5 - 2))),
        batteryLevel: Math.max(20, telemetry.batteryLevel - 0.05),
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isPlaying, telemetry, carrierMode, onUpdateTelemetry]);

  // Step simulation forward
  const handleAdvanceStep = () => {
    const nextCheckpoints = [...telemetry.routeCheckpoints];
    const firstIncompleteIdx = nextCheckpoints.findIndex(c => !c.completed);

    if (firstIncompleteIdx !== -1) {
      nextCheckpoints[firstIncompleteIdx].completed = true;
      nextCheckpoints[firstIncompleteIdx].timestamp = 'Just now';

      const remainingDist = Math.max(0, +(telemetry.distanceRemainingKm - 0.6).toFixed(1));
      const remainingEta = Math.max(1, telemetry.etaMinutes - 2);

      onUpdateTelemetry({
        ...telemetry,
        routeCheckpoints: nextCheckpoints,
        distanceRemainingKm: remainingDist,
        etaMinutes: remainingEta,
      });

      if (remainingDist === 0) {
        onConfirmDelivery();
      }
    } else {
      onConfirmDelivery();
    }
  };

  const isTempOptimal = 
    request.componentType.includes('platelet') 
      ? telemetry.coldChainTempCelsius >= 20.0 && telemetry.coldChainTempCelsius <= 24.0
      : telemetry.coldChainTempCelsius >= 2.0 && telemetry.coldChainTempCelsius <= 6.0;

  // Calculate percentage progress along the checkpoints
  const completedCount = telemetry.routeCheckpoints.filter(c => c.completed).length;
  const progressPct = Math.round((completedCount / telemetry.routeCheckpoints.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
                Live Satellite Telemetry
              </span>
              <span className="text-xs text-slate-400">
                Tracking ID: <span className="font-mono text-slate-200">{request.id}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
              {t('liveTrackingTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {t('liveTrackingSub')}
            </p>
          </div>

          {/* Quick Simulation Bar Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCarrierMode('ambulance')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  carrierMode === 'ambulance' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🚑 Ambulance
              </button>
              <button
                type="button"
                onClick={() => setCarrierMode('drone')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  carrierMode === 'drone' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🛸 Drone Corridor
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Live Stream On' : 'Paused'}</span>
            </button>

            <button
              type="button"
              id="advance-simulation-step-btn"
              onClick={handleAdvanceStep}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{t('simulateTransitStep')}</span>
            </button>
          </div>
        </div>

        {/* 4 Telemetry Metrics Panels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          {/* Temperature Sensor */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                Cold-Chain Temp
              </span>
              <span className={`w-2 h-2 rounded-full ${isTempOptimal ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`}></span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {telemetry.coldChainTempCelsius}°C
            </div>
            <div className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">
              {isTempOptimal ? 'Safe Compliant' : 'Warning: Deviation'}
            </div>
          </div>

          {/* Speed */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Gauge className="w-3.5 h-3.5 text-amber-400 mr-1" />
                {t('transitSpeed')}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {telemetry.currentSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Green Corridor Active
            </div>
          </div>

          {/* Distance Remaining */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Navigation className="w-3.5 h-3.5 text-sky-400 mr-1" />
                {t('distanceLeft')}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {telemetry.distanceRemainingKm} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[10px] text-sky-300 font-medium mt-0.5">
              Direct Emergency Route
            </div>
          </div>

          {/* Live ETA */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {t('liveEta')}
              </span>
            </div>
            <div className="text-xl font-extrabold text-rose-400">
              {telemetry.etaMinutes} <span className="text-xs font-normal text-slate-400">{t('mins')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Traffic priority clearance
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Route Map + Checkpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Canvas (Real Leaflet Street Map or Schematic Radar) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Geospatial Transit Corridor
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Map View Mode Switcher */}
              <div className="bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMapViewMode('real')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                    mapViewMode === 'real' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>Real Street Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('schematic')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                    mapViewMode === 'schematic' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Radar Schematic</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
                Origin: <span className="text-slate-800 dark:text-slate-200 font-bold">{request.matchedSourceName || 'Apex Trauma Blood Bank'}</span>
              </div>
            </div>
          </div>

          {mapViewMode === 'real' ? (
            <div className="flex-1 min-h-[380px] w-full p-2 bg-slate-100">
              <RealTransitMap
                request={request}
                telemetry={telemetry}
                carrierMode={carrierMode}
                onAdvanceStep={handleAdvanceStep}
              />
            </div>
          ) : (
            /* Simulated High-Fidelity SVG Map */
            <div className="relative bg-slate-900 flex-1 min-h-[340px] p-6 flex items-center justify-center overflow-hidden select-none">
              {/* Background Grid Lines representing street layout */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Roads & Transit Route */}
              <svg className="w-full h-full max-w-lg aspect-4/3 relative z-10" viewBox="0 0 500 300">
                {/* Secondary Arterial Roads */}
                <path d="M 20 180 Q 150 200 280 140 T 480 200" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                <path d="M 250 20 Q 240 150 300 280" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                
                {/* Emergency Rapid Transit Corridor (Glow) */}
                <path 
                  d="M 80 220 C 140 180, 200 240, 270 160 S 370 120, 420 80" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="8" 
                  strokeOpacity="0.3" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 80 220 C 140 180, 200 240, 270 160 S 370 120, 420 80" 
                  fill="none" 
                  stroke="#e11d48" 
                  strokeWidth="3" 
                  strokeDasharray="6 4" 
                  strokeLinecap="round" 
                  className="animate-pulse" 
                />

                {/* Start Point: Blood Bank */}
                <g transform="translate(80, 220)">
                  <circle r="14" fill="#0284c7" fillOpacity="0.3" className="animate-ping" />
                  <circle r="9" fill="#0284c7" />
                  <rect x="-24" y="-30" width="48" height="18" rx="4" fill="#0f172a" opacity="0.9" />
                  <text x="0" y="-18" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
                    BLOOD BANK
                  </text>
                </g>

                {/* Destination Point: Hospital Trauma Center */}
                <g transform="translate(420, 80)">
                  <circle r="18" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                  <circle r="11" fill="#e11d48" />
                  <rect x="-30" y="-32" width="60" height="20" rx="4" fill="#0f172a" opacity="0.95" />
                  <text x="0" y="-19" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">
                    HOSPITAL ICU
                  </text>
                </g>

                {/* Dynamic Vehicle Marker Interpolated on Route */}
                {(() => {
                  const tVal = Math.min(0.95, Math.max(0.05, progressPct / 100));
                  const curX = 80 + (420 - 80) * tVal;
                  const curY = 220 + (80 - 220) * tVal + Math.sin(tVal * Math.PI) * -30;

                  return (
                    <g transform={`translate(${curX}, ${curY})`}>
                      <circle r="16" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                      <circle r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <rect x="-38" y="-32" width="76" height="20" rx="4" fill="#022c22" stroke="#10b981" strokeWidth="1" />
                      <text x="0" y="-18" fill="#a7f3d0" fontSize="8" fontWeight="bold" textAnchor="middle">
                        {carrierMode === 'drone' ? '🛸 DRONE EN ROUTE' : '🚑 AMBULANCE'}
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Map overlay telemetry pill */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>GPS Signal: High Precision (GLONASS + NavIC)</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] text-slate-300">
                Corridor Progress: <span className="font-bold text-white">{progressPct}%</span>
              </div>
            </div>
          )}

          {/* Vehicle & Courier Information Row */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs transition-colors">
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">{t('carrierDetails')}:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center mt-0.5">
                <Truck className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" />
                {telemetry.carrierType}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Reg: {telemetry.vehicleNumber}
              </div>
            </div>

            <div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">{t('driverCoordinator')}:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                {telemetry.driverName}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                Direct Comms: {telemetry.driverPhone}
              </div>
            </div>
          </div>
        </div>

        {/* Route Milestones Checkpoints & Delivery Action */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {t('transitWaypoints')}
              </h3>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                {completedCount} of {telemetry.routeCheckpoints.length} Cleared
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {telemetry.routeCheckpoints.map((checkpoint, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {checkpoint.completed ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : idx === completedCount ? (
                      <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs ${checkpoint.completed ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {checkpoint.name}
                    </p>
                    {checkpoint.timestamp && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {checkpoint.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Delivery Button */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="confirm-handover-btn"
              onClick={onConfirmDelivery}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('markDeliveredBtn')}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Validates digital chain-of-custody and updates patient bedside charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
