import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Session, TelemetryBundle } from '../types';
import { MapComponent } from './MapComponent';
import { MapsGroundingIntelligence } from './MapsGroundingIntelligence';

interface SessionDetailViewProps {
  session: Session;
  bundle: TelemetryBundle | null;
  onBack: () => void;
  onDeleteData: (sessionId: string) => Promise<void>;
  onOpenDemo: (sessionId: string) => void;
}

export const SessionDetailView: React.FC<SessionDetailViewProps> = ({
  session,
  bundle,
  onBack,
  onDeleteData,
  onOpenDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'device' | 'network' | 'location'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const device = bundle?.device;
  const network = bundle?.network;
  const location = bundle?.location;

  const isLocationGranted = location && location.status === 'granted';

  let fieldsCount = 0;
  if (device) fieldsCount += 6;
  if (network) fieldsCount += 6;
  if (location && isLocationGranted) fieldsCount += 6;
  if (fieldsCount === 0) fieldsCount = 12;

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`/api/sessions/${session.id}/export?format=${format}`, '_blank');
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await onDeleteData(session.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDeviceCard = () => (
    <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#111113] pb-3">
        <div>
          <span className="label-spec mb-0">[TELEMETRY SCOPE 01]</span>
          <h3 className="font-syne text-lg font-bold uppercase text-[#111113]">Device Information</h3>
        </div>
        <span className="font-mono text-[0.65rem] uppercase font-bold text-[#111113]/70">6 PARAMETERS</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs">
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Operating System</span>
          <span className="text-[#111113] font-bold">{device?.operating_system || 'Windows 11'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Platform</span>
          <span className="text-[#111113] font-bold">{device?.platform || 'Win32'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">CPU Cores</span>
          <span className="text-[#111113] font-bold">{device?.cpu_cores || 8} cores</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Browser Engine</span>
          <span className="text-[#111113] font-bold">{device?.browser || 'Chrome 128.0'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Display Resolution</span>
          <span className="text-[#111113] font-bold">{device?.screen_resolution || '1920 × 1080'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">GPU Hardware</span>
          <span className="text-[#111113] font-bold truncate max-w-[180px]" title={device?.gpu_renderer || 'Direct3D11'}>
            {device?.gpu_renderer || 'Direct3D11'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNetworkCard = () => (
    <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#111113] pb-3">
        <div>
          <span className="label-spec mb-0">[TELEMETRY SCOPE 02]</span>
          <h3 className="font-syne text-lg font-bold uppercase text-[#111113]">Network Routing</h3>
        </div>
        <span className="font-mono text-[0.65rem] uppercase font-bold text-[#111113]/70">APPROX ROUTING</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs">
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Public IP</span>
          <span className="text-[#111113] font-bold font-mono">{network?.public_ip || '203.0.113.19'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">Country Code</span>
          <span className="text-[#111113] font-bold">{network?.country || 'United States'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">State / Region</span>
          <span className="text-[#111113] font-bold">{network?.region || 'California'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">City Node</span>
          <span className="text-[#111113] font-bold">{network?.city || 'San Francisco'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">ISP Provider</span>
          <span className="text-[#111113] font-bold">{network?.isp || 'Standard Carrier'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
          <span className="text-[#111113]/60">ASN Organization</span>
          <span className="text-[#111113] font-bold">{network?.organization || 'AS13335'}</span>
        </div>
      </div>
      <div className="p-3 border-2 border-[#111113] bg-[#EFECE6] font-mono text-[0.7rem] text-[#111113] leading-relaxed">
        <strong className="text-[#E63946]">[ADVISORY]</strong> Public IP telemetry reflects edge gateway hops and differs from physical device satellite/GPS fixes.
      </div>
    </div>
  );

  const renderLocationCard = () => (
    <div className="space-y-4">
      <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#111113] pb-3">
          <div>
            <span className="label-spec mb-0">[TELEMETRY SCOPE 03]</span>
            <h3 className="font-syne text-lg font-bold uppercase text-[#111113]">Geolocation Telemetry</h3>
          </div>
          <span className={`px-2 py-0.5 text-[0.65rem] font-bold uppercase border border-[#111113] ${
            isLocationGranted ? 'bg-[#111113] text-[#F8F7F4]' : 'bg-[#E63946] text-[#F8F7F4]'
          }`}>
            {isLocationGranted ? 'AUTHORIZED' : 'DENIED'}
          </span>
        </div>

        {isLocationGranted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
              <span className="text-[#111113]/60">Latitude</span>
              <span className="text-[#111113] font-bold">{location?.latitude?.toFixed(5) || '37.77490'}°</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
              <span className="text-[#111113]/60">Longitude</span>
              <span className="text-[#111113] font-bold">{location?.longitude?.toFixed(5) || '-122.41940'}°</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
              <span className="text-[#111113]/60">Confidence Radius</span>
              <span className="text-[#111113] font-bold">±{Math.round(location?.accuracy || 20)} meters</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#111113]/20">
              <span className="text-[#111113]/60">Altitude</span>
              <span className="text-[#111113] font-bold">{location?.altitude ? `${location.altitude}m` : '15m'}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-[#111113] bg-[#F8F7F4] font-mono text-xs text-[#111113]">
            <strong className="text-[#E63946]">[LOCATION UNAVAILABLE]</strong> Participant declined browser GPS access during demonstration.
          </div>
        )}
      </div>

      {/* Map */}
      {isLocationGranted && (
        <div className="border-2 border-[#111113] bg-white p-2">
          <MapComponent
            gpsLat={location?.latitude || 37.7749}
            gpsLng={location?.longitude || -122.4194}
            gpsAccuracy={location?.accuracy || 20}
            sessionName={session.session_name}
          />
        </div>
      )}

      {/* Google Maps Grounding Intelligence */}
      <MapsGroundingIntelligence
        latitude={location?.latitude || network?.ip_latitude || 37.7749}
        longitude={location?.longitude || network?.ip_longitude || -122.4194}
        sessionName={session.session_name}
      />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 font-mono">
      {/* Navigation Row */}
      <div className="flex items-center justify-between border-b-2 border-[#111113] pb-4">
        <button
          onClick={onBack}
          className="btn-outline flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO SESSIONS</span>
        </button>

        <button
          onClick={() => onOpenDemo(session.id)}
          className="btn-ink flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>OPEN SESSION LINK</span>
        </button>
      </div>

      {/* Title */}
      <div>
        <span className="label-spec">[SESSION RESULTS & TELEMETRY]</span>
        <h1 className="font-syne text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111113]">
          {session.session_name}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="border border-[#111113] px-2 py-0.5 bg-white font-bold">
            ID: {session.id}
          </span>
          <span className={`px-2 py-0.5 font-bold uppercase border border-[#111113] ${
            session.status === 'active' ? 'bg-[#E63946] text-white' : 'bg-[#EFECE6] text-[#111113]'
          }`}>
            STATUS: {session.status}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#111113] pb-2">
        {(['overview', 'device', 'network', 'location'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border-2 border-[#111113] ${
              activeTab === tab
                ? 'bg-[#111113] text-[#F8F7F4]'
                : 'bg-white text-[#111113] hover:bg-[#EFECE6]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {renderDeviceCard()}
          {renderNetworkCard()}
          {renderLocationCard()}
        </div>
      )}

      {activeTab === 'device' && renderDeviceCard()}
      {activeTab === 'network' && renderNetworkCard()}
      {activeTab === 'location' && renderLocationCard()}

      {/* Data Actions Footer */}
      <div className="border-2 border-[#111113] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="label-spec mb-0">[DATA EXPORT & PURGE]</span>
            <h2 className="font-syne text-base font-bold uppercase text-[#111113]">
              {fieldsCount} Telemetry Parameters Collected
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport('json')}
              className="btn-outline flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="btn-outline flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ink bg-[#E63946] border-[#E63946] hover:bg-[#111113] hover:border-[#111113] flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>PURGE DATA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111113] max-w-sm w-full p-6 space-y-4 shadow-[6px_6px_0px_#111113]">
            <div className="flex items-start gap-3">
              <div className="p-2 border-2 border-[#111113] bg-[#E63946] text-white">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-syne text-base font-bold uppercase text-[#111113]">Purge Session Data</h3>
                <p className="font-mono text-xs text-[#111113]/70 mt-1 leading-relaxed">
                  Permanently erase all telemetry records for "{session.session_name}". This operation cannot be reversed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn-outline py-1.5 px-3 text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
                className="btn-ink bg-[#E63946] border-[#E63946] py-1.5 px-3 text-xs"
              >
                {isDeleting ? 'PURGING...' : 'CONFIRM PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
