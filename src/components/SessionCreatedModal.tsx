import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  QrCode, 
  PowerOff, 
  X, 
  ShieldAlert, 
  Lock,
  Share2
} from 'lucide-react';
import { Session } from '../types';

interface SessionCreatedModalProps {
  session: Session;
  onClose: () => void;
  onOpenDemo: (sessionId: string) => void;
  onShowQRCode: (url: string) => void;
  onToggleDisable: (sessionId: string) => void;
}

export const SessionCreatedModal: React.FC<SessionCreatedModalProps> = ({
  session,
  onClose,
  onOpenDemo,
  onShowQRCode,
  onToggleDisable
}) => {
  const [copied, setCopied] = useState(false);

  const demoUrl = `${window.location.origin}/session/${session.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 space-y-5 text-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
              Security Protocol Initialized
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Session Created
            </h2>
          </div>
        </div>

        {/* Session details */}
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Session Name
            </span>
            <p className="text-sm font-semibold text-white">{session.session_name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Session ID
              </span>
              <p className="font-mono text-xs text-cyan-300 select-all font-semibold break-all">
                {session.id}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Status / Expiration
              </span>
              <p className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE (Expires {new Date(session.expires_at).toLocaleDateString()})
              </p>
            </div>
          </div>

          {/* Demonstration URL Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                Demonstration URL
              </span>
              <span className="text-[10px] text-slate-500 font-mono">NON-DECEPTIVE DOMAIN</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={demoUrl}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Sharing Warning */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] leading-relaxed">
            &ldquo;Share this URL only with users who have authorized this security demonstration.&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenDemo(session.id);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Demo</span>
          </button>

          <button
            onClick={() => onShowQRCode(demoUrl)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>QR Code</span>
          </button>

          <button
            onClick={() => onToggleDisable(session.id)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-mono transition-colors"
          >
            <PowerOff className="w-3.5 h-3.5 text-rose-400" />
            <span>{session.status === 'disabled' ? 'Enable' : 'Disable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
