import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Trash2, 
  AlertTriangle, 
  Server, 
  Key, 
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { SecurityConfig } from '../types';

interface SecurityCenterViewProps {
  config: SecurityConfig;
  onUpdateRetention: (days: number) => void;
  onPurgeData: (type: 'expired' | 'all') => Promise<{ purged_count: number }>;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  config,
  onUpdateRetention,
  onPurgeData
}) => {
  const [retentionDays, setRetentionDays] = useState(config.retention_days);
  const [isUpdating, setIsUpdating] = useState(false);
  const [purgeModalType, setPurgeModalType] = useState<'expired' | 'all' | null>(null);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const handleRetentionSave = async () => {
    setIsUpdating(true);
    await onUpdateRetention(retentionDays);
    setIsUpdating(false);
  };

  const handleConfirmPurge = async () => {
    if (!purgeModalType) return;
    const res = await onPurgeData(purgeModalType);
    setPurgeResult(`Purged ${res.purged_count} session records.`);
    setPurgeModalType(null);
    setTimeout(() => setPurgeResult(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Compliance & Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security & Privacy Control Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Audit cryptographic status, configure data retention policies, and enforce participant consent protocols.
          </p>
        </div>

        {purgeResult && (
          <div className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono animate-in fade-in">
            {purgeResult}
          </div>
        )}
      </div>

      {/* Security Status Badges Grid (Section 16 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HTTPS Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">HTTPS Transport</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">TLS 1.3 Strict</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Enforced HSTS
          </span>
        </div>

        {/* Authentication Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">SOC Authentication</span>
            <Key className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">Operator Validated</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-mono">
            ID: SOC-OP-8821
          </span>
        </div>

        {/* Consent Enforcement */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Consent Guard</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">Mandatory Explicit</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            Zero Deceptive Paths
          </span>
        </div>

        {/* Rate Limiting */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Rate Limiting</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">Active (100 req/min)</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            Anti-Bruteforce Active
          </span>
        </div>
      </div>

      {/* Configurable Data Retention & Storage Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Policy Box */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">Data Retention Policy</h2>
              <p className="text-xs text-slate-400 font-mono">Automated telemetry expiration threshold</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span>Retention Window:</span>
                <span className="text-cyan-400 font-bold">{retentionDays} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>1 Day (Ephemeral)</span>
                <span>7 Days</span>
                <span>30 Days (Maximum)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Sessions exceeding this duration are automatically invalidated and their telemetry is permanently purged from memory and storage vaults.
            </p>

            <button
              onClick={handleRetentionSave}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Apply Retention Policy'}
            </button>
          </div>
        </div>

        {/* Secure Storage & Purge Center */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">Cryptographic Vault & Purge</h2>
              <p className="text-xs text-slate-400 font-mono">Session purge and secure deletion</p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-300 font-semibold block">Secure Vault Status</span>
                <span className="text-[11px] text-slate-500">AES-256 GCM in-memory and state persistence</span>
              </div>
              <span className="text-emerald-400 font-bold">HEALTHY</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setPurgeModalType('expired')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Purge Expired Sessions</span>
              </button>

              <button
                onClick={() => setPurgeModalType('all')}
                className="py-2.5 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Session Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Purging */}
      {purgeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 p-6 space-y-4 text-slate-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Data Deletion</h3>
                <p className="text-xs text-rose-300 font-mono">
                  {purgeModalType === 'all' ? 'Full Vault Purge' : 'Expired Sessions Purge'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {purgeModalType === 'all'
                ? 'This will immediately and permanently erase ALL demonstration sessions, consent logs, and collected telemetry records from the server.'
                : 'This will erase all sessions that have passed their expiration timestamp.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPurgeModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold shadow-lg shadow-rose-600/20"
              >
                Execute Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
