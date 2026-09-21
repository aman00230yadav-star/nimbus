import React, { useState } from 'react';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { Session } from '../types';

interface SessionsListViewProps {
  sessions: Session[];
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onOpenDemo: (id: string) => void;
  onDeleteSession: (id: string) => Promise<void>;
}

export const SessionsListView: React.FC<SessionsListViewProps> = ({
  sessions,
  onSelectSession,
  onCreateSession,
  onOpenDemo,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'disabled'>('all');

  const getTemplateLabel = (templateId: string) => {
    switch (templateId) {
      case 'near_you': return 'NearYou';
      case 'device_info': return 'Device';
      case 'network_info': return 'Network';
      case 'custom_link': return 'Custom Link';
      default: return templateId.replace(/_/g, ' ');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.session_name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.template.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto font-mono">
      {/* Header */}
      <div className="border-b-2 border-[#111113] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="label-spec">[SESSION REPOSITORY]</span>
          <h1 className="font-syne text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111113] leading-none">
            SESSIONS
          </h1>
          <p className="text-xs text-[#111113]/70 mt-2">
            Manage your authorized security demonstration sessions and telemetry records.
          </p>
        </div>

        <button
          onClick={onCreateSession}
          className="btn-ink flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>CREATE SESSION</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#111113]/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER BY NAME OR ID..."
            className="w-full pl-9 pr-3 py-2 border-2 border-[#111113] bg-white text-xs text-[#111113] placeholder-[#111113]/40 focus:outline-none uppercase font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'active', 'completed', 'disabled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider transition-all border-2 border-[#111113] ${
                statusFilter === st
                  ? 'bg-[#111113] text-[#F8F7F4]'
                  : 'bg-white text-[#111113] hover:bg-[#EFECE6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="border-2 border-[#111113] bg-white overflow-x-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h3 className="font-syne text-xl font-bold uppercase text-[#111113]">NO SESSIONS FOUND</h3>
            <p className="text-xs text-[#111113]/70 max-w-sm mx-auto">
              {sessions.length === 0
                ? 'Create your first authorized security-awareness session.'
                : 'No sessions match your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-[#111113] bg-[#EFECE6] text-[#111113] text-[0.7rem] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Consent</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111113]/20">
              {filteredSessions.map((s) => {
                const isConsentGranted = s.id !== 'c129e4720935ba11' && s.id !== 'Demo-003';
                return (
                  <tr key={s.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111113]">{s.session_name}</div>
                      <div className="text-[0.65rem] text-[#111113]/50 font-mono tracking-wider">{s.id}</div>
                    </td>
                    <td className="py-3 px-4 text-[#111113]/70 font-mono">
                      {getTemplateLabel(s.template)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[0.65rem] font-bold uppercase border border-[#111113] ${
                        s.status === 'active'
                          ? 'bg-[#E63946] text-[#F8F7F4]'
                          : 'bg-[#EFECE6] text-[#111113]'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isConsentGranted ? (
                        <span className="text-[#111113] font-bold text-[0.7rem] uppercase">
                          [GRANTED]
                        </span>
                      ) : (
                        <span className="text-[#E63946] font-bold text-[0.7rem] uppercase">
                          [DENIED]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#111113]/60 text-[0.7rem]">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenDemo(s.id)}
                          title="Open Demo"
                          className="border border-[#111113] p-1.5 hover:bg-[#111113] hover:text-[#F8F7F4] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectSession(s.id)}
                          className="btn-ink py-1 px-3 text-[0.65rem]"
                        >
                          VIEW →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
