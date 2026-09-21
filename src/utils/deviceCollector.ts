import { DeviceData } from '../types';

export function collectClientDeviceInfo(sessionId: string): DeviceData {
  const userAgent = navigator.userAgent || '';
  
  // OS Detection
  let os = 'Unknown OS';
  if (/Windows NT 10.0/i.test(userAgent)) os = 'Windows 10 / 11';
  else if (/Windows NT 6.3/i.test(userAgent)) os = 'Windows 8.1';
  else if (/Windows NT 6.2/i.test(userAgent)) os = 'Windows 8';
  else if (/Windows NT 6.1/i.test(userAgent)) os = 'Windows 7';
  else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    const match = userAgent.match(/Mac OS X ([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/Android/i.test(userAgent)) {
    const match = userAgent.match(/Android ([0-9.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const match = userAgent.match(/OS ([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/CrOS/i.test(userAgent)) {
    os = 'ChromeOS';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux (X11 / Wayland)';
  }

  // Browser Detection
  let browser = 'Unknown Browser';
  let browserVersion = 'Unknown';
  if (/Edg\/([0-9.]+)/i.test(userAgent)) {
    browser = 'Microsoft Edge';
    browserVersion = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    browser = 'Google Chrome';
    browserVersion = RegExp.$1;
  } else if (/Firefox\/([0-9.]+)/i.test(userAgent)) {
    browser = 'Mozilla Firefox';
    browserVersion = RegExp.$1;
  } else if (/Safari\/([0-9.]+)/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Apple Safari';
    const match = userAgent.match(/Version\/([0-9.]+)/);
    browserVersion = match ? match[1] : RegExp.$1;
  } else if (/OPR\/([0-9.]+)/i.test(userAgent)) {
    browser = 'Opera';
    browserVersion = RegExp.$1;
  }

  // Device Type
  let deviceType: DeviceData['device_type'] = 'Desktop';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(userAgent)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iPhone|Android/i.test(userAgent)) {
    deviceType = 'Mobile';
  }

  // CPU Cores
  const cpuCores = navigator.hardwareConcurrency || 'Restricted by browser';

  // Screen resolution
  const screenResolution = `${window.screen?.width || 0} x ${window.screen?.height || 0} px`;
  const viewportSize = `${window.innerWidth} x ${window.innerHeight} px`;
  const colorDepth = window.screen?.colorDepth ? `${window.screen.colorDepth}-bit` : 'Unknown';

  // Timezone
  let timezone = 'Unknown';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    timezone = 'UTC';
  }

  // Language
  const language = navigator.language || 'en-US';
  const languages = Array.from(navigator.languages || [language]);

  // Touch Support
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // GPU info via standard WebGL debug extension (if available/unmasked)
  let gpuVendor: string = 'Unavailable (Restricted sandbox)';
  let gpuRenderer: string = 'Unavailable (Restricted sandbox)';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Standard WebGL Vendor';
        gpuRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Standard WebGL Engine';
      } else {
        gpuVendor = 'Standard WebGL (Vendor Masked)';
        gpuRenderer = (gl as any).getParameter((gl as any).RENDERER) || 'WebGL Rasterizer';
      }
    }
  } catch (e) {
    gpuVendor = 'Security Sandbox Protected';
    gpuRenderer = 'Security Sandbox Protected';
  }

  // Device Memory (RAM) - Chromium standard API
  let deviceMemory: string | number = 'Unavailable (Not exposed by browser)';
  if ('deviceMemory' in navigator && typeof (navigator as any).deviceMemory === 'number') {
    deviceMemory = `${(navigator as any).deviceMemory} GB`;
  }

  return {
    session_id: sessionId,
    operating_system: os,
    platform: navigator.platform || 'Unknown',
    cpu_cores: cpuCores,
    browser,
    browser_version: browserVersion,
    device_type: deviceType,
    screen_resolution: screenResolution,
    viewport_size: viewportSize,
    color_depth: colorDepth,
    timezone,
    language,
    languages,
    gpu_vendor: gpuVendor,
    gpu_renderer: gpuRenderer,
    device_memory: deviceMemory,
    touch_support: touchSupport,
    timestamp: new Date().toISOString()
  };
}

export function requestBrowserGeolocation(): Promise<{
  granted: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  status: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'not_requested';
  error_message?: string;
}> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      return resolve({
        granted: false,
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        heading: null,
        speed: null,
        status: 'unavailable',
        error_message: 'Geolocation API is not supported by this browser engine.'
      });
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          granted: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy * 10) / 10,
          altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude * 10) / 10 : null,
          heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : null,
          speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 10) / 10 : null,
          status: 'granted'
        });
      },
      (err) => {
        let status: 'denied' | 'unavailable' | 'timeout' = 'denied';
        let error_message = 'Location permission denied by user.';
        if (err.code === err.POSITION_UNAVAILABLE) {
          status = 'unavailable';
          error_message = 'Location information is unavailable on this device/network.';
        } else if (err.code === err.TIMEOUT) {
          status = 'timeout';
          error_message = 'Location request timed out before receiving coordinates.';
        }

        resolve({
          granted: false,
          latitude: null,
          longitude: null,
          accuracy: null,
          altitude: null,
          heading: null,
          speed: null,
          status,
          error_message
        });
      },
      options
    );
  });
}
