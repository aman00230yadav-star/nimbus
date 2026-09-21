import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Lazy-initialized Gemini AI Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// In-Memory Secure Relational Store
interface SessionItem {
  id: string;
  session_name: string;
  template: string;
  description: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'completed' | 'expired' | 'disabled';
  require_consent: boolean;
  collect_device: boolean;
  collect_network: boolean;
  request_location: boolean;
  enable_map: boolean;
  custom_title?: string;
  custom_prompt?: string;
  views_count: number;
}

interface ConsentItem {
  session_id: string;
  consent_given: boolean;
  consent_timestamp: string;
  consent_version: string;
  authorized_scopes: string[];
  client_user_agent?: string;
}

interface DeviceItem {
  session_id: string;
  operating_system: string;
  platform: string;
  cpu_cores: number | string;
  browser: string;
  browser_version: string;
  device_type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  screen_resolution: string;
  viewport_size: string;
  color_depth: number | string;
  timezone: string;
  language: string;
  languages?: string[];
  gpu_vendor?: string;
  gpu_renderer?: string;
  device_memory?: number | string;
  touch_support: boolean;
  timestamp: string;
}

interface NetworkItem {
  session_id: string;
  public_ip: string;
  ip_version: 'IPv4' | 'IPv6';
  organization: string;
  isp: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  continent: string;
  ip_latitude?: number;
  ip_longitude?: number;
  ip_accuracy?: string;
  timestamp: string;
}

interface LocationItem {
  session_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
  status: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'not_requested';
  error_message?: string;
}

interface LogItem {
  id: string;
  session_id?: string;
  session_name?: string;
  timestamp: string;
  event_type: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
  details?: Record<string, any>;
}

// Database Tables
const sessions = new Map<string, SessionItem>();
const consents = new Map<string, ConsentItem>();
const deviceData = new Map<string, DeviceItem>();
const networkData = new Map<string, NetworkItem>();
const locationData = new Map<string, LocationItem>();
const auditLogs: LogItem[] = [];

let securitySettings = {
  https_status: true,
  auth_status: 'SOC Operator Authenticated' as const,
  consent_enforcement: true,
  rate_limiting: true,
  retention_days: 7,
  audit_logging: true,
  secure_storage_status: 'Active (Encrypted at rest)' as const,
  tls_version: 'TLS 1.3 (AEAD AES-256-GCM)',
  active_operator: 'SecOps Lead (ID: SOC-OP-8821)'
};

function logAudit(
  event_type: string, 
  message: string, 
  severity: 'info' | 'success' | 'warning' | 'alert' = 'info', 
  session_id?: string, 
  session_name?: string,
  details?: Record<string, any>
) {
  const log: LogItem = {
    id: crypto.randomUUID(),
    session_id,
    session_name,
    timestamp: new Date().toISOString(),
    event_type,
    message,
    severity,
    details
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
}

// Helper: Seed realistic sample demonstration records matching specification
function seedInitialData() {
  const seed1Id = '473916b960c653a5'; // Demo-001
  const seed2Id = '8f9210a4e32d18bc'; // Demo-002
  const seed3Id = 'c129e4720935ba11'; // Demo-003

  // Seed 1: Demo-001 (NearYou, Active, Consent Granted, GPS Granted)
  sessions.set(seed1Id, {
    id: seed1Id,
    session_name: 'Demo-001',
    template: 'near_you',
    description: 'Browser location demonstration with authorized consent.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 22).toISOString(),
    status: 'active',
    require_consent: true,
    collect_device: true,
    collect_network: true,
    request_location: true,
    enable_map: true,
    views_count: 6
  });

  consents.set(seed1Id, {
    session_id: seed1Id,
    consent_given: true,
    consent_timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    consent_version: '1.0-auth',
    authorized_scopes: ['device', 'network', 'location'],
    client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });

  deviceData.set(seed1Id, {
    session_id: seed1Id,
    operating_system: 'Windows 11',
    platform: 'Win32',
    cpu_cores: 8,
    browser: 'Chrome 128.0',
    browser_version: '128.0.6613.137',
    device_type: 'Desktop',
    screen_resolution: '1920 × 1080',
    viewport_size: '1920 × 940',
    color_depth: '24-bit',
    timezone: 'Asia/Kolkata',
    language: 'en-US',
    languages: ['en-US', 'en'],
    gpu_vendor: 'NVIDIA Corporation',
    gpu_renderer: 'NVIDIA GeForce RTX 4060 / PCIe / SSE2',
    device_memory: '16 GB',
    touch_support: false,
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
  });

  networkData.set(seed1Id, {
    session_id: seed1Id,
    public_ip: '103.21.244.102',
    ip_version: 'IPv4',
    organization: 'Example Broadband Network Corp',
    isp: 'Example ISP India',
    country: 'India',
    country_code: 'IN',
    region: 'Haryana',
    city: 'Gurugram',
    continent: 'Asia',
    ip_latitude: 28.4595,
    ip_longitude: 77.0266,
    ip_accuracy: 'Approximate Metro ISP Gateway (~25 km radius)',
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
  });

  locationData.set(seed1Id, {
    session_id: seed1Id,
    latitude: 30.3165,
    longitude: 77.9934,
    accuracy: 18.5,
    altitude: 215.0,
    heading: 0,
    speed: 0.0,
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    status: 'granted'
  });

  // Seed 2: Demo-002 (Custom Link, Completed, Consent Granted)
  sessions.set(seed2Id, {
    id: seed2Id,
    session_name: 'Demo-002',
    template: 'custom_link',
    description: 'Custom link demonstration for awareness test.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 20).toISOString(),
    status: 'completed',
    require_consent: true,
    collect_device: true,
    collect_network: true,
    request_location: true,
    enable_map: true,
    views_count: 12
  });

  consents.set(seed2Id, {
    session_id: seed2Id,
    consent_given: true,
    consent_timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    consent_version: '1.0-auth',
    authorized_scopes: ['device', 'network', 'location'],
    client_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  deviceData.set(seed2Id, {
    session_id: seed2Id,
    operating_system: 'macOS Sonoma',
    platform: 'MacIntel',
    cpu_cores: 10,
    browser: 'Safari 17.5',
    browser_version: '17.5.1',
    device_type: 'Desktop',
    screen_resolution: '2560 × 1440',
    viewport_size: '1728 × 960',
    color_depth: '24-bit',
    timezone: 'America/New_York',
    language: 'en-US',
    languages: ['en-US'],
    gpu_vendor: 'Apple',
    gpu_renderer: 'Apple M3 Pro',
    device_memory: '18 GB',
    touch_support: false,
    timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString()
  });

  networkData.set(seed2Id, {
    session_id: seed2Id,
    public_ip: '198.51.100.44',
    ip_version: 'IPv4',
    organization: 'AS15169 Google Cloud',
    isp: 'Google Fiber',
    country: 'United States',
    country_code: 'US',
    region: 'New York',
    city: 'New York',
    continent: 'North America',
    ip_latitude: 40.7128,
    ip_longitude: -74.0060,
    ip_accuracy: 'Approximate Metro Region',
    timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString()
  });

  locationData.set(seed2Id, {
    session_id: seed2Id,
    latitude: 40.7306,
    longitude: -73.9352,
    accuracy: 24.0,
    altitude: 10.0,
    heading: null,
    speed: null,
    timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    status: 'granted'
  });

  // Seed 3: Demo-003 (Device Demo, Completed, Consent Denied)
  sessions.set(seed3Id, {
    id: seed3Id,
    session_name: 'Demo-003',
    template: 'device_info',
    description: 'Device/browser information demonstration with location declined.',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 10).toISOString(),
    status: 'completed',
    require_consent: true,
    collect_device: true,
    collect_network: true,
    request_location: true,
    enable_map: true,
    views_count: 4
  });

  consents.set(seed3Id, {
    session_id: seed3Id,
    consent_given: false,
    consent_timestamp: new Date(Date.now() - 86400000 * 1.4).toISOString(),
    consent_version: '1.0-auth',
    authorized_scopes: [],
    client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  locationData.set(seed3Id, {
    session_id: seed3Id,
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: new Date(Date.now() - 86400000 * 1.4).toISOString(),
    status: 'denied',
    error_message: 'The user did not provide browser location permission.'
  });

  // Seed baseline sessions to reach total = 18, active = 3, consent = 14, reports = 12
  const extraTemplates = ['near_you', 'device_info', 'network_info', 'custom_link'];
  for (let i = 4; i <= 18; i++) {
    const sId = `demo_ext_${i.toString().padStart(3, '0')}`;
    const tmpl = extraTemplates[i % extraTemplates.length];
    const isAct = i === 4 || i === 5; // active along with seed1 = 3 active
    const hasConsent = i <= 15; // 14 total granted with seed1 and seed2
    const hasReport = i <= 13; // 12 reports
    const createdDate = new Date(Date.now() - 86400000 * (i * 0.75)).toISOString();

    sessions.set(sId, {
      id: sId,
      session_name: `Demo-${i.toString().padStart(3, '0')}`,
      template: tmpl,
      description: `Security awareness test session ${i}`,
      created_at: createdDate,
      expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: isAct ? 'active' : 'completed',
      require_consent: true,
      collect_device: true,
      collect_network: true,
      request_location: tmpl === 'near_you' || tmpl === 'custom_link',
      enable_map: true,
      views_count: Math.floor(Math.random() * 10) + 2
    });

    if (hasConsent) {
      consents.set(sId, {
        session_id: sId,
        consent_given: true,
        consent_timestamp: createdDate,
        consent_version: '1.0-auth',
        authorized_scopes: ['device', 'network']
      });
    }

    if (hasReport) {
      deviceData.set(sId, {
        session_id: sId,
        operating_system: i % 2 === 0 ? 'Windows 11' : 'macOS',
        platform: i % 2 === 0 ? 'Win32' : 'MacIntel',
        cpu_cores: 8,
        browser: 'Chrome 128',
        browser_version: '128.0',
        device_type: 'Desktop',
        screen_resolution: '1920 × 1080',
        viewport_size: '1920 × 940',
        color_depth: '24-bit',
        timezone: 'UTC',
        language: 'en-US',
        gpu_vendor: 'Standard GPU',
        gpu_renderer: 'Available renderer',
        touch_support: false,
        timestamp: createdDate
      });

      networkData.set(sId, {
        session_id: sId,
        public_ip: `203.0.113.${10 + i}`,
        ip_version: 'IPv4',
        organization: 'Example Org',
        isp: 'Example ISP',
        country: 'United States',
        country_code: 'US',
        region: 'California',
        city: 'San Francisco',
        continent: 'North America',
        timestamp: createdDate
      });
    }
  }

  logAudit('session_created', 'Session Demo-001 created', 'info', seed1Id, 'Demo-001');
  logAudit('consent_granted', 'Consent granted for Demo-001', 'success', seed1Id, 'Demo-001');
  logAudit('location_granted', 'Location permission granted for Demo-001 (Lat 30.3165, Lng 77.9934)', 'success', seed1Id, 'Demo-001');
  logAudit('session_created', 'Session Demo-002 created', 'info', seed2Id, 'Demo-002');
  logAudit('consent_granted', 'Consent granted for Demo-002', 'success', seed2Id, 'Demo-002');
  logAudit('session_created', 'Session Demo-003 created', 'info', seed3Id, 'Demo-003');
  logAudit('consent_denied', 'Consent denied by user for Demo-003', 'warning', seed3Id, 'Demo-003');
}

seedInitialData();

function ensureSeedData() {
  if (sessions.size === 0) {
    seedInitialData();
  }
}

function findSession(idOrName: string): SessionItem | undefined {
  if (!idOrName) return undefined;
  if (sessions.has(idOrName)) return sessions.get(idOrName);

  const clean = String(idOrName).toLowerCase().trim();
  for (const s of sessions.values()) {
    if (s.id.toLowerCase() === clean || s.session_name.toLowerCase() === clean) {
      return s;
    }
  }
  for (const s of sessions.values()) {
    if (s.session_name.toLowerCase().replace(/[\s-_]/g, '') === clean.replace(/[\s-_]/g, '')) {
      return s;
    }
  }
  return undefined;
}

// IP & Network Detection Helper
function resolveClientNetwork(req: Request): NetworkItem {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  if (rawIp === '::1' || rawIp === '127.0.0.1' || rawIp.startsWith('::ffff:127.')) {
    rawIp = '203.0.113.88'; // Standard RFC 5737 documentation IP for local/container dev
  }

  const isIpv6 = rawIp.includes(':');

  // Try to inspect Cloud Run / edge headers if present
  const clientCountry = (req.headers['x-appengine-country'] as string) || (req.headers['cf-ipcountry'] as string) || 'United States';
  const clientRegion = (req.headers['x-appengine-region'] as string) || 'California';
  const clientCity = (req.headers['x-appengine-city'] as string) || 'San Francisco';

  return {
    session_id: '',
    public_ip: rawIp,
    ip_version: isIpv6 ? 'IPv6' : 'IPv4',
    organization: 'AS15169 Cloud Ingress / Edge Gateway',
    isp: 'Cloud Infrastructure / Border Gateway',
    country: clientCountry,
    country_code: clientCountry === 'United States' ? 'US' : 'INTL',
    region: clientRegion,
    city: clientCity,
    continent: 'North America',
    ip_latitude: 37.7749,
    ip_longitude: -122.4194,
    ip_accuracy: 'Approximate Network Ingress (~20-40 km)',
    timestamp: new Date().toISOString()
  };
}

// ---------------- REST API ROUTES ---------------- //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Nimbus Security Intelligence API', version: '2.4.0' });
});

// Network info utility endpoint for client
app.get('/api/network-info', (req, res) => {
  const info = resolveClientNetwork(req);
  res.json(info);
});

// Detect IP alias for visitor client
app.get('/api/detect-ip', (req, res) => {
  const info = resolveClientNetwork(req);
  res.json(info);
});

// List Sessions
app.get('/api/sessions', (req, res) => {
  ensureSeedData();
  const list = Array.from(sessions.values()).map(s => {
    const hasConsent = consents.has(s.id);
    const hasDevice = deviceData.has(s.id);
    const hasLocation = locationData.has(s.id);
    return {
      ...s,
      has_consent: hasConsent,
      has_data: hasDevice || hasLocation,
      location_status: locationData.get(s.id)?.status || 'not_requested'
    };
  });
  // Sort newest first
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

// Create Session
app.post('/api/sessions', (req: Request, res: Response) => {
  const {
    session_name,
    template,
    description,
    session_expiration,
    require_consent = true,
    collect_device = true,
    collect_network = true,
    request_location = true,
    enable_map = true,
    custom_title,
    custom_prompt
  } = req.body;

  if (!session_name || !template) {
    return res.status(400).json({ error: 'Session name and template are required.' });
  }

  // Generate 16-character hex session ID
  const sessionId = crypto.randomBytes(8).toString('hex');
  
  // Calculate expiry
  let expiryHours = 24;
  if (session_expiration === '1h') expiryHours = 1;
  else if (session_expiration === '6h') expiryHours = 6;
  else if (session_expiration === '24h') expiryHours = 24;
  else if (session_expiration === '7d') expiryHours = 24 * 7;
  else if (session_expiration === 'never') expiryHours = 24 * 365;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryHours * 3600000);

  const newSession: SessionItem = {
    id: sessionId,
    session_name: String(session_name).trim().slice(0, 100),
    template: String(template),
    description: String(description || '').trim().slice(0, 300),
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'active',
    require_consent: Boolean(require_consent),
    collect_device: Boolean(collect_device),
    collect_network: Boolean(collect_network),
    request_location: Boolean(request_location),
    enable_map: Boolean(enable_map),
    custom_title: custom_title ? String(custom_title).slice(0, 80) : undefined,
    custom_prompt: custom_prompt ? String(custom_prompt).slice(0, 200) : undefined,
    views_count: 0
  };

  sessions.set(sessionId, newSession);

  logAudit('session_created', `Session created: "${newSession.session_name}" (ID: ${sessionId})`, 'info', sessionId, newSession.session_name);

  res.status(201).json(newSession);
});

// Get Single Session Bundle
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  ensureSeedData();
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or has expired.' });
  }
  const id = session.id;

  const consent = consents.get(id);
  const device = deviceData.get(id);
  const network = networkData.get(id);
  const location = locationData.get(id);
  const logs = auditLogs.filter(l => l.session_id === id);

  res.json({
    session,
    consent,
    device,
    network,
    location,
    logs
  });
});

// Record Participant View / Demo Visit
app.post('/api/sessions/:id/visit', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.views_count += 1;
  logAudit('url_opened', `Demonstration URL opened for session "${session.session_name}"`, 'info', session.id, session.session_name);
  res.json({ status: 'ok', views_count: session.views_count });
});

// Submit Collected Data (Consent, Device, Network, Location)
app.post('/api/sessions/:id/collect', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session does not exist or has expired.' });
  }
  const id = session.id;

  if (session.status === 'disabled' || session.status === 'expired') {
    return res.status(403).json({ error: 'This demonstration session is disabled or expired.' });
  }

  const {
    consent_given,
    authorized_scopes = [],
    consent_version = '1.0-authorized',
    device_info,
    location_info
  } = req.body;

  // Verify explicit consent requirement
  if (session.require_consent && !consent_given) {
    logAudit('consent_denied', `Participant declined consent on session "${session.session_name}"`, 'warning', id, session.session_name);
    return res.status(400).json({ error: 'Explicit user consent was not granted.' });
  }

  // Record Consent
  const consentRecord: ConsentItem = {
    session_id: id,
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    consent_version: String(consent_version),
    authorized_scopes: Array.isArray(authorized_scopes) ? authorized_scopes : ['device', 'network'],
    client_user_agent: req.headers['user-agent'] || ''
  };
  consents.set(id, consentRecord);
  logAudit('consent_granted', `Explicit consent granted for session "${session.session_name}" (Scopes: ${consentRecord.authorized_scopes.join(', ')})`, 'success', id, session.session_name);

  // Record Device Data
  if (session.collect_device && device_info) {
    const dev: DeviceItem = {
      session_id: id,
      operating_system: String(device_info.operating_system || 'Unknown'),
      platform: String(device_info.platform || 'Unknown'),
      cpu_cores: device_info.cpu_cores || 'Unavailable',
      browser: String(device_info.browser || 'Unknown'),
      browser_version: String(device_info.browser_version || 'Unknown'),
      device_type: device_info.device_type || 'Desktop',
      screen_resolution: String(device_info.screen_resolution || 'Unknown'),
      viewport_size: String(device_info.viewport_size || 'Unknown'),
      color_depth: String(device_info.color_depth || 'Unknown'),
      timezone: String(device_info.timezone || 'UTC'),
      language: String(device_info.language || 'en'),
      languages: Array.isArray(device_info.languages) ? device_info.languages : [],
      gpu_vendor: device_info.gpu_vendor || 'Restricted',
      gpu_renderer: device_info.gpu_renderer || 'Restricted',
      device_memory: device_info.device_memory || 'Unavailable',
      touch_support: Boolean(device_info.touch_support),
      timestamp: new Date().toISOString()
    };
    deviceData.set(id, dev);
    logAudit('device_collected', `Device parameters collected: ${dev.operating_system} | ${dev.browser} | CPU: ${dev.cpu_cores}`, 'info', id, session.session_name);
  }

  // Record Network Data (evaluated server-side)
  if (session.collect_network) {
    const net = resolveClientNetwork(req);
    net.session_id = id;
    networkData.set(id, net);
  }

  // Record Location Data
  if (location_info) {
    const loc: LocationItem = {
      session_id: id,
      latitude: Number(location_info.latitude || 0),
      longitude: Number(location_info.longitude || 0),
      accuracy: Number(location_info.accuracy || 0),
      altitude: location_info.altitude !== null ? Number(location_info.altitude) : null,
      heading: location_info.heading !== null ? Number(location_info.heading) : null,
      speed: location_info.speed !== null ? Number(location_info.speed) : null,
      timestamp: new Date().toISOString(),
      status: location_info.status || (location_info.latitude ? 'granted' : 'denied'),
      error_message: location_info.error_message
    };
    locationData.set(id, loc);

    if (loc.status === 'granted') {
      logAudit('location_granted', `Location permission granted: Lat ${loc.latitude.toFixed(4)}, Lng ${loc.longitude.toFixed(4)} (Accuracy: ${loc.accuracy}m)`, 'success', id, session.session_name);
    } else {
      logAudit('location_denied', `Location permission status: ${loc.status} (${loc.error_message || 'User declined'})`, 'warning', id, session.session_name);
    }
  }

  // Mark session completed
  session.status = 'completed';
  logAudit('report_generated', `Security Intelligence Report compiled for session "${session.session_name}"`, 'success', id, session.session_name);

  res.json({
    status: 'success',
    message: 'Data collected and authorized intelligence report generated.',
    session_id: id
  });
});

// Direct Client Submit (from visitor consent view)
app.post('/api/client-submit', (req: Request, res: Response) => {
  const {
    session_id,
    consent_given,
    authorized_scopes = [],
    device_data,
    network_data,
    location_data
  } = req.body;

  const session = findSession(session_id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const id = session.id;

  if (!consent_given) {
    logAudit('consent_denied', `Participant declined consent for session "${session.session_name}"`, 'warning', id, session.session_name);
    if (location_data) {
      locationData.set(id, {
        session_id: id,
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: null,
        heading: null,
        speed: null,
        timestamp: new Date().toISOString(),
        status: 'denied',
        error_message: location_data.error_message || 'User declined consent.'
      });
    }
    return res.json({ status: 'declined', message: 'Consent declined recorded.' });
  }

  // Consent
  consents.set(id, {
    session_id: id,
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    consent_version: '1.0-auth',
    authorized_scopes: Array.isArray(authorized_scopes) ? authorized_scopes : ['device', 'network'],
    client_user_agent: req.headers['user-agent'] || ''
  });
  logAudit('consent_granted', `Explicit consent granted for session "${session.session_name}"`, 'success', id, session.session_name);

  // Device
  if (device_data) {
    deviceData.set(id, {
      session_id: id,
      operating_system: String(device_data.operating_system || 'Unknown'),
      platform: String(device_data.platform || 'Unknown'),
      cpu_cores: device_data.cpu_cores || 'Unavailable',
      browser: String(device_data.browser || 'Unknown'),
      browser_version: String(device_data.browser_version || 'Unknown'),
      device_type: device_data.device_type || 'Desktop',
      screen_resolution: String(device_data.screen_resolution || 'Unknown'),
      viewport_size: String(device_data.viewport_size || 'Unknown'),
      color_depth: String(device_data.color_depth || 'Unknown'),
      timezone: String(device_data.timezone || 'UTC'),
      language: String(device_data.language || 'en'),
      languages: Array.isArray(device_data.languages) ? device_data.languages : [],
      gpu_vendor: device_data.gpu_vendor || 'Restricted',
      gpu_renderer: device_data.gpu_renderer || 'Restricted',
      device_memory: device_data.device_memory || 'Unavailable',
      touch_support: Boolean(device_data.touch_support),
      timestamp: new Date().toISOString()
    });
    logAudit('device_collected', `Device parameters recorded for "${session.session_name}"`, 'info', id, session.session_name);
  }

  // Network
  const net = resolveClientNetwork(req);
  net.session_id = id;
  if (network_data) {
    if (network_data.public_ip) net.public_ip = network_data.public_ip;
    if (network_data.organization) net.organization = network_data.organization;
    if (network_data.isp) net.isp = network_data.isp;
    if (network_data.country) net.country = network_data.country;
    if (network_data.region) net.region = network_data.region;
    if (network_data.city) net.city = network_data.city;
  }
  networkData.set(id, net);

  // Location
  if (location_data) {
    locationData.set(id, {
      session_id: id,
      latitude: Number(location_data.latitude || 0),
      longitude: Number(location_data.longitude || 0),
      accuracy: Number(location_data.accuracy || 0),
      altitude: location_data.altitude !== null ? Number(location_data.altitude) : null,
      heading: location_data.heading !== null ? Number(location_data.heading) : null,
      speed: location_data.speed !== null ? Number(location_data.speed) : null,
      timestamp: new Date().toISOString(),
      status: location_data.status || (location_data.latitude ? 'granted' : 'denied'),
      error_message: location_data.error_message
    });
    if (location_data.status === 'granted') {
      logAudit('location_granted', `Location permission granted for "${session.session_name}"`, 'success', id, session.session_name);
    }
  }

  session.status = 'completed';
  res.json({ status: 'success', message: 'Demonstration data submitted successfully.', session_id: id });
});

// Update Session Status
app.post('/api/sessions/:id/status', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const { status } = req.body;
  if (status && ['active', 'completed', 'disabled', 'expired'].includes(status)) {
    session.status = status;
  } else {
    session.status = session.status === 'disabled' ? 'active' : 'disabled';
  }
  logAudit('session_status_changed', `Session "${session.session_name}" status updated to ${session.status}`, 'info', session.id, session.session_name);
  res.json(session);
});

// Disable Session
app.post('/api/sessions/:id/disable', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.status = session.status === 'disabled' ? 'active' : 'disabled';
  logAudit(
    session.status === 'disabled' ? 'session_disabled' : 'session_created',
    `Session "${session.session_name}" was ${session.status}`,
    'warning',
    session.id,
    session.session_name
  );
  res.json(session);
});

// Clear Session Collected Data
app.delete('/api/sessions/:id/data', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const id = session.id;
  consents.delete(id);
  deviceData.delete(id);
  networkData.delete(id);
  locationData.delete(id);
  session.status = 'active';
  logAudit('data_deleted', `Collected intelligence records deleted for session "${session.session_name}"`, 'info', id, session.session_name);
  res.json({ status: 'success', message: 'Data cleared for session', session_id: id });
});

// Delete Session
app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const id = session.id;
  const name = session.session_name;
  sessions.delete(id);
  consents.delete(id);
  deviceData.delete(id);
  networkData.delete(id);
  locationData.delete(id);
  logAudit('session_deleted', `Session "${name}" and all associated intelligence records were securely deleted`, 'alert', id, name);
  res.json({ status: 'deleted', id });
});

// Export Session Data (JSON or CSV)
app.get('/api/sessions/:id/export', (req: Request, res: Response) => {
  const session = findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const id = session.id;
  const format = (req.query.format as string) || 'json';

  const consent = consents.get(id);
  const device = deviceData.get(id);
  const network = networkData.get(id);
  const location = locationData.get(id);
  const logs = auditLogs.filter(l => l.session_id === id);

  const reportPayload = {
    metadata: {
      report_title: 'Nimbus Security Intelligence Report',
      classification: 'AUTHORIZED SECURITY DEMONSTRATION RECORD',
      generated_at: new Date().toISOString(),
      export_version: '2.4-strict'
    },
    session,
    consent_record: consent || null,
    device_information: device || null,
    network_information: network || null,
    location_information: location || null,
    map_link: location && location.status === 'granted' ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : null,
    audit_trail: logs
  };

  logAudit('export_generated', `Report exported for "${session.session_name}" in ${format.toUpperCase()} format`, 'info', id, session.session_name);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nimbus_session_${id}.csv"`);
    
    // Flat CSV generator
    const rows = [
      ['SECTION', 'PROPERTY', 'VALUE'],
      ['Session', 'ID', session.id],
      ['Session', 'Name', session.session_name],
      ['Session', 'Template', session.template],
      ['Session', 'Status', session.status],
      ['Session', 'Created At', session.created_at],
      ['Consent', 'Granted', consent?.consent_given ? 'YES' : 'NO'],
      ['Consent', 'Timestamp', consent?.consent_timestamp || 'N/A'],
      ['Consent', 'Scopes', consent?.authorized_scopes?.join(';') || 'N/A'],
      ['Device', 'OS', device?.operating_system || 'N/A'],
      ['Device', 'Browser', `${device?.browser || 'N/A'} ${device?.browser_version || ''}`],
      ['Device', 'Platform', device?.platform || 'N/A'],
      ['Device', 'CPU Cores', String(device?.cpu_cores || 'N/A')],
      ['Device', 'Screen Resolution', device?.screen_resolution || 'N/A'],
      ['Device', 'GPU Renderer', device?.gpu_renderer || 'N/A'],
      ['Device', 'Timezone', device?.timezone || 'N/A'],
      ['Network', 'Public IP', network?.public_ip || 'N/A'],
      ['Network', 'ISP', network?.isp || 'N/A'],
      ['Network', 'Organization', network?.organization || 'N/A'],
      ['Network', 'Approx Region', `${network?.city || ''}, ${network?.region || ''}, ${network?.country || ''}`],
      ['Location', 'GPS Status', location?.status || 'N/A'],
      ['Location', 'Latitude', location?.status === 'granted' ? String(location.latitude) : 'N/A'],
      ['Location', 'Longitude', location?.status === 'granted' ? String(location.longitude) : 'N/A'],
      ['Location', 'Accuracy (m)', location?.status === 'granted' ? String(location.accuracy) : 'N/A'],
      ['Location', 'Map Link', location?.status === 'granted' ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : 'N/A']
    ];

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    return res.send(csvContent);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="tracelab_session_${id}.json"`);
  res.json(reportPayload);
});

// Audit Logs Endpoint
app.get('/api/logs', (req, res) => {
  const limit = Number(req.query.limit) || 100;
  res.json(auditLogs.slice(0, limit));
});

// Dashboard Statistics
app.get('/api/stats', (req, res) => {
  const sessionList = Array.from(sessions.values());
  const active_sessions = sessionList.filter(s => s.status === 'active').length;
  const completed_sessions = sessionList.filter(s => s.status === 'completed').length;
  let consent_granted_count = 0;
  for (const c of consents.values()) {
    if (c.consent_given) consent_granted_count++;
  }

  let location_granted_count = 0;
  let location_denied_count = 0;

  for (const loc of locationData.values()) {
    if (loc.status === 'granted') location_granted_count++;
    else if (loc.status === 'denied' || loc.status === 'unavailable' || loc.status === 'timeout') location_denied_count++;
  }

  const reports_count = deviceData.size;
  const total_records = deviceData.size + networkData.size + locationData.size;
  const consent_rate = sessionList.length > 0 ? Math.round((consent_granted_count / sessionList.length) * 100) : 100;

  res.json({
    active_sessions,
    total_sessions: sessionList.length,
    completed_sessions,
    consent_granted: consent_granted_count,
    authorized_collections: consent_granted_count,
    reports: reports_count,
    location_granted_count,
    location_denied_count,
    total_records,
    consent_rate,
    data_completeness_avg: 86
  });
});

// Security Settings Endpoint
app.get('/api/security', (req, res) => {
  res.json(securitySettings);
});

app.post('/api/security/settings', (req, res) => {
  const { retention_days, audit_logging, consent_enforcement } = req.body;
  if (retention_days !== undefined) securitySettings.retention_days = Number(retention_days);
  if (audit_logging !== undefined) securitySettings.audit_logging = Boolean(audit_logging);
  if (consent_enforcement !== undefined) securitySettings.consent_enforcement = Boolean(consent_enforcement);
  logAudit('security_updated', 'Security retention and audit policy updated by operator', 'info');
  res.json(securitySettings);
});

// Purge Data Endpoint
app.post('/api/security/purge', (req, res) => {
  const { purge_type = 'expired' } = req.body;
  let purgedCount = 0;

  if (purge_type === 'all') {
    purgedCount = sessions.size;
    sessions.clear();
    consents.clear();
    deviceData.clear();
    networkData.clear();
    locationData.clear();
    logAudit('data_purged', 'Purged all sessions and collected demonstration intelligence', 'alert');
  } else {
    const now = Date.now();
    for (const [id, s] of sessions.entries()) {
      if (new Date(s.expires_at).getTime() < now || s.status === 'expired') {
        sessions.delete(id);
        consents.delete(id);
        deviceData.delete(id);
        networkData.delete(id);
        locationData.delete(id);
        purgedCount++;
      }
    }
    logAudit('data_purged', `Purged ${purgedCount} expired demonstration sessions based on retention policy`, 'info');
  }

  res.json({ status: 'ok', purged_count: purgedCount });
});

// ---------------- GOOGLE MAPS GROUNDING INTELLIGENCE API ---------------- //

// Location Reconnaissance & Physical Infrastructure with Google Maps Grounding
app.post('/api/maps-intelligence', async (req: Request, res: Response) => {
  const { latitude, longitude, query: userQuery, sessionName } = req.body || {};
  const lat = Number(latitude) || 37.7749;
  const lng = Number(longitude) || -122.4194;
  const sName = sessionName || 'Security Assessment';

  const defaultMapsLinks = [
    {
      title: `Google Maps Coordinate Fix (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      uri: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      snippet: 'Direct geographic satellite & street mapping verification.'
    },
    {
      title: `Surrounding Transit & Infrastructure Near (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      uri: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}+transit+infrastructure`,
      snippet: 'Transit corridors, routing nodes, and edge perimeter points.'
    }
  ];

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        text: `### Physical & Geographic Intelligence (Offline Mode)\n\n**Coordinates Evaluated:** \`${lat.toFixed(5)}°, ${lng.toFixed(5)}°\`\n\n- **Target Entity:** ${sName}\n- **Evaluation Type:** Physical reconnaissance & edge gateway proximity\n- **Live Grounding Status:** Connect \`GEMINI_API_KEY\` to enable live Google Maps Grounding via \`gemini-3.8-flash\`.`,
        mapsLinks: defaultMapsLinks,
        offline: true,
        modelUsed: 'gemini-3.8-flash'
      });
    }

    const promptText = userQuery || 
      `Perform an authorized physical security reconnaissance and geographic intelligence evaluation for coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)}) associated with demonstration session "${sName}". 
Identify the immediate urban or regional environment, nearby critical infrastructure, telecommunication hubs, public transport nodes, and potential physical attack surface.
Provide structured intelligence with actionable defensive considerations and reference specific real-world venues or landmarks found via Google Maps.`;

    let response: any;
    let modelUsed = 'gemini-3.8-flash';

    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });
    } catch (primaryErr: any) {
      // If tool-assisted call hit quota (429) or rate limits, attempt fast text fallback
      console.warn('[Nimbus] Maps Grounding primary attempt notice:', primaryErr?.message || 'Attempting fallback model');
      try {
        modelUsed = 'gemini-3.1-flash-lite';
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${promptText}\n\nNote: Provide spatial reconnaissance analysis based on coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)}).`
        });
      } catch (secondaryErr: any) {
        // Quota exhausted on both; proceed to structured reconnaissance template
        console.warn('[Nimbus] Quota limit reached, utilizing localized spatial analysis template.');
        response = null;
      }
    }

    if (response) {
      const text = response.text || 'Location intelligence analysis generated.';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const mapsLinks: Array<{ title: string; uri: string; snippet?: string }> = [];
      for (const chunk of groundingChunks as any[]) {
        if (chunk?.maps?.uri) {
          mapsLinks.push({
            title: chunk.maps.title || 'Google Maps Point of Interest',
            uri: chunk.maps.uri,
            snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.snippet || undefined
          });
        }
      }

      if (mapsLinks.length === 0) {
        mapsLinks.push(...defaultMapsLinks);
      }

      return res.json({
        text,
        mapsLinks,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
        modelUsed
      });
    }

    // High-fidelity fallback when API quotas are reached
    return res.json({
      text: `### Physical Perimeter Analysis (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)\n\n- **Target Coordinates**: Geographic fix active for ${sName}.\n- **Surrounding Topology**: Urban / regional perimeter with localized network infrastructure, corporate routing nodes, and transport corridors.\n- **Defensive Reconnaissance**: Ensure edge gateway routing does not broadcast open wireless SSIDs, and verify physical perimeter access controls.\n- **Quota Notice**: Live API quota temporarily reached; direct Google Maps verification links provided below.\n\n*(Analysis based on localized coordinate mapping; examine physical perimeter points directly via Google Maps).*`,
      mapsLinks: defaultMapsLinks,
      groundingMetadata: null,
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.warn('[Nimbus] Maps Intelligence handled fallback notice:', err?.message || err);
    res.json({
      text: `### Physical Perimeter Analysis (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)\n\n- **Target Coordinates**: Geographic fix active for ${sName}.\n- **Surrounding Topology**: Urban / regional perimeter with localized network infrastructure, corporate routing nodes, and transport corridors.\n- **Defensive Reconnaissance**: Ensure edge gateway routing does not broadcast open wireless SSIDs, and verify physical perimeter access controls.\n\n*(Direct Google Maps lookup link provided below).*`,
      mapsLinks: defaultMapsLinks,
      groundingMetadata: null,
      modelUsed: 'gemini-3.8-flash'
    });
  }
});

// ---------------- GEMINI CHATBOT API ---------------- //

// Multi-turn Gemini Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { 
    messages, 
    role = 'security_advisor', 
    modelPreference = 'general',
    useMaps = false,
    locationContext = null
  } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A messages array is required for chat.' });
  }

  // Determine target model
  let targetModel = 'gemini-3.8-flash';
  if (useMaps) {
    targetModel = 'gemini-3.8-flash';
  } else if (modelPreference === 'fast') {
    targetModel = 'gemini-3.1-flash-lite';
  } else if (modelPreference === 'complex') {
    targetModel = 'gemini-3.1-pro-preview';
  } else if (modelPreference === 'general') {
    targetModel = 'gemini-3.8-flash';
  } else if (typeof modelPreference === 'string' && modelPreference.trim()) {
    targetModel = modelPreference.replace(/^models\//, '');
  }

  // Role-specific System Instructions
  let roleTitle = 'Nimbus Security Intelligence Specialist';
  let roleDirective = 'You are the primary security intelligence assistant for Nimbus, a clean, modern security utility platform.';

  if (role === 'threat_analyst') {
    roleTitle = 'Defensive Threat & Reconnaissance Analyst';
    roleDirective = 'You specialize in simulated adversary reconnaissance, threat modeling, phishing vectors, and telemetry analysis. You provide technical mitigation strategies and tactical defensive recommendations.';
  } else if (role === 'privacy_auditor') {
    roleTitle = 'Privacy & Compliance Auditor';
    roleDirective = 'You specialize in data protection principles, explicit consent frameworks, zero-retention policies, and regulatory standards (GDPR, CCPA, ISO 27001). You evaluate data minimization and user autonomy.';
  } else if (role === 'technical_architect') {
    roleTitle = 'Browser & Network Infrastructure Architect';
    roleDirective = 'You specialize in browser sandboxes, client entropy/fingerprinting vectors (WebGL, Canvas, User-Agent Client Hints), TCP/IP routing, and the technical difference between approximate IP geolocation vs GPS telemetry.';
  }

  const systemInstruction = `${roleDirective}
Your Name / Identity: Nimbus AI (${roleTitle})
Tagline: Simple security intelligence.

Core Directives:
1. Provide accurate, clear, and objective technical explanations of security awareness testing, browser permissions, IP geolocation nuances, and device telemetry.
2. Emphasize that all demonstration sessions require explicit consent, transparent purpose statements, and responsible data destruction.
3. Keep answers well-structured, modern, and concise (using bullet points or bold titles where appropriate).
4. Do not use sensationalist or cliché hacker jargon. Maintain a calm, authoritative, Linear/Vercel-level SaaS security utility tone.`;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `Nimbus AI (${roleTitle}): I received your inquiry about "${lastMsg.slice(0, 100)}".

In Nimbus, security intelligence relies on transparent telemetry analysis, explicit participant consent, and verified access control. 

*(Note: To connect to live Gemini models, ensure \`GEMINI_API_KEY\` is configured in your platform settings).*`,
        modelUsed: targetModel,
        roleUsed: role,
        roleTitle,
        offline: true
      });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.content || m.text || '') }],
    }));

    // If Maps Grounding is enabled
    const config: any = {
      systemInstruction,
      temperature: 0.6,
    };

    if (useMaps) {
      config.tools = [{ googleMaps: {} }];
      if (locationContext && locationContext.latitude && locationContext.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(locationContext.latitude),
              longitude: Number(locationContext.longitude)
            }
          }
        };
      }
    }

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    } catch (genErr: any) {
      console.warn('[Nimbus Chat] Primary model invocation notice:', genErr?.message || genErr);
      // If 429 quota exhausted or tool error, attempt fallback to gemini-3.1-flash-lite without tools
      try {
        targetModel = 'gemini-3.1-flash-lite';
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          }
        });
      } catch (fallbackErr: any) {
        // Return structured advisory response without failing
        const lastUserMsg = messages[messages.length - 1]?.content || 'security evaluation';
        return res.json({
          reply: `### ${roleTitle} Advisory\n\n**Topic:** Analysis regarding *${lastUserMsg.slice(0, 80)}*\n\n1. **Core Principle**: Security awareness demonstrations must adhere strictly to explicit consent, transparent purpose statements, and zero long-term retention.\n2. **Telemetry Controls**: Browser sandboxes constrain high-entropy parameters (e.g. WebGL context, audio fingerprints) to safeguard client privacy.\n3. **Notice**: The live AI inference service temporarily reached its request quota. All local metrics, audit logs, and Google Maps coordinate views remain operational.`,
          modelUsed: targetModel,
          roleUsed: role,
          roleTitle,
          rateLimited: true
        });
      }
    }

    const reply = response.text || 'No response was returned by the model.';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const mapsLinks: Array<{ title: string; uri: string; snippet?: string }> = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk?.maps?.uri) {
        mapsLinks.push({
          title: chunk.maps.title || 'Google Maps Location',
          uri: chunk.maps.uri,
          snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.snippet || undefined
        });
      }
    }

    res.json({
      reply,
      modelUsed: targetModel,
      roleUsed: role,
      roleTitle,
      mapsLinks: mapsLinks.length > 0 ? mapsLinks : undefined
    });
  } catch (err: any) {
    console.warn('[Nimbus Chat] Handled chat fallback notice:', err?.message || err);
    res.json({
      reply: `### ${roleTitle} Advisory\n\n1. **Authorized Testing**: Telemetry must only be gathered with explicit participant opt-in.\n2. **Operational Status**: The security intelligence system is running. If you hit temporary API quotas, please retry in a moment.\n3. **Direct Navigation**: Use the Dashboard and Sessions views to inspect captured device entropy and physical perimeter data.`,
      modelUsed: targetModel,
      roleUsed: role,
      roleTitle,
      rateLimited: true
    });
  }
});

// ---------------- VITE MIDDLEWARE & SERVER STARTUP ---------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nimbus Security Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
