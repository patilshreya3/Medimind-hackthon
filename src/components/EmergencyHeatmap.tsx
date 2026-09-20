import React, { useState } from 'react';
import { 
  Map, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Hospital, 
  Users, 
  Building2, 
  Droplet,
  Info,
  Radio
} from 'lucide-react';
import { HeatmapZone, BloodBank, Donor } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EmergencyHeatmapProps {
  zones: HeatmapZone[];
  bloodBanks: BloodBank[];
  donors: Donor[];
}

export const EmergencyHeatmap: React.FC<EmergencyHeatmapProps> = ({
  zones,
  bloodBanks,
  donors,
}) => {
  const { t, language } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<HeatmapZone>(zones[0]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredZones = zones.filter(z => filterLevel === 'all' || z.demandLevel === filterLevel);

  const totalRequests = zones.reduce((acc, z) => acc + z.activeRequestsCount, 0);
  const totalBanks = bloodBanks.length;
  const totalDonors = donors.length + 38; // Active network size
  const allCriticalShortages = Array.from(new Set(zones.flatMap(z => z.criticalShortages)));

  return (
    <div className="space-y-6 font-sans">
      {/* City Overview Metric Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                <Map className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('heatmapTitle')}
              </h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>PUNE METRO LIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('heatmapDesc')}
            </p>
          </div>

          {/* Demand Filter Pills */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterLevel === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Zones
            </button>
            <button
              onClick={() => setFilterLevel('high')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                filterLevel === 'high' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span>🔴 High Demand</span>
            </button>
            <button
              onClick={() => setFilterLevel('medium')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                filterLevel === 'medium' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span>🟠 Medium Demand</span>
            </button>
            <button
              onClick={() => setFilterLevel('low')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                filterLevel === 'low' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>🟢 High Availability</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
            <div className="text-[10px] font-bold text-rose-700 uppercase">1. Active Requests</div>
            <div className="text-2xl font-black text-rose-900 mt-0.5">{totalRequests + 6}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">Critical city trauma & dengue cases</div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="text-[10px] font-bold text-blue-700 uppercase">2. Blood Banks Online</div>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{totalBanks + 4}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">Verified apex & charitable centers</div>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
            <div className="text-[10px] font-bold text-purple-700 uppercase">3. Verified Donors Ready</div>
            <div className="text-2xl font-black text-purple-900 mt-0.5">{totalDonors}</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Standby within 10 km corridor</div>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <div className="text-[10px] font-bold text-amber-700 uppercase">4. Critical Shortages</div>
            <div className="flex items-center space-x-1.5 mt-1">
              {allCriticalShortages.map(bg => (
                <span key={bg} className="px-2 py-0.5 bg-rose-600 text-white font-extrabold rounded text-xs">
                  {bg}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-amber-700 mt-1">Scarcity alerts active</div>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas + Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Simulated Geospatial Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-md p-4 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs flex items-center space-x-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span className="font-bold">Pune Metropolitan Urban Transit Grid</span>
          </div>

          <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>High Demand</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>High Stock</span>
            </div>
          </div>

          {/* SVG Map Layout */}
          <div className="w-full h-full flex items-center justify-center relative my-6">
            <svg viewBox="0 0 800 480" className="w-full h-auto max-h-[420px]">
              <defs>
                {/* Radial Gradients for Heat zones */}
                <radialGradient id="heatRed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.55" />
                  <stop offset="70%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatAmber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatGreen" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* City Map Roads Network (SVG Lines) */}
              <g stroke="#334155" strokeWidth="1.5" opacity="0.6">
                <path d="M 120,80 L 320,190 L 460,230 L 680,260" strokeDasharray="4 4" />
                <path d="M 460,60 L 460,230 L 440,390 L 520,440" />
                <path d="M 220,380 L 340,300 L 460,230 L 640,160" />
                <path d="M 280,120 L 460,230 L 620,380" />
                <circle cx="460" cy="230" r="160" fill="none" stroke="#1e293b" strokeWidth="1" />
                <circle cx="460" cy="230" r="280" fill="none" stroke="#1e293b" strokeWidth="1" />
              </g>

              {/* Zone 1: Central Trauma Zone (Camp / Sassoon / Ruby Hall) - RED */}
              <g onClick={() => setSelectedZone(zones[0])} className="cursor-pointer">
                <circle cx="460" cy="230" r="110" fill="url(#heatRed)" />
                <circle cx="460" cy="230" r="12" fill="#e11d48" className="animate-ping" opacity="0.3" />
                <circle cx="460" cy="230" r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                <text x="460" y="210" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                  Central Trauma Zone (Ruby/Sassoon)
                </text>
                <text x="460" y="258" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="bold">
                  🔴 6 Critical Requests | O-, B- Deficit
                </text>
              </g>

              {/* Zone 2: West Corridor (Kothrud / Deccan) - AMBER */}
              <g onClick={() => setSelectedZone(zones[1])} className="cursor-pointer">
                <circle cx="270" cy="290" r="85" fill="url(#heatAmber)" />
                <circle cx="270" cy="290" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="270" y="275" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  West Corridor (Kothrud/Deccan)
                </text>
                <text x="270" y="315" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">
                  🟠 3 Requests | AB- Shortage
                </text>
              </g>

              {/* Zone 3: IT Corridor (Hinjewadi / Wakad / Baner) - GREEN */}
              <g onClick={() => setSelectedZone(zones[2])} className="cursor-pointer">
                <circle cx="180" cy="130" r="95" fill="url(#heatGreen)" />
                <circle cx="180" cy="130" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="180" y="115" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  IT Corridor (Hinjewadi/Baner)
                </text>
                <text x="180" y="155" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold">
                  🟢 High Stock Reserve (34 Donors)
                </text>
              </g>

              {/* Zone 4: East Sector (Hadapsar / Magarpatta) - AMBER */}
              <g onClick={() => setSelectedZone(zones[3])} className="cursor-pointer">
                <circle cx="650" cy="270" r="85" fill="url(#heatAmber)" />
                <circle cx="650" cy="270" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="650" y="255" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  East Sector (Hadapsar)
                </text>
                <text x="650" y="295" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">
                  🟠 2 Requests | O- Deficit
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Bar Info */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Click on any zone circle above to inspect local shortages & hospitals</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold text-[11px]">
              TELEMETRY: OPTIMAL
            </span>
          </div>
        </div>

        {/* Right 1 Col: Selected Zone Drill-Down Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Zone Inspection
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {language === 'hi' ? selectedZone.hindiName : selectedZone.name}
                </h3>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                selectedZone.demandLevel === 'high'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : selectedZone.demandLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {selectedZone.demandLevel} Demand
              </span>
            </div>

            {/* Critical Scarcity Alert Box */}
            <div className="mt-4 p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Critical Blood Group Shortages</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedZone.criticalShortages.length > 0 ? (
                  selectedZone.criticalShortages.map(bg => (
                    <span key={bg} className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded shadow-xs">
                      {bg} Deficit
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No critical shortages in this sector</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-700/90 mt-2 leading-tight">
                Hospitals in this sector are actively requesting inter-hospital transfers.
              </p>
            </div>

            {/* Local Stats Breakdown */}
            <div className="mt-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center space-x-2">
                  <Hospital className="w-4 h-4 text-slate-500" />
                  <span>Active Emergency Requests</span>
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedZone.activeRequestsCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Licensed Blood Banks</span>
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedZone.bloodBanksCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Verified Standby Donors</span>
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {selectedZone.verifiedDonorsCount}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg text-[11px] text-slate-600 dark:text-slate-400">
              <strong>Clinical Operations Note:</strong> Allows municipal health departments and trauma centers to preemptively reroute ambulances away from depleted blood banks to well-stocked zones.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
