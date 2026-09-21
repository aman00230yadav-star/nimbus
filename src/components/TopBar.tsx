import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  Lock, 
  Plus,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Session } from '../types';

interface TopBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onOpenDemoForSession: (id: string) => void;
  onCreateSessionClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  darkMode,
  onToggleDarkMode,
  sessions,
  activeSessionId,
  onSelectSession,
  onOpenDemoForSession,
  onCreateSessionClick
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base text-white">
              Trace<span className="text-cyan-400 font-extrabold">Lab</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Authorized Lab
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Session Switcher */}
          <div className="relative">
            <button
              onClick={() => setSessionMenuOpen(!sessionMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
              title="Switch Active Session"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline text-slate-400 font-normal">Session:</span>
              <span className="font-medium text-white truncate max-w-[130px] sm:max-w-[170px]">
                {currentSession ? currentSession.session_name : 'Select Session'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {sessionMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-2 z-50 animate-in fade-in"
                onMouseLeave={() => setSessionMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-medium">
                  <span>SESSIONS ({sessions.length})</span>
                  <button 
                    onClick={() => {
                      setSessionMenuOpen(false);
                      onCreateSessionClick();
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    + New Session
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2 text-center">No sessions created yet</p>
                  ) : (
                    sessions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectSession(s.id);
                          setSessionMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          s.id === currentSession?.id 
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60' 
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium truncate text-white">{s.session_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.template.replace(/_/g, ' ')}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          s.status === 'active' ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Session button */}
          <button
            onClick={onCreateSessionClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User Status */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-[10px]">
                OP
              </div>
              <span className="hidden sm:inline font-medium text-slate-200">Analyst</span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-3 z-50 text-xs"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <p className="font-semibold text-white">Security Analyst</p>
                <p className="text-[11px] text-cyan-400 font-mono mt-0.5">ID: SOC-OP-8821</p>
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-slate-400 text-[11px]">
                  <p>Consent: <span className="text-emerald-400">Enforced</span></p>
                  <p>Encryption: <span className="text-cyan-300">TLS 1.3 Active</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
