import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Info, 
  Globe, 
  Smartphone, 
  AlertCircle,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Security Awareness Mission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          About TraceLab — Security Intelligence Lab
        </h1>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          TraceLab is an authorized security-awareness and device-information demonstration platform created for cybersecurity educators, blue team analysts, and enterprise awareness officers.
        </p>
      </div>

      {/* Core Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Principle 1: Ethical Transparency */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Strict Transparency & Consent First</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            TraceLab mandates explicit user consent before any browser capability or location probe is initiated. All data collected is strictly declared beforehand, eliminating deceptive flows and social engineering tricks.
          </p>
        </div>

        {/* Principle 2: Zero Brand Impersonation */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Third-Party Impersonation</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            TraceLab strictly prohibits and refrains from impersonating real-world services such as Google Drive, WhatsApp, Telegram, Zoom, or Google. Every simulation is transparently labeled: <em>&ldquo;Security Awareness Demonstration&rdquo;</em>.
          </p>
        </div>

        {/* Principle 3: Browser Geolocation vs IP */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Globe className="w-4 h-4" />
            <span>IP-Derived vs. Physical GPS Differential</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            One of the platform&apos;s primary educational values is demonstrating the immense precision delta between IP-derived network ingress points (15-50km radius) and authentic browser-provided GPS coordinates (±10m radius).
          </p>
        </div>

        {/* Principle 4: Standard Browser APIs Only */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Legitimate Standard Browser APIs</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            TraceLab collects only information legitimately made available by standard, W3C-compliant browser specifications (Screen, Platform, Navigator, WebGL renderer). It never uses invasive fingerprinting exploits or private network probing.
          </p>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-900/40 text-xs font-mono text-cyan-200/90 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          <span>Usage Guidelines for Security Officers</span>
        </div>
        <p>
          1. Only conduct demonstrations with participants who have authorized inclusion in cybersecurity training exercises.
        </p>
        <p>
          2. Never distribute demonstration URLs disguised as operational or corporate communications without prior organizational clearance.
        </p>
        <p>
          3. Use the built-in Data Retention and Purge tools in the Security Center to safely eliminate participant records after concluding demonstration debriefs.
        </p>
      </div>
    </div>
  );
};
