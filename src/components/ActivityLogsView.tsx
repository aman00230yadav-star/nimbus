import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Smartphone, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';
import { AuditLog } from '../types';

interface ActivityLogsViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  session_created: Terminal,
  url_opened: ExternalLink,
  consent_granted: CheckCircle2,
  consent_denied: AlertTriangle,
  device_collected: Smartphone,
  location_granted: MapPin,
  location_denied: AlertTriangle,
  report_generated: FileText,
  session_disabled: AlertTriangle,
  session_deleted: Trash2,
  data_purged: Trash2,
  export_generated: Download,
};

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs, onRefresh }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs.filter((log) => {
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.session_name && log.session_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSeverity && matchesSearch;
  });

  const downloadLogFile = () => {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracelab_soc_audit_stream_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>SOC Event Chronicle</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Activity Logs
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Tamper-evident chronologic feed of session events, participant consent records, and telemetry disclosures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadLogFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Audit Vault</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search event descriptions or event codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert / Purge</option>
          </select>
        </div>
      </div>

      {/* Terminal Feed Container (Section 15 SOC style) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Titlebar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 font-semibold text-slate-300">trace-audit.log</span>
          </div>
          <span>Showing {filtered.length} entries</span>
        </div>

        {/* Log Entries */}
        <div className="p-4 space-y-2.5 max-h-[580px] overflow-y-auto divide-y divide-slate-900/80">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-600">No logs found.</div>
          ) : (
            filtered.map((log) => {
              const Icon = EVENT_ICONS[log.event_type] || Terminal;
              return (
                <div
                  key={log.id}
                  className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400/80 text-[11px] font-bold">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>

                    <div className={`p-1 rounded ${
                      log.severity === 'success' ? 'text-emerald-400 bg-emerald-950/60' :
                      log.severity === 'warning' ? 'text-amber-400 bg-amber-950/60' :
                      log.severity === 'alert' ? 'text-rose-400 bg-rose-950/60' :
                      'text-cyan-400 bg-cyan-950/60'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-slate-200">
                      {log.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto text-[10px]">
                    {log.session_name && (
                      <span className="text-slate-500 truncate max-w-[140px]">
                        [{log.session_name}]
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                      {log.event_type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
