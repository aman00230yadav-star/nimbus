export type SessionStatus = 'active' | 'completed' | 'expired' | 'disabled';

export interface Session {
  id: string;
  session_name: string;
  template: string;
  description: string;
  created_at: string;
  expires_at: string;
  status: SessionStatus;
  require_consent: boolean;
  collect_device: boolean;
  collect_network: boolean;
  request_location: boolean;
  enable_map: boolean;
  custom_title?: string;
  custom_prompt?: string;
  views_count: number;
}

export interface ConsentRecord {
  session_id: string;
  consent_given: boolean;
  consent_timestamp: string;
  consent_version: string;
  authorized_scopes: string[];
  client_user_agent?: string;
}

export interface DeviceData {
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
  device_memory?: number | string; // RAM in GB if navigator.deviceMemory supported
  touch_support: boolean;
  timestamp: string;
}

export interface NetworkData {
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

export interface LocationData {
  session_id: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
  status: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'not_requested';
  error_message?: string;
}

export interface AuditLog {
  id: string;
  session_id?: string;
  session_name?: string;
  timestamp: string;
  event_type: 
    | 'session_created' 
    | 'url_opened' 
    | 'consent_granted' 
    | 'consent_denied' 
    | 'device_collected' 
    | 'location_granted' 
    | 'location_denied' 
    | 'report_generated'
    | 'session_disabled'
    | 'session_deleted'
    | 'data_purged'
    | 'export_generated';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
  details?: Record<string, any>;
}

export interface SessionRecordBundle {
  session: Session;
  consent?: ConsentRecord;
  device?: DeviceData;
  network?: NetworkData;
  location?: LocationData;
  logs: AuditLog[];
}

export type TelemetryBundle = SessionRecordBundle;

export interface TemplateDefinition {
  id: string;
  number: string;
  title: string;
  summary: string;
  description: string;
  demonstrates: string;
  category: string;
  simulatedViewType: 'near_you' | 'cloud_storage' | 'messaging' | 'redirect' | 'communication' | 'meeting' | 'captcha' | 'custom_link';
  recommendedScopes: string[];
}

export interface DashboardStats {
  active_sessions: number;
  total_sessions: number;
  completed_sessions: number;
  consent_granted: number;
  authorized_collections: number;
  reports: number;
  location_granted_count: number;
  location_denied_count: number;
  total_records: number;
  consent_rate: number;
  data_completeness_avg: number;
}

export interface SecurityConfig {
  https_status: boolean;
  auth_status: 'SOC Operator Authenticated' | 'Guest' | 'Restricted';
  consent_enforcement: boolean;
  rate_limiting: boolean;
  retention_days: number;
  audit_logging: boolean;
  secure_storage_status: 'Active (Encrypted at rest)' | 'Degraded';
  tls_version: string;
  active_operator: string;
}

export type ChatRole = 'security_advisor' | 'threat_analyst' | 'privacy_auditor' | 'technical_architect';
export type ChatModelPreference = 'general' | 'fast' | 'complex' | 'maps';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  roleTitle?: string;
  offline?: boolean;
  mapsLinks?: Array<{ title: string; uri: string; snippet?: string }>;
}
