import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, ShieldAlert, Radio, RefreshCw, Compass, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface MapsGroundingIntelligenceProps {
  latitude: number;
  longitude: number;
  sessionName?: string;
}

export const MapsGroundingIntelligence: React.FC<MapsGroundingIntelligenceProps> = ({
  latitude,
  longitude,
  sessionName = 'Security Evaluation'
}) => {
  const [loading, setLoading] = useState(false);
  const [intelligenceText, setIntelligenceText] = useState<string | null>(null);
  const [mapsLinks, setMapsLinks] = useState<Array<{ title: string; uri: string; snippet?: string }>>([]);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash');
  const [selectedAngle, setSelectedAngle] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const angles = [
    { id: 'all', label: 'FULL RECON', prompt: 'Comprehensive surrounding infrastructure, urban environment, and security perimeter.' },
    { id: 'infrastructure', label: 'CRITICAL INFRASTRUCTURE', prompt: 'Data centers, power facilities, municipal buildings, and telecommunication towers nearby.' },
    { id: 'access', label: 'ACCESS PERIMETERS', prompt: 'Transit hubs, public transit access, entry corridors, and road access vectors.' },
    { id: 'venues', label: 'SURROUNDING VENUES', prompt: 'Nearby public Wi-Fi zones, corporate facilities, and commercial gathering points.' }
  ];

  const fetchGrounding = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeAngle = angles.find(a => a.id === selectedAngle);
      const query = customPrompt || (activeAngle ? `${activeAngle.prompt} Provide actionable defensive recommendations and list relevant landmarks from Google Maps.` : undefined);

      const result = await api.getMapsIntelligence({
        latitude,
        longitude,
        query,
        sessionName
      });

      setIntelligenceText(result.text);
      setMapsLinks(result.mapsLinks || []);
      if (result.modelUsed) setModelUsed(result.modelUsed);
    } catch (err: any) {
      console.warn('Maps Grounding notice:', err?.message || err);
      setError(err?.message || 'Failed to fetch Google Maps Grounding data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrounding();
  }, [latitude, longitude, selectedAngle]);

  return (
    <div className="border-2 border-[#111113] bg-white p-5 font-mono shadow-[4px_4px_0px_#111113]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#111113]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E63946]"></span>
            <h3 className="font-syne text-lg font-bold tracking-tight text-[#111113] uppercase">
              GOOGLE MAPS GROUNDING INTELLIGENCE
            </h3>
          </div>
          <p className="text-xs text-[#111113]/70 mt-0.5">
            Target Coordinates: <span className="font-bold text-[#111113]">{latitude.toFixed(5)}°, {longitude.toFixed(5)}°</span> // Engine: <span className="text-[#E63946] font-bold">{modelUsed}</span>
          </p>
        </div>

        <button
          onClick={() => fetchGrounding()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[#111113] bg-[#F8F7F4] hover:bg-[#111113] hover:text-[#F8F7F4] transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'GROUNDING...' : 'REFRESH MAPS'}</span>
        </button>
      </div>

      {/* Reconnaissance Angles Tabs */}
      <div className="flex flex-wrap gap-2 pt-4 pb-3">
        {angles.map((angle) => (
          <button
            key={angle.id}
            onClick={() => setSelectedAngle(angle.id)}
            className={`text-xs px-2.5 py-1 border border-[#111113] font-bold transition-colors cursor-pointer ${
              selectedAngle === angle.id
                ? 'bg-[#111113] text-[#F8F7F4]'
                : 'bg-[#F8F7F4] text-[#111113] hover:bg-white'
            }`}
          >
            {angle.label}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="my-3 p-3 bg-[#E63946]/10 border border-[#E63946] text-xs text-[#E63946]">
          {error}
        </div>
      )}

      {/* Main Analysis Display */}
      <div className="mt-2 bg-[#F8F7F4] border-2 border-[#111113] p-4 text-xs leading-relaxed text-[#111113] min-h-[120px]">
        {loading && !intelligenceText ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#111113]/60">
            <RefreshCw className="w-5 h-5 animate-spin text-[#E63946]" />
            <p className="tracking-wider">QUERYING GOOGLE MAPS GROUNDING VIA GEMINI 3.5 FLASH...</p>
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-sans sm:font-mono">
            {intelligenceText}
          </div>
        )}
      </div>

      {/* Extracted Google Maps Links (Mandated Grounding Output) */}
      {mapsLinks.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-[#111113]">
          <div className="text-xs font-bold text-[#111113] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
            <span>VERIFIED GOOGLE MAPS CITATIONS & PLACES ({mapsLinks.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mapsLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-2.5 bg-white border border-[#111113] hover:border-[#E63946] hover:shadow-[2px_2px_0px_#E63946] transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#111113] group-hover:text-[#E63946] transition-colors line-clamp-1">
                    {link.title}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#111113]/50 group-hover:text-[#E63946] shrink-0" />
                </div>
                {link.snippet && (
                  <p className="text-[0.68rem] text-[#111113]/70 italic mt-1 line-clamp-2">
                    "{link.snippet}"
                  </p>
                )}
                <div className="text-[0.65rem] text-[#E63946] uppercase font-bold mt-2">
                  VIEW ON MAPS →
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
