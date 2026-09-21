import React, { useState, useEffect } from 'react';
import { Navigation, MainTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CreateSessionView } from './components/CreateSessionView';
import { SessionsListView } from './components/SessionsListView';
import { SessionDetailView } from './components/SessionDetailView';
import { SettingsView } from './components/SettingsView';
import { ConsentVisitorView } from './components/ConsentVisitorView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { api } from './services/api';
import { Session, TelemetryBundle, DashboardStats } from './types';
import { AuthProvider } from './context/AuthContext';
import { saveSessionToFirestore, deleteSessionFromFirestore, subscribeFirestoreSessions } from './lib/firebase';

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>('473916b960c653a5');
  const [sessionBundle, setSessionBundle] = useState<TelemetryBundle | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    active_sessions: 3,
    total_sessions: 18,
    completed_sessions: 15,
    consent_granted: 14,
    authorized_collections: 14,
    reports: 12,
    location_granted_count: 8,
    location_denied_count: 6,
    total_records: 36,
    consent_rate: 78,
    data_completeness_avg: 86,
  });

  // Demo participant visitor view modal/screen
  const [visitorSession, setVisitorSession] = useState<Session | null>(null);

  // Load all initial data from backend
  const loadData = async () => {
    try {
      const [sessionList, statsData] = await Promise.all([
        api.getSessions(),
        api.getStats(),
      ]);

      if (sessionList && sessionList.length > 0) {
        setSessions(sessionList);

        const targetId = selectedSessionId && sessionList.some(s => s.id === selectedSessionId)
          ? selectedSessionId
          : sessionList[0].id;

        setSelectedSessionId(targetId);
        const bundle = await api.getSessionBundle(targetId);
        if (bundle) {
          setSessionBundle(bundle);
        }
      }

      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load Nimbus data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time Firestore session changes if configured
    const unsubscribe = subscribeFirestoreSessions((fsSessions) => {
      if (fsSessions && fsSessions.length > 0) {
        setSessions((prev) => {
          const map = new Map<string, Session>();
          // local/backend sessions first
          prev.forEach((s) => map.set(s.id, s));
          // firestore records overlay
          fsSessions.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
          return Array.from(map.values());
        });
      }
    });

    // Check if initial URL has /session/:id
    const path = window.location.pathname;
    const match = path.match(/\/session\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const directSessionId = match[1];
      api.getSessionBundle(directSessionId).then((bundle) => {
        if (bundle && bundle.session) {
          setVisitorSession(bundle.session);
        }
      });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleQuickCreate = async (templateId: string, title: string) => {
    try {
      const payload = {
        session_name: `${title} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        template: templateId,
        description: `Instant authorized demonstration (${templateId})`,
        require_consent: true,
        collect_device: templateId !== 'network_info',
        collect_network: true,
        request_location: templateId === 'near_you',
        enable_map: templateId === 'near_you',
      };

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newSession: Session = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        saveSessionToFirestore(newSession);
        setSelectedSessionId(newSession.id);
        const bundle = await api.getSessionBundle(newSession.id);
        if (bundle) setSessionBundle(bundle);
        setCurrentTab('session-detail');
      }
    } catch (e) {
      console.error('Quick create failed:', e);
    }
  };

  const handleSelectSession = async (id: string) => {
    setSelectedSessionId(id);
    try {
      const bundle = await api.getSessionBundle(id);
      setSessionBundle(bundle);
    } catch (err) {
      console.error(err);
    }
    setCurrentTab('session-detail');
  };

  const handleOpenDemo = async (sessionId: string) => {
    const existing = sessions.find((s) => s.id === sessionId);
    if (existing) {
      setVisitorSession(existing);
    } else {
      try {
        const bundle = await api.getSessionBundle(sessionId);
        if (bundle?.session) {
          setVisitorSession(bundle.session);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteData = async (sessionId: string) => {
    try {
      await fetch(`/api/sessions/${sessionId}/data`, { method: 'DELETE' });
      await loadData();
      if (selectedSessionId === sessionId) {
        const updatedBundle = await api.getSessionBundle(sessionId);
        setSessionBundle(updatedBundle);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      await deleteSessionFromFirestore(sessionId);
      await loadData();
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setSessionBundle(null);
        setCurrentTab('sessions');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If visitor mode is active (e.g. from /session/:id or Open Demo)
  if (visitorSession) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col justify-between font-mono">
        <main className="flex-1 flex items-center justify-center p-4">
          <ConsentVisitorView
            session={visitorSession}
            onConsentComplete={() => {
              loadData();
            }}
            onCancel={() => {
              setVisitorSession(null);
              loadData();
            }}
          />
        </main>
        <footer className="border-t-2 border-[#111113] px-6 py-4 flex items-center justify-between font-mono text-xs">
          <div>NIMBUS DEMO CLIENT</div>
          <div>AUTHORIZED PARTICIPATION</div>
        </footer>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-mono selection:bg-[#E63946] selection:text-[#F8F7F4]">
      {/* Brutalist Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onCreateSession={() => setCurrentTab('create-session')}
            onQuickCreate={handleQuickCreate}
          />
        )}

        {currentTab === 'create-session' && (
          <CreateSessionView
            onSessionCreated={(newSession) => {
              setSessions([newSession, ...sessions]);
              setSelectedSessionId(newSession.id);
              loadData();
            }}
            onOpenDemo={handleOpenDemo}
            onViewSession={handleSelectSession}
          />
        )}

        {currentTab === 'sessions' && (
          <SessionsListView
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onCreateSession={() => setCurrentTab('create-session')}
            onOpenDemo={handleOpenDemo}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {currentTab === 'session-detail' && currentSession && (
          <SessionDetailView
            session={currentSession}
            bundle={sessionBundle}
            onBack={() => setCurrentTab('sessions')}
            onDeleteData={handleDeleteData}
            onOpenDemo={handleOpenDemo}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            onPurgeComplete={() => {
              loadData();
            }}
          />
        )}
      </main>

      {/* Variation 1 Brutalist Footer */}
      <footer className="border-t-2 border-[#111113] px-6 py-4 flex flex-col sm:flex-row items-center justify-between font-mono text-xs gap-2 mt-auto bg-[#F8F7F4]">
        <div>NIMBUS CORE // V2.4</div>
        <div>LATENCY: 12ms</div>
        <div className="font-bold text-[#E63946]">ALL SYSTEMS OPERATIONAL</div>
      </footer>

      {/* Corner Pop-up Gemini Chatbot */}
      <GeminiChatbot currentSessionName={currentSession?.session_name} />
    </div>
  );
}
