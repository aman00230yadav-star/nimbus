import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  Radio, 
  Database, 
  Map as MapIcon, 
  Terminal, 
  ShieldAlert, 
  Info,
  ExternalLink,
  Lock,
  Play
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'create-session' 
  | 'templates' 
  | 'live-session' 
  | 'collected-data' 
  | 'map' 
  | 'activity-logs' 
  | 'settings' 
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSessionName?: string;
  hasActiveSession: boolean;
  onOpenLiveExperienceModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeSessionName,
  hasActiveSession,
  onOpenLiveExperienceModal
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-session' as NavTab, label: 'Live Telemetry', icon: Radio, isLive: hasActiveSession },
    { id: 'collected-data' as NavTab, label: 'All Sessions', icon: Database },
    { id: 'templates' as NavTab, label: 'Templates', icon: Layers },
    { id: 'map' as NavTab, label: 'Geographic Map', icon: MapIcon },
    { id: 'activity-logs' as NavTab, label: 'Activity Logs', icon: Terminal },
    { id: 'settings' as NavTab, label: 'Security & Privacy', icon: ShieldAlert },
  ];

  return (
    <aside className="w-full md:w-56 bg-slate-950 border-r border-slate-800/80 p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        {/* Quick Action: New Session */}
        <button
          onClick={() => onSelectTab('create-session')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Session</span>
        </button>

        {/* Clean Nav List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Test Participant View */}
        <div className="pt-2 border-t border-slate-900">
          <button
            onClick={onOpenLiveExperienceModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Participant View</span>
          </button>
        </div>
      </div>

      {/* Security Status Footer */}
      <div className="pt-3 border-t border-slate-900 text-slate-500 text-[11px] flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Strict Consent Mode</span>
        </div>
        <button
          onClick={() => onSelectTab('about')}
          className={`text-[10px] hover:text-cyan-400 transition-colors ${currentTab === 'about' ? 'text-cyan-400 font-medium' : 'text-slate-500'}`}
        >
          About
        </button>
      </div>
    </aside>
  );
};
