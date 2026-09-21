import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Globe, 
  MapPin, 
  Lock, 
  Layers, 
  FolderLock, 
  MessageSquare, 
  Send, 
  Video, 
  CheckSquare, 
  CornerDownRight, 
  Link2,
  ArrowRight,
  Eye,
  RefreshCw,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Session, DeviceData, LocationData } from '../types';
import { collectClientDeviceInfo, requestBrowserGeolocation } from '../utils/deviceCollector';
import { api } from '../services/api';

interface DemoParticipantExperienceProps {
  session: Session;
  onClose: () => void;
  onDataCollectedSuccessfully?: () => void;
}

export const DemoParticipantExperience: React.FC<DemoParticipantExperienceProps> = ({
  session,
  onClose,
  onDataCollectedSuccessfully
}) => {
  // Step: 'consent' | 'processing' | 'simulated_template' | 'cancelled'
  const [step, setStep] = useState<'consent' | 'processing' | 'simulated_template' | 'cancelled'>('consent');
  
  // Consent Checkboxes (Section 5 Requirement)
  const [understoodCheckbox, setUnderstoodCheckbox] = useState(false);
  const [authorizedCheckbox, setAuthorizedCheckbox] = useState(false);

  // Status & Telemetry Preview
  const [statusMessage, setStatusMessage] = useState('Awaiting participant consent...');
  const [collectedDevice, setCollectedDevice] = useState<DeviceData | null>(null);
  const [locationResult, setLocationResult] = useState<any>(null);
  const [showTransparencyDrawer, setShowTransparencyDrawer] = useState(false);

  // Template simulated interactions
  const [simulatedNearYouRadius, setSimulatedNearYouRadius] = useState(5);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'System', text: 'Welcome to this security awareness simulated workspace.' }
  ]);

  useEffect(() => {
    // Record visit on load
    api.recordVisit(session.id);
  }, [session.id]);

  const canContinue = understoodCheckbox && authorizedCheckbox;

  const handleContinue = async () => {
    if (!canContinue) return;
    setStep('processing');
    setStatusMessage('Compiling client device parameters with authorized consent...');

    // 1. Collect Client Device Info (Standard Browser APIs)
    const deviceInfo = collectClientDeviceInfo(session.id);
    setCollectedDevice(deviceInfo);

    // 2. Request Geolocation IF requested by session configuration
    let locResult: any = {
      status: 'not_requested',
      latitude: null,
      longitude: null,
      accuracy: null
    };

    if (session.request_location) {
      setStatusMessage('Requesting standard browser geolocation permission...');
      locResult = await requestBrowserGeolocation();
      setLocationResult(locResult);
    }

    setStatusMessage('Transmitting authorized telemetry to TraceLab intelligence database...');

    try {
      await api.submitCollection(session.id, {
        consent_given: true,
        authorized_scopes: ['device', 'network', ...(session.request_location ? ['location'] : [])],
        consent_version: '1.2-strict-educational',
        device_info: deviceInfo,
        location_info: locResult
      });

      if (onDataCollectedSuccessfully) {
        onDataCollectedSuccessfully();
      }
      setStep('simulated_template');
    } catch (err: any) {
      console.error('Collection submission error:', err);
      // Still show educational template so participant learns
      setStep('simulated_template');
    }
  };

  const handleCancel = () => {
    setStep('cancelled');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center justify-center animate-in fade-in">
      {/* Top Header Bar for Participant Simulator */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold">TraceLab Awareness Gateway</span>
          <span className="text-slate-500">• Session ID: {session.id.slice(0, 8)}</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          Exit to Console
        </button>
      </div>

      {/* STEP 1: CONSENT PAGE (Section 5 Requirement) */}
      {step === 'consent' && (
        <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Security Awareness Demonstration
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Security Information Demonstration
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              This authorized demonstration can collect technical information from your browser and, if you approve it, your current browser-provided location.
            </p>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs font-mono">
            <div className="text-cyan-400 font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>What information is requested for demonstration purposes:</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 pl-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Device & Browser:</strong> Operating system, browser version, screen dimensions, CPU concurrency, and GPU graphics engine.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Network Origin:</strong> Public IPv4/IPv6 address and ISP autonomous system details.</span>
              </li>
              {session.request_location && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Browser Geolocation:</strong> If granted via your browser prompt, high-precision coordinates will be compared against coarse IP data.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Explicit Checkboxes (Section 5 Mandatory Verbatim) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-cyan-900/50">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understoodCheckbox}
                onChange={(e) => setUnderstoodCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 cursor-pointer"
              />
              <span className="text-xs text-slate-200 group-hover:text-white font-mono select-none">
                I understand what information will be collected.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={authorizedCheckbox}
                onChange={(e) => setAuthorizedCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 cursor-pointer"
              />
              <span className="text-xs text-slate-200 group-hover:text-white font-mono select-none">
                I authorize this security demonstration.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white text-xs font-mono font-semibold transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROCESSING */}
      {step === 'processing' && (
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto"></div>
          <h3 className="text-lg font-bold text-white">Auditing Browser Telemetry...</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">{statusMessage}</p>
        </div>
      )}

      {/* STEP 3: SIMULATED DEMONSTRATION EXPERIENCE (Section 2 Templates) */}
      {step === 'simulated_template' && (
        <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6 text-slate-200 relative">
          {/* Universal Mandatory Banner */}
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-center font-mono text-xs text-cyan-300 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">Security Awareness Demonstration</span>
            <span className="text-slate-400 text-[11px]">— Not affiliated with any commercial service</span>
          </div>

          {/* Dynamic Template UI Preview */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            {/* 01: NearYou Demo */}
            {session.template === 'near_you' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>NearYou Simulated Search Radius</span>
                </div>
                <p className="text-xs text-slate-400">
                  This demo illustrates how web portals utilize the browser Geolocation API to find nearby nodes within a specified radius.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Search Radius:</span>
                    <span className="text-cyan-400 font-bold">{simulatedNearYouRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={simulatedNearYouRadius}
                    onChange={(e) => setSimulatedNearYouRadius(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-300">
                    Geolocation Status: <span className={locationResult?.granted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {locationResult?.granted ? `GPS Fixed (±${locationResult.accuracy}m)` : 'Permission Declined / Coarse IP Mode'}
                    </span>
                  </div>
                  {locationResult?.granted && (
                    <div className="text-slate-400 text-[11px]">
                      Coordinates: {locationResult.latitude.toFixed(4)}, {locationResult.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 02: Cloud Storage Demo */}
            {session.template === 'cloud_storage' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <FolderLock className="w-4 h-4" />
                  <span>Generic Enterprise Cloud Storage Sandbox</span>
                </div>
                <p className="text-xs text-slate-400">
                  Simulating a corporate file sharing landing portal. Notice how modern portals legitimately adapt rendering to your device resolution.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">AUDIT FOLDER</span>
                    <span className="text-white">Q3_Security_Report.pdf</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">DEVICE VIEWPORT</span>
                    <span className="text-cyan-300">{collectedDevice?.screen_resolution}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 03: Messaging Demo & 05: Communication Demo */}
            {(session.template === 'messaging' || session.template === 'communication') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>Generic Awareness Communication Simulator</span>
                </div>
                <p className="text-xs text-slate-400">
                  A simulated web client demonstrating that instant messengers read your system timezone ({collectedDevice?.timezone}) to timestamp incoming messages accurately.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto space-y-2 text-xs font-mono">
                  {chatHistory.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-cyan-400 font-semibold">{c.sender}:</span>
                      <span className="text-slate-300">{c.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a test message..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatMessage.trim()) {
                        setChatHistory([...chatHistory, { sender: 'Participant', text: chatMessage.trim() }]);
                        setChatMessage('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (chatMessage.trim()) {
                        setChatHistory([...chatHistory, { sender: 'Participant', text: chatMessage.trim() }]);
                        setChatMessage('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-mono"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* 04: Redirect Demo */}
            {session.template === 'redirect' && (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <CornerDownRight className="w-4 h-4" />
                  <span>Safe Gateway Redirect Workflow</span>
                </div>
                <p className="text-slate-400">
                  This demonstrates how link verification gateways check incoming User-Agent headers to ensure target platforms match safe organizational policy.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div>Detected Client OS: <span className="text-white font-semibold">{collectedDevice?.operating_system}</span></div>
                  <div>Browser Engine: <span className="text-cyan-300">{collectedDevice?.browser}</span></div>
                  <div className="text-emerald-400">Status: Platform verified as authorized test environment.</div>
                </div>
              </div>
            )}

            {/* 06: Meeting Demo */}
            {session.template === 'meeting' && (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Video className="w-4 h-4" />
                  <span>Simulated Video Meeting Lobby</span>
                </div>
                <p className="text-slate-400">
                  Demonstrates how browser conference lobbies probe WebGL hardware acceleration to optimize video rendering codecs.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div>GPU Vendor: <span className="text-white">{collectedDevice?.gpu_vendor}</span></div>
                  <div>GPU Renderer: <span className="text-cyan-300 break-all">{collectedDevice?.gpu_renderer}</span></div>
                  <div>CPU Core Estimate: <span className="text-emerald-400">{collectedDevice?.cpu_cores} threads</span></div>
                </div>
              </div>
            )}

            {/* 07: CAPTCHA Demo */}
            {session.template === 'captcha' && (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <CheckSquare className="w-4 h-4" />
                  <span>Permission-Awareness Verification Challenge</span>
                </div>
                <p className="text-slate-400">
                  Security awareness training on evaluating verification prompts. Legitimate verification should never secretly request location permissions without clear disclaimers.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={captchaChecked}
                      onChange={(e) => setCaptchaChecked(e.target.checked)}
                      className="w-5 h-5 rounded text-cyan-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-white font-semibold">I verify I am completing this awareness test</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
                    {captchaChecked ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>
            )}

            {/* 08: Custom Link */}
            {session.template === 'custom_link' && (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Link2 className="w-4 h-4" />
                  <span>{session.custom_title || 'Custom Awareness Demonstration'}</span>
                </div>
                <p className="text-slate-400">
                  {session.custom_prompt || 'Reviewing custom security awareness criteria specified by the SOC administrator.'}
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                  Telemetry audit logged with explicit consent version 1.2.
                </div>
              </div>
            )}
          </div>

          {/* Educational Transparency Inspector Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setShowTransparencyDrawer(!showTransparencyDrawer)}
              className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{showTransparencyDrawer ? 'Hide Transmitted Data Receipt' : 'View Transmitted Data Receipt'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors"
            >
              Finish & Return to Console
            </button>
          </div>

          {/* Drawer showing exactly what was collected (Full transparency) */}
          {showTransparencyDrawer && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-cyan-300 font-semibold">
                <span>Transmitted Technical Data Receipt</span>
                <span className="text-[10px] text-slate-500">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>OS: <span className="text-white">{collectedDevice?.operating_system}</span></div>
                <div>Browser: <span className="text-white">{collectedDevice?.browser}</span></div>
                <div>Resolution: <span className="text-white">{collectedDevice?.screen_resolution}</span></div>
                <div>CPU Cores: <span className="text-white">{collectedDevice?.cpu_cores}</span></div>
                <div>Timezone: <span className="text-white">{collectedDevice?.timezone}</span></div>
                <div>GPU: <span className="text-white truncate block">{collectedDevice?.gpu_renderer}</span></div>
                <div className="col-span-2">
                  GPS Status: <span className={locationResult?.granted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {locationResult?.granted ? `Lat: ${locationResult.latitude}, Lng: ${locationResult.longitude} (Accuracy: ±${locationResult.accuracy}m)` : 'Declined / Not Granted'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: CANCELLED */}
      {step === 'cancelled' && (
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Demonstration Cancelled</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            No telemetry or location information was collected from your browser.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
          >
            Close Window
          </button>
        </div>
      )}
    </div>
  );
};
