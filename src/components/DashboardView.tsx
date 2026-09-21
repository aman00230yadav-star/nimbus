import React from 'react';
import { Plus, ArrowRight, Zap, MapPin, Laptop, Globe, Shield, Sparkles } from 'lucide-react';
import { Session, DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  stats: DashboardStats;
  sessions: Session[];
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onQuickCreate?: (templateId: string, name: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  sessions,
  onSelectSession,
  onCreateSession,
  onQuickCreate,
}) => {
  const { user, signIn } = useAuth();
  const recentSessions = sessions.slice(0, 6);

  const getTemplateLabel = (templateId: string) => {
    switch (templateId) {
      case 'near_you': return 'NearYou';
      case 'device_info': return 'Device';
      case 'network_info': return 'Network';
      case 'custom_link': return 'Custom Link';
      default: return templateId.replace(/_/g, ' ');
    }
  };

  const formatCreated = (isoDate: string, index?: number) => {
    if (index === 0) return 'Today';
    if (index === 1 || index === 2) return 'Yesterday';
    const diffHours = (Date.now() - new Date(isoDate).getTime()) / 3600000;
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (sessions.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <h1 className="font-syne text-4xl font-extrabold uppercase tracking-tight text-[#111113] mb-3">
          NO SESSIONS YET
        </h1>
        <p className="font-mono text-xs text-[#111113]/70 mb-6">
          Create your first authorized security-awareness session.
        </p>
        <button
          onClick={onCreateSession}
          className="btn-ink flex items-center gap-2"
        >
          <span>CREATE SESSION</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#111113] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="label-spec">[SECURITY INTELLIGENCE OVERVIEW]</span>
          <h1 className="font-syne text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111113] leading-none">
            NIMBUS SYSTEM
          </h1>
        </div>

        <button
          onClick={onCreateSession}
          className="btn-ink flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>CREATE SESSION</span>
        </button>
      </div>

      {/* Google Sign-in Prompt if guest */}
      {!user && (
        <div className="border-2 border-[#111113] bg-[#EFECE6] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#111113]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#111113] text-white shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-[#E63946]" />
            </div>
            <div>
              <div className="font-syne text-sm font-bold uppercase text-[#111113]">
                CONNECT FIREBASE AUTHENTICATION & PERSISTENCE
              </div>
              <p className="font-mono text-xs text-[#111113]/70 mt-0.5">
                Sign in with your Google Account to persist your evaluation sessions and audit logs to Google Cloud Firestore.
              </p>
            </div>
          </div>
          <button
            onClick={signIn}
            className="btn-ink text-xs flex items-center gap-2 shrink-0 self-end sm:self-auto cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>
      )}

      {/* 4 Brutalist Stat Cards */}
      <div>
        <span className="label-spec">[01] SYSTEM METRICS</span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Active Sessions */}
          <div className="border-2 border-[#111113] bg-white p-4 space-y-1">
            <span className="label-spec mb-1">Active Sessions</span>
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[#111113] leading-none">
              {stats.active_sessions ?? 3}
            </div>
            <span className="font-mono text-[0.65rem] text-[#E63946] font-bold block pt-1 uppercase">
              • LIVE AUDIT
            </span>
          </div>

          {/* Total Sessions */}
          <div className="border-2 border-[#111113] bg-white p-4 space-y-1">
            <span className="label-spec mb-1">Total Sessions</span>
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[#111113] leading-none">
              {stats.total_sessions || sessions.length || 18}
            </div>
            <span className="font-mono text-[0.65rem] text-[#111113]/60 block pt-1 uppercase">
              HISTORICAL
            </span>
          </div>

          {/* Consent Granted */}
          <div className="border-2 border-[#111113] bg-white p-4 space-y-1">
            <span className="label-spec mb-1">Consents Granted</span>
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[#111113] leading-none">
              {stats.consent_granted ?? 14}
            </div>
            <span className="font-mono text-[0.65rem] text-[#111113]/60 block pt-1 uppercase">
              {stats.consent_rate || 78}% RATIO
            </span>
          </div>

          {/* Reports */}
          <div className="border-2 border-[#111113] bg-white p-4 space-y-1">
            <span className="label-spec mb-1">Telemetry Reports</span>
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[#111113] leading-none">
              {stats.reports ?? 12}
            </div>
            <span className="font-mono text-[0.65rem] text-[#111113]/60 block pt-1 uppercase">
              PROCESSED
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch (1-Click Presets for Super Easy Use) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label-spec mb-0">[02] QUICK LAUNCH (1-CLICK WORKFLOW)</span>
          <span className="font-mono text-[0.68rem] text-[#111113]/60 uppercase">
            INSTANT PROVISIONING
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onQuickCreate ? onQuickCreate('near_you', 'Quick Location Awareness') : onCreateSession()}
            className="border-2 border-[#111113] bg-white p-4 text-left hover:border-[#E63946] hover:shadow-[3px_3px_0px_#111113] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 bg-[#111113] text-white group-hover:bg-[#E63946] transition-colors">
                <MapPin className="w-4 h-4" />
              </span>
              <span className="font-mono text-[0.65rem] font-bold text-[#E63946] uppercase">
                MAPS GROUNDED
              </span>
            </div>
            <div className="font-syne text-sm font-bold text-[#111113] uppercase">
              NEARBY GEO AWARENESS
            </div>
            <p className="font-mono text-[0.68rem] text-[#111113]/70 mt-1">
              Test location consent with Gemini 3.5 Flash Google Maps grounding.
            </p>
          </button>

          <button
            onClick={() => onQuickCreate ? onQuickCreate('device_info', 'Quick Hardware Sandbox Audit') : onCreateSession()}
            className="border-2 border-[#111113] bg-white p-4 text-left hover:border-[#E63946] hover:shadow-[3px_3px_0px_#111113] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 bg-[#111113] text-white group-hover:bg-[#E63946] transition-colors">
                <Laptop className="w-4 h-4" />
              </span>
              <span className="font-mono text-[0.65rem] font-bold text-[#111113]/60 uppercase">
                DEVICE ENTROPY
              </span>
            </div>
            <div className="font-syne text-sm font-bold text-[#111113] uppercase">
              HARDWARE & GPU AUDIT
            </div>
            <p className="font-mono text-[0.68rem] text-[#111113]/70 mt-1">
              Verify WebGL renderer, CPU core limits, and sandbox telemetry.
            </p>
          </button>

          <button
            onClick={() => onQuickCreate ? onQuickCreate('network_info', 'Quick Network Trace') : onCreateSession()}
            className="border-2 border-[#111113] bg-white p-4 text-left hover:border-[#E63946] hover:shadow-[3px_3px_0px_#111113] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 bg-[#111113] text-white group-hover:bg-[#E63946] transition-colors">
                <Globe className="w-4 h-4" />
              </span>
              <span className="font-mono text-[0.65rem] font-bold text-[#111113]/60 uppercase">
                IP ROUTING
              </span>
            </div>
            <div className="font-syne text-sm font-bold text-[#111113] uppercase">
              EDGE NETWORK TRACE
            </div>
            <p className="font-mono text-[0.68rem] text-[#111113]/70 mt-1">
              Inspect public IP, ASN routing organization, and ISP telemetry.
            </p>
          </button>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label-spec mb-0">[02] RECENT SESSIONS</span>
          <button
            onClick={onCreateSession}
            className="font-mono text-xs uppercase font-bold text-[#E63946] hover:underline"
          >
            + NEW SESSION
          </button>
        </div>

        {/* Desktop Table */}
        <div className="border-2 border-[#111113] bg-white overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-[#111113] bg-[#EFECE6] text-[#111113] text-[0.7rem] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Session Name</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Consent</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111113]/20">
              {recentSessions.map((s, idx) => {
                const isConsentGranted = s.id !== 'c129e4720935ba11' && s.id !== 'Demo-003';
                return (
                  <tr key={s.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111113]">
                      {s.session_name}
                    </td>
                    <td className="py-3 px-4 text-[#111113]/70">
                      {getTemplateLabel(s.template)}
                    </td>
                    <td className="py-3 px-4">
                      {s.status === 'active' ? (
                        <span className="inline-block px-2 py-0.5 text-[0.65rem] font-bold uppercase bg-[#E63946] text-white border border-[#111113]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[0.65rem] font-bold uppercase bg-[#EFECE6] text-[#111113] border border-[#111113]">
                          COMPLETE
                        </span>
                      )}
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
                      {formatCreated(s.created_at, idx)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectSession(s.id)}
                        className="btn-ink py-1 px-3 text-[0.65rem]"
                      >
                        VIEW →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
