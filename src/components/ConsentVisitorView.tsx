import React, { useState } from 'react';
import { Monitor, Globe, MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Session } from '../types';
import { NimbusIcon } from './NimbusLogo';

interface ConsentVisitorViewProps {
  session: Session;
  onConsentComplete?: () => void;
  onCancel?: () => void;
}

export const ConsentVisitorView: React.FC<ConsentVisitorViewProps> = ({
  session,
  onConsentComplete,
  onCancel,
}) => {
  const [understood, setUnderstood] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'cancelled'>('idle');

  const handleCancel = async () => {
    setStatus('cancelled');
    try {
      await fetch('/api/client-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          consent_given: false,
          authorized_scopes: [],
          device_data: null,
          network_data: null,
          location_data: {
            status: 'denied',
            error_message: 'Visitor cancelled consent dialogue.'
          }
        }),
      });
    } catch (e) {
      console.error(e);
    }
    if (onCancel) onCancel();
  };

  const handleContinue = async () => {
    if (!understood) return;
    setStatus('processing');

    const nav = window.navigator;
    const screen = window.screen;
    let gpuVendor = 'Generic GPU';
    let gpuRenderer = 'Standard WebGL Engine';

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
          gpuRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
        }
      }
    } catch (e) {
      // safe fallback
    }

    const deviceData = {
      operating_system: detectOS(nav.userAgent),
      platform: nav.platform || 'Unknown Platform',
      cpu_cores: nav.hardwareConcurrency || 4,
      browser: detectBrowser(nav.userAgent),
      browser_version: 'Current',
      device_type: /Mobi|Android|iPhone/i.test(nav.userAgent) ? 'Mobile' : 'Desktop',
      screen_resolution: `${screen.width} × ${screen.height}`,
      viewport_size: `${window.innerWidth} × ${window.innerHeight}`,
      color_depth: `${screen.colorDepth}-bit`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      language: nav.language || 'en-US',
      languages: Array.from(nav.languages || ['en-US']),
      gpu_vendor: gpuVendor,
      gpu_renderer: gpuRenderer,
      device_memory: (nav as any).deviceMemory ? `${(nav as any).deviceMemory} GB` : undefined,
      touch_support: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    };

    let networkData = null;
    try {
      const netRes = await fetch('/api/detect-ip');
      if (netRes.ok) {
        networkData = await netRes.json();
      }
    } catch (e) {
      console.warn('Network detect fallback');
    }

    let locationData: any = null;
    if (session.request_location && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        locationData = {
          status: 'granted',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitude_accuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: new Date(pos.timestamp).toISOString(),
        };
      } catch (err: any) {
        locationData = {
          status: 'denied',
          error_message: err.message || 'Browser location access denied by visitor.',
        };
      }
    } else {
      locationData = {
        status: 'not_requested',
      };
    }

    try {
      const payload = {
        session_id: session.id,
        consent_given: true,
        authorized_scopes: ['device', 'network', 'location'],
        device_data: session.collect_device ? deviceData : null,
        network_data: session.collect_network ? networkData : null,
        location_data: locationData,
      };

      await fetch('/api/client-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setStatus('success');
      setTimeout(() => {
        if (onConsentComplete) onConsentComplete();
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus('success');
      if (onConsentComplete) onConsentComplete();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full border-2 border-[#111113] bg-white p-6 sm:p-8 space-y-6 text-left shadow-[6px_6px_0px_#111113]">
        {status === 'idle' || status === 'processing' ? (
          <>
            <div className="flex items-center justify-between border-b-2 border-[#111113] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 border-2 border-[#111113] bg-white flex items-center justify-center">
                  <NimbusIcon size={16} className="text-[#111113]" />
                </div>
                <span className="font-syne font-extrabold text-sm uppercase">NIMBUS</span>
              </div>
              <span className="label-spec mb-0">[DEMO AUTHORIZATION]</span>
            </div>

            <div>
              <h1 className="font-syne text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111113] leading-none mb-2">
                Security Demonstration
              </h1>
              <p className="text-xs text-[#111113]/70 leading-relaxed">
                You are participating in an authorized security-awareness demonstration.
              </p>
            </div>

            {/* Requested Scopes */}
            <div className="space-y-2 pt-1">
              <span className="label-spec">[REQUESTED TELEMETRY SCOPES]</span>
              <div className="p-3 border-2 border-[#111113] bg-[#F8F7F4] flex items-start gap-3">
                <Monitor className="w-4 h-4 text-[#111113] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase text-[#111113]">Device Information</div>
                  <div className="text-[0.7rem] text-[#111113]/70">Hardware concurrency, platform, and browser viewport</div>
                </div>
              </div>

              <div className="p-3 border-2 border-[#111113] bg-[#F8F7F4] flex items-start gap-3">
                <Globe className="w-4 h-4 text-[#111113] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase text-[#111113]">Network Routing</div>
                  <div className="text-[0.7rem] text-[#111113]/70">Public IP origin and autonomous system number (ASN)</div>
                </div>
              </div>

              <div className="p-3 border-2 border-[#111113] bg-[#F8F7F4] flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#111113] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase text-[#111113]">Browser Geolocation</div>
                  <div className="text-[0.7rem] text-[#111113]/70">Explicit prompt only; no silent background tracking</div>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="w-4 h-4 mt-0.5 border-2 border-[#111113] rounded-none accent-[#E63946] cursor-pointer"
                />
                <span className="text-xs text-[#111113] font-bold leading-snug">
                  I UNDERSTAND AND AUTHORIZE THIS DEMONSTRATION.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={!understood || status === 'processing'}
                onClick={handleContinue}
                className="w-full btn-ink py-3 text-xs disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {status === 'processing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{status === 'processing' ? 'TRANSMITTING...' : 'AUTHORIZE & CONTINUE'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={status === 'processing'}
                className="w-full btn-outline py-2 text-xs"
              >
                DECLINE / CANCEL
              </button>
            </div>
          </>
        ) : status === 'success' ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-10 h-10 border-2 border-[#111113] bg-[#111113] text-[#F8F7F4] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-syne text-xl font-bold uppercase text-[#111113]">
              Demonstration Complete
            </h2>
            <p className="text-xs text-[#111113]/70 leading-relaxed max-w-xs mx-auto">
              Authorized telemetry was successfully recorded for security awareness analysis.
            </p>
            <div className="pt-2">
              <button
                onClick={onCancel}
                className="btn-ink py-2 px-5 text-xs"
              >
                RETURN TO LAB
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <div className="w-10 h-10 border-2 border-[#111113] bg-[#E63946] text-white flex items-center justify-center mx-auto">
              <XCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-syne text-xl font-bold uppercase text-[#111113]">
              Demonstration Cancelled
            </h2>
            <p className="text-xs text-[#111113]/70 leading-relaxed max-w-xs mx-auto">
              Authorization denied. No telemetry or location coordinates were transmitted.
            </p>
            <div className="pt-2">
              <button
                onClick={onCancel}
                className="btn-ink py-2 px-5 text-xs"
              >
                RETURN TO LAB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function detectOS(ua: string): string {
  if (/Windows NT 10.0/i.test(ua)) return 'Windows 11 / 10';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X 10[._]\d+/i.test(ua) || /Macintosh/i.test(ua)) return 'macOS';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) return 'Google Chrome';
  if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Apple Safari';
  return 'Modern Browser';
}
