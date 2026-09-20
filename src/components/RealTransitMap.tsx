import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Maximize2, 
  Layers, 
  Crosshair, 
  ShieldCheck, 
  Radio, 
  Info,
  MapPin,
  Sparkles
} from 'lucide-react';
import { TransitTelemetry, EmergencyRequest } from '../types';

interface RealTransitMapProps {
  request: EmergencyRequest;
  telemetry: TransitTelemetry;
  carrierMode: 'ambulance' | 'drone';
  onAdvanceStep?: () => void;
}

// Realistic GPS route path points (Pune Medical Corridor: Sassoon Blood Bank -> Ruby Hall Clinic / Poona Trauma)
const REAL_ROUTE_COORDINATES: [number, number][] = [
  [18.5274, 73.8737], // Sassoon Blood Bank (Origin)
  [18.5288, 73.8745], // Dr. Ambedkar Road Junction
  [18.5302, 73.8760], // Pune Railway Station Outer Approach
  [18.5318, 73.8775], // Dhole Patil Road Green Corridor Crossing
  [18.5335, 73.8791], // Bund Garden Flyover Approach
  [18.5348, 73.8805], // Ruby Hall Clinic & Neuro Trauma ICU (Destination)
];

export const RealTransitMap: React.FC<RealTransitMapProps> = ({
  request,
  telemetry,
  carrierMode,
  onAdvanceStep,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [mapStyle, setMapStyle] = useState<'osm' | 'carto_light' | 'carto_dark'>('osm');

  // Calculate position along the route based on completed checkpoints
  const totalCheckpoints = telemetry.routeCheckpoints.length || 5;
  const completedCheckpoints = telemetry.routeCheckpoints.filter(c => c.completed).length;
  const progressRatio = Math.min(1, Math.max(0, completedCheckpoints / totalCheckpoints));

  // Determine current interpolated coordinates
  const totalSegments = REAL_ROUTE_COORDINATES.length - 1;
  const exactIndex = progressRatio * totalSegments;
  const lowerIdx = Math.floor(exactIndex);
  const upperIdx = Math.min(totalSegments, Math.ceil(exactIndex));
  const segmentFraction = exactIndex - lowerIdx;

  const currentLat =
    REAL_ROUTE_COORDINATES[lowerIdx][0] +
    (REAL_ROUTE_COORDINATES[upperIdx][0] - REAL_ROUTE_COORDINATES[lowerIdx][0]) * segmentFraction;
  const currentLng =
    REAL_ROUTE_COORDINATES[lowerIdx][1] +
    (REAL_ROUTE_COORDINATES[upperIdx][1] - REAL_ROUTE_COORDINATES[lowerIdx][1]) * segmentFraction;

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startPos = REAL_ROUTE_COORDINATES[0];
    const map = L.map(mapContainerRef.current, {
      center: [18.5310, 73.8770],
      zoom: 15,
      zoomControl: false,
    });

    // Tile Layer based on active mapStyle
    const tileUrls = {
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      carto_light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      carto_dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    const tiles = L.tileLayer(tileUrls[mapStyle], {
      attribution: '&copy; OpenStreetMap contributors | MEDITECH GPS',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Green Corridor Route Polyline
    const polyline = L.polyline(REAL_ROUTE_COORDINATES, {
      color: '#10b981', // Emerald green corridor
      weight: 6,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);
    routeLineRef.current = polyline;

    // Origin Marker (Blood Bank)
    const bloodBankIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; background: rgba(2, 132, 199, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background: #0284c7; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <span style="color: white; font-size: 13px; font-weight: 900;">🏥</span>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker(REAL_ROUTE_COORDINATES[0], { icon: bloodBankIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <b style="color: #0284c7;">Origin Blood Bank:</b><br/>
          ${request.matchedSourceName || 'Sassoon Apex Blood Bank'}<br/>
          <span style="color: #64748b; font-size: 11px;">Units Prepared & Dispatched</span>
        </div>
      `);

    // Destination Marker (Hospital Trauma Center)
    const hospitalIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 38px; height: 38px; background: rgba(225, 29, 72, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; background: #e11d48; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <span style="color: white; font-size: 14px; font-weight: 900;">🚨</span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(REAL_ROUTE_COORDINATES[REAL_ROUTE_COORDINATES.length - 1], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <b style="color: #e11d48;">Emergency Destination:</b><br/>
          ${request.hospitalName}<br/>
          <span style="color: #64748b; font-size: 11px;">ICU Critical Resuscitation Bay</span>
        </div>
      `);

    // Moving Blood Transit Vehicle (Ambulance / Drone) Marker
    const vehicleIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; -top: 18px; background: #0f172a; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid #38bdf8; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
            ${carrierMode === 'drone' ? '🛸 DRONE-01' : '🚑 TRANSIT TRUCK'}
          </div>
          <div style="width: 36px; height: 36px; background: #0f172a; border: 2.5px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(16, 185, 129, 0.8);">
            <span style="font-size: 18px;">${carrierMode === 'drone' ? '🛸' : '🚑'}</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const truckMarker = L.marker([currentLat, currentLng], { icon: vehicleIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5;">
          <b style="color: #10b981;">MEDITECH Transit Unit #ER-409</b><br/>
          Speed: <b>${telemetry.currentSpeedKmh} km/h</b><br/>
          Cold-Chain Temp: <b>${telemetry.coldChainTempCelsius}°C</b><br/>
          ETA Remaining: <b>${telemetry.etaMinutes} mins</b>
        </div>
      `);
    truckMarkerRef.current = truckMarker;

    mapInstanceRef.current = map;

    // Resize observer to ensure Leaflet renders correctly when container dimensions settle
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update vehicle marker position whenever telemetry progress or coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !truckMarkerRef.current) return;

    truckMarkerRef.current.setLatLng([currentLat, currentLng]);

    // Update vehicle marker icon depending on carrier mode
    const vehicleIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; top: -20px; background: #0f172a; color: #38bdf8; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid #38bdf8; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
            ${carrierMode === 'drone' ? '🛸 DRONE-01' : '🚑 BLOOD TRUCK'} • ${telemetry.distanceRemainingKm}km
          </div>
          <div style="width: 36px; height: 36px; background: #0f172a; border: 2.5px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(16, 185, 129, 0.8);">
            <span style="font-size: 18px;">${carrierMode === 'drone' ? '🛸' : '🚑'}</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    truckMarkerRef.current.setIcon(vehicleIcon);

    // Pan map to follow truck if near end or mid-flight
    mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true, duration: 0.8 });
  }, [currentLat, currentLng, carrierMode, telemetry.distanceRemainingKm, telemetry.currentSpeedKmh]);

  // Handle Layer Style change
  const handleChangeMapStyle = (style: 'osm' | 'carto_light' | 'carto_dark') => {
    setMapStyle(style);
    if (!mapInstanceRef.current) return;

    const tileUrls = {
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      carto_light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      carto_dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    // Remove existing tile layer and apply new
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrls[style], {
      attribution: '&copy; OpenStreetMap contributors | MEDITECH GPS',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  };

  const handleCenterOnTruck = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLat, currentLng], 16, { animate: true });
    }
  };

  const handleFitEntireRoute = () => {
    if (mapInstanceRef.current && routeLineRef.current) {
      mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full min-h-[380px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      {/* Real Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        id="real-leaflet-transit-map"
        className="w-full h-full min-h-[380px] z-0"
        style={{ minHeight: '380px', height: '100%', width: '100%' }}
      />

      {/* Floating Tactical Overlay Controls (Top-Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        {/* Active Clearance Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold text-emerald-300">
            {carrierMode === 'drone' ? 'Aerial Drone Flight Corridor' : 'Active Green Corridor Clearance'}
          </span>
        </div>

        {/* Live GPS Coordinates display */}
        <div className="bg-slate-900/80 backdrop-blur-sm text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/80 text-[10px] font-mono">
          GPS: {currentLat.toFixed(5)}°N, {currentLng.toFixed(5)}°E
        </div>
      </div>

      {/* Floating Tactical Overlay Controls (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2">
        <button
          type="button"
          onClick={handleCenterOnTruck}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-md border border-slate-200 flex items-center space-x-1.5 cursor-pointer transition"
          title="Center on Moving Transit Vehicle"
        >
          <Crosshair className="w-3.5 h-3.5 text-rose-600" />
          <span>Track Truck</span>
        </button>

        <button
          type="button"
          onClick={handleFitEntireRoute}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-md border border-slate-200 flex items-center space-x-1.5 cursor-pointer transition"
          title="Fit Full Emergency Transit Path"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
          <span>Full Route</span>
        </button>

        {/* Map Layer Style Selector */}
        <div className="bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-md flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleChangeMapStyle('osm')}
            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
              mapStyle === 'osm' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => handleChangeMapStyle('carto_dark')}
            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
              mapStyle === 'carto_dark' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Night Radar
          </button>
        </div>
      </div>

      {/* Real-time Progress Bar at Bottom of Map */}
      <div className="absolute bottom-0 left-0 right-0 z-[999] bg-slate-900/90 backdrop-blur-md px-4 py-2 border-t border-slate-700/80 flex items-center justify-between text-white text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-rose-400">
            {request.matchedSourceName || 'Sassoon Blood Bank'}
          </span>
          <span className="text-slate-400">➔</span>
          <span className="font-bold text-emerald-400">
            {request.hospitalName}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-mono text-[11px]">
            {Math.round(progressRatio * 100)}% Traversed
          </span>
          <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
