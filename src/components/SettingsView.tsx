import React, { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface SettingsViewProps {
  onPurgeComplete: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onPurgeComplete }) => {
  const [retentionDays, setRetentionDays] = useState(30);
  const [saved, setSaved] = useState(false);
  const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handleSaveRetention = async () => {
    try {
      await fetch('/api/security/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retention_days: retentionDays }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurge = async (type: 'expired' | 'all') => {
    setIsPurging(true);
    try {
      const res = await fetch('/api/security/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purge_type: type }),
      });
      if (res.ok) {
        const data = await res.json();
        setPurgeMessage(data.message || 'Data purged successfully.');
        setTimeout(() => setPurgeMessage(null), 3000);
        onPurgeComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPurging(false);
      setShowPurgeAllModal(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 font-mono">
      {/* Title */}
      <div className="border-b-2 border-[#111113] pb-4">
        <span className="label-spec">[SECURITY & DATA POLICIES]</span>
        <h1 className="font-syne text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111113]">
          SETTINGS
        </h1>
        <p className="text-xs text-[#111113]/70 mt-1">
          Configure security retention policies, purge schedules, and system verification parameters.
        </p>
      </div>

      {purgeMessage && (
        <div className="p-3 border-2 border-[#111113] bg-white text-xs font-bold text-[#111113] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#E63946]" />
          <span>{purgeMessage}</span>
        </div>
      )}

      {/* Data Retention */}
      <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
        <span className="label-spec">[POLICY 01: RETENTION]</span>
        <h2 className="font-syne text-lg font-bold uppercase text-[#111113]">Telemetry Retention Horizon</h2>
        <p className="text-xs text-[#111113]/70 leading-relaxed">
          Automatically discard collected telemetry and logs older than the designated retention window.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="border-2 border-[#111113] p-2 bg-transparent text-xs text-[#111113] font-mono font-bold focus:outline-none"
          >
            <option value={7}>7 DAYS</option>
            <option value={14}>14 DAYS</option>
            <option value={30}>30 DAYS (STANDARD)</option>
            <option value={90}>90 DAYS</option>
          </select>

          <button
            type="button"
            onClick={handleSaveRetention}
            className="btn-ink"
          >
            {saved ? '✓ SAVED' : 'SAVE POLICY'}
          </button>
        </div>
      </div>

      {/* System Security Standards */}
      <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
        <span className="label-spec">[POLICY 02: ENFORCEMENT]</span>
        <h2 className="font-syne text-lg font-bold uppercase text-[#111113]">Active Security Controls</h2>
        <div className="divide-y-2 divide-[#111113]/20 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111113]/70">Mandatory Consent Prompt</span>
            <span className="font-bold text-[#111113]">[ENFORCED]</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111113]/70">HTTPS Transport Encryption</span>
            <span className="font-bold text-[#111113]">[TLS 1.3 ACTIVE]</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111113]/70">Rate Limiting & Anti-Scrape</span>
            <span className="font-bold text-[#111113]">[ACTIVE]</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111113]/70">Non-Impersonation Safeguard</span>
            <span className="font-bold text-[#111113]">[ENFORCED]</span>
          </div>
        </div>
      </div>

      {/* Data Purge Options */}
      <div className="border-2 border-[#111113] bg-white p-6 space-y-4">
        <span className="label-spec">[POLICY 03: PURGE]</span>
        <h2 className="font-syne text-lg font-bold uppercase text-[#111113]">Data Lifecycle Management</h2>
        <p className="text-xs text-[#111113]/70 leading-relaxed">
          Purge demonstration data on demand to maintain zero data residue.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => handlePurge('expired')}
            disabled={isPurging}
            className="btn-outline"
          >
            PURGE EXPIRED DATA
          </button>

          <button
            type="button"
            onClick={() => setShowPurgeAllModal(true)}
            disabled={isPurging}
            className="btn-ink bg-[#E63946] border-[#E63946] hover:bg-[#111113] hover:border-[#111113]"
          >
            PURGE ALL DATA
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPurgeAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111113] max-w-sm w-full p-6 space-y-4 shadow-[6px_6px_0px_#111113]">
            <div className="flex items-start gap-3">
              <div className="p-2 border-2 border-[#111113] bg-[#E63946] text-white">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-syne text-base font-bold uppercase text-[#111113]">Purge All Data</h3>
                <p className="font-mono text-xs text-[#111113]/70 mt-1 leading-relaxed">
                  This will erase all demonstration records, device telemetry, network origins, and location data across all sessions.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeAllModal(false)}
                className="btn-outline py-1.5 px-3 text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handlePurge('all')}
                disabled={isPurging}
                className="btn-ink bg-[#E63946] border-[#E63946] py-1.5 px-3 text-xs"
              >
                {isPurging ? 'PURGING...' : 'CONFIRM PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
