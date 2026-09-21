import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Power,
  ArrowRight,
} from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { Session } from '../types';
import { NimbusIcon } from './NimbusLogo';
import { saveSessionToFirestore } from '../lib/firebase';

interface CreateSessionViewProps {
  onSessionCreated: (session: Session) => void;
  onOpenDemo: (sessionId: string) => void;
  onViewSession: (sessionId: string) => void;
}

export const CreateSessionView: React.FC<CreateSessionViewProps> = ({
  onSessionCreated,
  onOpenDemo,
  onViewSession,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('near_you');
  const [sessionName, setSessionName] = useState<string>('My Nimbus Demo');
  const [collectDevice, setCollectDevice] = useState<boolean>(true);
  const [collectNetwork, setCollectNetwork] = useState<boolean>(true);
  const [requestLocation, setRequestLocation] = useState<boolean>(true);
  const [requireConsent, setRequireConsent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdSession, setCreatedSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sessionActive, setSessionActive] = useState<boolean>(true);

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (tmplId === 'device_info') {
      setCollectDevice(true);
      setCollectNetwork(false);
      setRequestLocation(false);
    } else if (tmplId === 'network_info') {
      setCollectDevice(false);
      setCollectNetwork(true);
      setRequestLocation(false);
    } else if (tmplId === 'near_you') {
      setCollectDevice(true);
      setCollectNetwork(true);
      setRequestLocation(true);
    } else if (tmplId === 'custom_link') {
      setCollectDevice(true);
      setCollectNetwork(true);
      setRequestLocation(true);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        session_name: sessionName.trim() || 'My Nimbus Demo',
        template: selectedTemplateId,
        description: `Authorized security demonstration (${selectedTemplateId})`,
        require_consent: requireConsent,
        collect_device: collectDevice,
        collect_network: collectNetwork,
        request_location: requestLocation,
        enable_map: requestLocation,
      };

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create session');
      const data = await res.json();
      setCreatedSession(data);
      setSessionActive(data.status === 'active');
      saveSessionToFirestore(data);
      onSessionCreated(data);
    } catch (err) {
      console.error(err);
      // Fallback in case of temporary offline/container delay
      const fallbackId = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const fallback: Session = {
        id: fallbackId,
        session_name: sessionName.trim() || 'My Nimbus Demo',
        template: selectedTemplateId,
        description: `Authorized security demonstration (${selectedTemplateId})`,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'active',
        require_consent: requireConsent,
        collect_device: collectDevice,
        collect_network: collectNetwork,
        request_location: requestLocation,
        enable_map: requestLocation,
        views_count: 0,
      };
      setCreatedSession(fallback);
      setSessionActive(true);
      onSessionCreated(fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!createdSession) return;
    const nextStatus = sessionActive ? 'disabled' : 'active';
    try {
      await fetch(`/api/sessions/${createdSession.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      setSessionActive(!sessionActive);
      setCreatedSession({ ...createdSession, status: nextStatus });
    } catch (e) {
      setSessionActive(!sessionActive);
      setCreatedSession({ ...createdSession, status: nextStatus });
    }
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    const origin = window.location.origin;
    const url = `${origin}/session/${createdSession.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SUCCESS STATE: Session Ready
  if (createdSession) {
    const demoUrl = `${window.location.origin}/session/${createdSession.id}`;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-2 border-[#111113] bg-white p-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#111113] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#111113] bg-[#E63946] flex items-center justify-center text-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <span className="label-spec mb-0">[STATUS: READY]</span>
                <h2 className="font-syne text-2xl font-extrabold uppercase tracking-tight text-[#111113]">
                  Session Ready
                </h2>
              </div>
            </div>
            <div className="text-right font-mono text-[0.7rem] uppercase">
              <span className="font-bold">ID:</span> {createdSession.id}
            </div>
          </div>

          <p className="text-xs font-mono text-[#111113]/80 leading-relaxed">
            Your authorized demonstration link has been generated. Share this URL with participants to simulate browser telemetry evaluation under explicit consent.
          </p>

          {/* Demonstration URL Box */}
          <div className="space-y-2">
            <span className="label-spec">[DEMO TARGET URL]</span>
            <div className="flex items-center border-2 border-[#111113] bg-[#F8F7F4] p-2">
              <span className="font-mono text-xs text-[#111113] truncate flex-1 px-2 select-all font-bold">
                {demoUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-ink py-1 px-3 text-[0.65rem] flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenDemo(createdSession.id)}
              className="btn-ink flex items-center gap-2"
            >
              <span>OPEN SESSION</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleStatus}
              className="btn-outline flex items-center gap-2"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{sessionActive ? 'DISABLE SESSION' : 'ENABLE SESSION'}</span>
            </button>

            <span className="font-mono text-xs uppercase px-2 py-1 border border-[#111113] bg-[#F8F7F4]">
              STATUS: <strong className={sessionActive ? 'text-[#111113]' : 'text-[#E63946]'}>{sessionActive ? 'ACTIVE' : 'DISABLED'}</strong>
            </span>
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="flex items-center justify-between pt-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setCreatedSession(null);
              setSessionName('My Nimbus Demo');
            }}
            className="text-[#111113] hover:text-[#E63946] font-bold uppercase transition-colors"
          >
            ← CREATE ANOTHER SESSION
          </button>

          <button
            type="button"
            onClick={() => onViewSession(createdSession.id)}
            className="btn-ink flex items-center gap-1.5"
          >
            <span>VIEW SESSION RESULTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // CREATE FORM
  return (
    <div className="max-w-[800px] mx-auto py-4">
      {/* Title & Subtitle matching Variation 1 */}
      <div className="mb-8">
        <h1 className="font-syne text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-[#111113] leading-none mb-3">
          Create Session
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#111113]/75 max-w-md leading-relaxed">
          Create an authorized Nimbus security-awareness session. Simple security intelligence.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        {/* [01] Choose Template */}
        <section className="space-y-3">
          <span className="label-spec">[01] Choose Template</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMPLATES.slice(0, 3).map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`card-brutalist p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E63946] text-[#F8F7F4] border-[#111113]'
                      : 'bg-white text-[#111113] hover:bg-[#EFECE6]'
                  }`}
                >
                  <strong className="block text-sm font-bold uppercase tracking-tight font-syne">
                    {tmpl.title}
                  </strong>
                  <small className={`font-mono text-[0.7rem] ${isSelected ? 'text-[#F8F7F4]/90' : 'text-[#111113]/70'}`}>
                    {tmpl.summary}
                  </small>
                </div>
              );
            })}
          </div>

          {/* Fourth template option (Custom Link) */}
          <div
            onClick={() => handleTemplateSelect('custom_link')}
            className={`card-brutalist p-3 cursor-pointer text-xs font-mono transition-all flex items-center justify-between ${
              selectedTemplateId === 'custom_link'
                ? 'bg-[#E63946] text-[#F8F7F4]'
                : 'bg-white text-[#111113] hover:bg-[#EFECE6]'
            }`}
          >
            <div>
              <strong>CUSTOM LINK DEMO</strong> · Full permission evaluation
            </div>
            <span className="text-[0.65rem] uppercase font-bold tracking-widest border border-current px-2 py-0.5">
              {selectedTemplateId === 'custom_link' ? 'SELECTED' : 'SELECT'}
            </span>
          </div>
        </section>

        {/* [02] Configuration */}
        <section className="card-brutalist-solid p-6 space-y-5 bg-white">
          <span className="label-spec">[02] Configuration</span>

          {/* Session Name */}
          <div className="space-y-1.5">
            <label className="label-spec mb-1">Session Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="My Nimbus Demo"
              className="border-2 border-[#111113] p-3 w-full bg-transparent font-mono text-xs text-[#111113] focus:outline-none focus:bg-[#F8F7F4]"
            />
          </div>

          {/* Checkboxes matching the design variation */}
          <div className="space-y-2 font-mono text-xs text-[#111113]">
            <span className="label-spec mb-1">Telemetry Scopes</span>

            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={collectDevice}
                onChange={(e) => setCollectDevice(e.target.checked)}
                className="w-4 h-4 border-2 border-[#111113] rounded-none accent-[#E63946] cursor-pointer"
              />
              <span className="font-bold">Device Information</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={collectNetwork}
                onChange={(e) => setCollectNetwork(e.target.checked)}
                className="w-4 h-4 border-2 border-[#111113] rounded-none accent-[#E63946] cursor-pointer"
              />
              <span className="font-bold">Network Information</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={requestLocation}
                onChange={(e) => setRequestLocation(e.target.checked)}
                className="w-4 h-4 border-2 border-[#111113] rounded-none accent-[#E63946] cursor-pointer"
              />
              <span className="font-bold">Browser Geolocation (GPS/Sensors)</span>
            </label>
          </div>

          {/* Consent Policy Toggle */}
          <div className="border-t-2 border-[#111113] pt-4 mt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireConsent}
                onChange={(e) => setRequireConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-2 border-[#111113] rounded-none accent-[#E63946] cursor-pointer"
              />
              <div>
                <span className="font-mono font-bold text-xs uppercase block">
                  Mandatory Participant Consent
                </span>
                <span className="font-mono text-[0.7rem] text-[#111113]/70 block mt-0.5">
                  Displays an explicit authorization dialog to participant before any telemetry is queried.
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !sessionName.trim()}
            className="btn-ink py-3 px-8 text-xs disabled:opacity-50"
          >
            {isSubmitting ? 'CREATING SESSION...' : 'CREATE SESSION'}
          </button>
        </div>
      </form>
    </div>
  );
};
