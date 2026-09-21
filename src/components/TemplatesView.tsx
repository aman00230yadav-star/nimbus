import React from 'react';
import { 
  MapPin, 
  FolderLock, 
  MessageSquare, 
  CornerDownRight, 
  Send, 
  Video, 
  CheckCircle2, 
  Link2,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { TemplateDefinition } from '../types';

interface TemplatesViewProps {
  onSelectTemplateToCreate: (templateId: string) => void;
  onPreviewTemplate: (templateId: string) => void;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  near_you: MapPin,
  cloud_storage: FolderLock,
  messaging: MessageSquare,
  redirect: CornerDownRight,
  communication: Send,
  meeting: Video,
  captcha: CheckCircle2,
  custom_link: Link2,
};

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onSelectTemplateToCreate,
  onPreviewTemplate
}) => {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Awareness Simulation Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Choose an Experience
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Select a cybersecurity demonstration archetype. Every template strictly identifies as an educational awareness tool and requires explicit end-user consent before collecting device telemetry or geolocation.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>8 Standardized Demonstrations</span>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((tmpl) => {
          const Icon = TEMPLATE_ICONS[tmpl.id] || ShieldCheck;
          return (
            <div
              key={tmpl.id}
              className="group flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-4 transition-all"
            >
              {/* Awareness Pill */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-cyan-300 border border-slate-800">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Security Awareness
                </span>
              </div>

              {/* Template identifier and Icon */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500">
                    #{tmpl.number}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-950 text-cyan-400 border border-slate-800">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {tmpl.summary}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block tracking-wider font-semibold">
                    Demonstrates
                  </span>
                  <span className="text-cyan-300/90 block line-clamp-2">
                    {tmpl.demonstrates}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectTemplateToCreate(tmpl.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onPreviewTemplate(tmpl.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  title="Preview simulated experience"
                >
                  Preview
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
