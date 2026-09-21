import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Navigation, 
  Layers, 
  ExternalLink, 
  Compass, 
  Radio,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Session, SessionRecordBundle } from '../types';
import { MapComponent } from './MapComponent';

interface MapViewProps {
  sessions: Session[];
  activeBundle: SessionRecordBundle | null;
  onSelectSession: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  sessions,
  activeBundle,
  onSelectSession
}) => {
  const [showComparison, setShowComparison] = useState(true);

  const location = activeBundle?.location;
  const network = activeBundle?.network;
  const session = activeBundle?.session;

  const hasGps = location && location.status === 'granted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Geolocation Visualizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Geographic Intelligence Map
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Real-time geospatial visualization comparing high-precision browser GPS locks against coarse Autonomous System IP-derived routing nodes.
          </p>
        </div>

        {/* Comparison Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded text-cyan-500 bg-slate-950 border-slate-700"
            />
            <span>Compare GPS vs IP Node</span>
          </label>
        </div>
      </div>

      {/* Main Coordinate Cards & Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Session Selector & Telemetry Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Active Geolocation Target
            </span>

            <select
              value={session?.id || ''}
              onChange={(e) => onSelectSession(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 outline-none cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_name} ({s.status})
                </option>
              ))}
            </select>

            {session && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID:</span>
                  <span className="text-slate-300 select-all">{session.id.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Status:</span>
                  <span className={hasGps ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {location?.status ? location.status.toUpperCase() : 'NO FIX'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="text-cyan-300">
                    {hasGps ? `±${location?.accuracy} meters` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-400 text-[11px]">
                    {location?.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Education Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-900/50 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Geographic Precision Note</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Browser GPS:</strong> Obtains physical satellite/Wi-Fi positioning (typically ±5m to ±30m accuracy) strictly upon user consent.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              <strong>IP Geolocation:</strong> Derived from public BGP routing databases (typically ±10km to ±50km accuracy).
            </p>
          </div>
        </div>

        {/* Right Side: Map Canvas (Section 9 Requirement) */}
        <div className="lg:col-span-3">
          <MapComponent
            gpsLat={hasGps ? location?.latitude : null}
            gpsLng={hasGps ? location?.longitude : null}
            gpsAccuracy={location?.accuracy}
            ipLat={network?.ip_latitude || 37.3861}
            ipLng={network?.ip_longitude || -122.0839}
            height="520px"
            zoom={hasGps ? 14 : 11}
            sessionName={session?.session_name}
            showComparison={showComparison}
          />
        </div>
      </div>
    </div>
  );
};
