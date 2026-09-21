import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut, User as UserIcon, Database, ShieldCheck } from 'lucide-react';
import { NimbusLogo } from './NimbusLogo';
import { useAuth } from '../context/AuthContext';

export type MainTab = 'dashboard' | 'sessions' | 'create-session' | 'settings' | 'session-detail';

interface NavigationProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  firestoreSynced?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, firestoreSynced = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signIn, signOut, isDemoUser, signInAsDemo } = useAuth();

  const navLinks: { id: MainTab; label: string }[] = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'create-session', label: 'CREATE SESSION' },
    { id: 'sessions', label: 'SESSIONS' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  const handleNavClick = (tab: MainTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full border-t-2 border-b-2 border-[#111113] bg-[#F8F7F4] px-4 sm:px-8 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
          >
            <NimbusLogo size="sm" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[0.72rem] tracking-wider font-mono">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id || (link.id === 'sessions' && currentTab === 'session-detail');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`uppercase cursor-pointer transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#111113] font-bold border-b-2 border-[#E63946]'
                      : 'text-[#111113]/60 hover:text-[#111113]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Auth Bar */}
        <div className="flex items-center gap-3">
          {/* Firestore Real-Time Persistence Badge */}
          <div 
            title="Real-time document synchronization with Firebase Firestore"
            className="hidden lg:flex items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-[#111113] uppercase border border-[#111113] px-2 py-1 bg-white"
          >
            <Database className="w-3 h-3 text-[#E63946]" />
            <span>FIRESTORE: {firestoreSynced ? 'SYNCED' : 'CONNECTING'}</span>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 border-2 border-[#111113] px-2 py-1 bg-white font-mono text-xs">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-none border border-[#111113]"
                />
              ) : (
                <div className="w-5 h-5 bg-[#111113] text-[#F8F7F4] flex items-center justify-center text-[0.65rem] font-bold">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-[0.7rem] max-w-[130px] truncate font-bold text-[#111113]">
                {user.displayName || user.email?.split('@')[0]}
              </div>
              {isDemoUser && (
                <span className="text-[0.6rem] bg-[#111113] text-white px-1 font-mono">DEMO</span>
              )}
              <button
                onClick={signOut}
                title="Sign out of Firebase"
                className="cursor-pointer text-[#111113]/70 hover:text-[#E63946] p-0.5 ml-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-[#111113] text-[#F8F7F4] hover:bg-[#E63946] border-2 border-[#111113] transition-colors cursor-pointer shadow-[2px_2px_0px_#111113]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>SIGN IN</span>
              </button>
              <button
                onClick={signInAsDemo}
                title="Quick demo access with pre-configured auditor profile"
                className="hidden sm:inline-block px-2 py-1 text-[0.68rem] font-mono border border-[#111113] text-[#111113] hover:bg-white transition-colors cursor-pointer"
              >
                DEMO LOGIN
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border-2 border-[#111113] text-[#111113] hover:bg-[#111113] hover:text-[#F8F7F4] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t-2 border-[#111113] space-y-1 font-mono">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id || (link.id === 'sessions' && currentTab === 'session-detail');
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wider font-bold transition-colors ${
                  isActive
                    ? 'bg-[#E63946] text-[#F8F7F4]'
                    : 'text-[#111113] hover:bg-[#111113] hover:text-[#F8F7F4]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
