import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  MapPin, 
  Compass, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Radio, 
  FileText, 
  Printer, 
  CheckCircle2, 
  XCircle,
  Play
} from 'lucide-react';
import { SessionRecordBundle, Session } from '../types';
import { MapComponent } from './MapComponent';

interface LiveSessionViewProps {
  bundle: SessionRecordBundle | null;
  onRefresh: () => void;
  onOpenDemo: (sessionId: string) => void;
  onSwitchSession: (sessionId: string) => void;
  allSessions: Session[];
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({
  bundle,
  onRefresh,
  onOpenDemo,
  onSwitchSession,
  allSessions
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!bundle) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white">No Session Selected</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Select an active or completed session from the dropdown above, or launch a new security demonstration.
        </p>
      </div>
    );
  }

  const { session, consent, device, network, location, logs } = bundle;
  const demoUrl = `${window.location.origin}/session/${session.id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(demoUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(session.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`/api/sessions/${session.id}/export?format=${format}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate Data Completeness Percentage
  let totalFields = 16;
  let filledFields = 0;

  if (device?.operating_system && !device.operating_system.includes('Unknown')) filledFields++;
  if (device?.platform && !device.platform.includes('Unknown')) filledFields++;
  if (device?.cpu_cores && device.cpu_cores !== 'Unavailable') filledFields++;
  if (device?.browser && !device.browser.includes('Unknown')) filledFields++;
  if (device?.screen_resolution) filledFields++;
  if (device?.timezone) filledFields++;
  if (device?.language) filledFields++;
  if (device?.gpu_renderer && !device.gpu_renderer.includes('Unavailable')) filledFields++;
  if (device?.device_memory && !String(device.device_memory).includes('Unavailable')) filledFields++;
  if (network?.public_ip) filledFields++;
  if (network?.isp) filledFields++;
  if (network?.organization) filledFields++;
  if (network?.country) filledFields++;
  if (network?.city) filledFields++;
  if (location?.status === 'granted') {
    filledFields += 2; // lat + lng
  } else {
    filledFields += 1;
  }

  const completenessPercent = Math.min(100, Math.round((filledFields / totalFields) * 100));

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Session Title Bar */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                session.status === 'completed'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : session.status === 'active'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-cyan-400' : session.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {session.status.toUpperCase()}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Consent: {consent?.consent_given ? 'Granted' : 'Pending'}
              </span>

              <span className="text-xs text-slate-400">
                Template: <span className="capitalize text-slate-200">{session.template.replace(/_/g, ' ')}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {session.session_name}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              {session.description || 'Authorized device audit and telemetry analysis.'}
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Download JSON Telemetry"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Download CSV Audit Record"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Print Dossier"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>
            <button
              onClick={() => onOpenDemo(session.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Session ID & Collection Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ID:</span>
            <span className="text-cyan-300 font-mono font-medium truncate select-all">{session.id}</span>
            <button onClick={handleCopyId} className="p-1 hover:text-white text-slate-400" title="Copy ID">
              {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Time:</span>
            <span className="text-slate-200 font-mono">
              {device?.timestamp ? new Date(device.timestamp).toLocaleString() : new Date(session.created_at).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-start sm:justify-end">
            <span className="text-slate-400">Visits:</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-semibold">
              {session.views_count}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completeness Meter */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Data Completeness</span>
            <span className="text-cyan-400 font-bold font-mono">{completenessPercent}%</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {filledFields} of {totalFields} technical metrics collected
            </p>
          </div>
        </div>

        {/* Permission Status */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">
            Permission Status
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <div className={`p-1.5 rounded-lg ${
              location?.status === 'granted' 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {location?.status === 'granted' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">
                {location?.status === 'granted' ? 'Geolocation Granted' : 'Declined / IP Fallback'}
              </p>
              <p className="text-[11px] text-slate-400">
                {location?.status === 'granted' 
                  ? `Accuracy radius: ±${location.accuracy}m` 
                  : 'Operating in coarse IP estimate mode'}
              </p>
            </div>
          </div>
        </div>

        {/* Geographic Accuracy Differentiation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">
            Accuracy Differentiation
          </div>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Browser GPS:</span>
              <span className={location?.status === 'granted' ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {location?.status === 'granted' ? 'Hardware Lock (Exact)' : 'Not Authorized'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ISP Network:</span>
              <span className="text-amber-400 font-semibold">City Region (~15-30km)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 SCOPE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: DEVICE */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Device Telemetry</h3>
            </div>
            <span className="text-[11px] text-slate-400">Browser Exposed APIs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Operating System</span>
              <span className="text-white font-medium">{device?.operating_system || 'Not Collected'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Platform</span>
              <span className="text-cyan-300 font-medium">{device?.platform || 'Unknown'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Device Type</span>
              <span className="text-white font-medium">{device?.device_type || 'Desktop'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">CPU Cores</span>
              <span className="text-emerald-400 font-mono font-medium">{device?.cpu_cores || 'Restricted'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Memory (RAM)</span>
              <span className="text-slate-300 font-mono">{device?.device_memory || 'Unavailable'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Screen Resolution</span>
              <span className="text-white font-mono">{device?.screen_resolution || 'Unknown'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-2">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Browser</span>
              <span className="text-white font-medium">{device?.browser || 'Unknown'} {device?.browser_version || ''}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Timezone</span>
              <span className="text-slate-300">{device?.timezone || 'UTC'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-3">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">GPU Graphics Renderer (WebGL)</span>
              <span className="text-cyan-300 font-mono text-[11px] break-all">{device?.gpu_renderer || 'Standard WebGL'}</span>
            </div>
          </div>
        </div>

        {/* PANEL 2: NETWORK */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Network & Ingress</h3>
            </div>
            <span className="text-[11px] text-slate-400">Server TCP/IP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-2">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Public IP</span>
              <span className="text-white font-mono font-medium text-sm select-all">{network?.public_ip || '198.51.100.42'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">IP Version</span>
              <span className="text-cyan-300 font-mono">{network?.ip_version || 'IPv4'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-3">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Internet Service Provider (ISP)</span>
              <span className="text-slate-200 font-medium">{network?.isp || 'Border Transit Provider'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 sm:col-span-3">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Autonomous System (AS)</span>
              <span className="text-cyan-300 font-mono text-[11px]">{network?.organization || 'Cloud Gateway AS'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Country</span>
              <span className="text-white font-medium">{network?.country || 'United States'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Region</span>
              <span className="text-slate-300">{network?.region || 'California'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Approx City</span>
              <span className="text-slate-300">{network?.city || 'Mountain View'}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <strong className="text-slate-200">Note:</strong> IP-derived coordinates correspond to ISP regional routing aggregation centers, NOT the participant's physical device position.
          </p>
        </div>

        {/* PANEL 3: LOCATION */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Browser Geolocation</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
              location?.status === 'granted' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {location?.status === 'granted' ? 'GPS GRANTED' : 'PERMISSION DENIED'}
            </span>
          </div>

          {location?.status === 'granted' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Latitude</span>
                <span className="text-cyan-300 font-bold font-mono text-sm">{location.latitude.toFixed(6)}°</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Longitude</span>
                <span className="text-cyan-300 font-bold font-mono text-sm">{location.longitude.toFixed(6)}°</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Accuracy Radius</span>
                <span className="text-emerald-400 font-bold font-mono">±{location.accuracy}m</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Altitude</span>
                <span className="text-slate-300 font-mono">{location.altitude !== null ? `${location.altitude}m` : 'N/A'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Heading</span>
                <span className="text-slate-300">{location.heading !== null ? `${location.heading}°` : 'Stationary'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Speed</span>
                <span className="text-slate-300 font-mono">{location.speed !== null ? `${location.speed} m/s` : '0 m/s'}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <XCircle className="w-4 h-4" />
              </div>
              <p className="font-medium text-slate-200">Location permission declined</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {location?.error_message || 'The user chose not to share GPS coordinates. TraceLab gracefully fell back to regional IP estimation.'}
              </p>
            </div>
          )}
        </div>

        {/* PANEL 4: MAP */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Geographic Map View</h3>
            </div>
            <span className="text-[11px] text-slate-400">Leaflet OpenStreetMap</span>
          </div>

          <MapComponent
            gpsLat={location?.status === 'granted' ? location.latitude : null}
            gpsLng={location?.status === 'granted' ? location.longitude : null}
            gpsAccuracy={location?.accuracy}
            ipLat={network?.ip_latitude}
            ipLng={network?.ip_longitude}
            height="240px"
            sessionName={session.session_name}
            showComparison={true}
          />
        </div>
      </div>

      {/* Audit Chronology */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Session Audit Chronology
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{logs.length} events recorded</span>
        </div>

        <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-slate-500 text-[11px] font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  log.severity === 'success' ? 'bg-emerald-400' : log.severity === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <span className="text-slate-300 truncate">{log.message}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase shrink-0 font-mono">
                {log.event_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
