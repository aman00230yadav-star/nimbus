# Nimbus // Security Intelligence Platform

> **Modern Security Awareness & Surface Reconnaissance Engine**  
> Authorized telemetry evaluation, physical perimeter analysis via Google Maps Grounding, and defensive intelligence powered by Google Gemini and Firebase.

---

## 📌 Executive Summary

**Nimbus** is a security awareness, device entropy, and physical surface evaluation platform. Engineered with a Swiss-brutalist, high-contrast aesthetic, Nimbus enables security practitioners, compliance auditors, and privacy researchers to conduct authorized telemetry demonstrations with explicit participant consent.

The platform bridges digital fingerprinting with physical perimeter intelligence, leveraging **Google Gemini 3.8 Flash** with **Google Maps Grounding** to contextualize geographic coordinates with surrounding critical infrastructure, transit nodes, and physical access vectors.

---

## ⚡ Key Capabilities

### 1. Authorized Evaluation Sessions & Quick Launch
- **1-Click Rapid Provisioning**: Instant deployment presets from the primary dashboard:
  - **Nearby Geo Awareness**: Evaluates location exposure and initiates Google Maps Grounding.
  - **Hardware & GPU Audit**: Inspects WebGL renderer details, CPU concurrency, and browser sandboxing entropy.
  - **Edge Network Trace**: Maps public IP, autonomous system numbers (ASNs), ISP organization, and reverse route metadata.
- **Custom Session Builder**: Granular control over permissions, telemetry flags (GPS, device, network), session expiration, and branded descriptions.
- **Participant Access**: Generates clean target links (`/session/:id`) and high-contrast SVG QR codes for cross-device evaluation.

### 2. Participant Consent & Privacy Protection
- **Zero-Coercion Consent Gateway**: Evaluates participant devices only after explicit, affirmative opt-in.
- **Transparency-First Telemetry**: Displays exact data fields being queried before transmission.
- **Session Purge & Ephemeral State**: One-click deletion of sessions and associated telemetry collections.

### 3. Google Maps Grounding Physical Reconnaissance
- **Powered by Gemini 3.8 Flash**: Leverages the official Google Maps Grounding tool (`tools: [{ googleMaps: {} }]`) via `@google/genai` with automated spatial fallbacks and rate resilience.
- **Targeted Intelligence Angles**:
  - *Full Recon*: Comprehensive survey of surrounding topology and urban density.
  - *Critical Infrastructure*: Proximity to data centers, power substations, and telecommunication facilities.
  - *Access Perimeters*: Public transit corridors, arterial highways, and entry choke points.
  - *Surrounding Venues*: Public Wi-Fi nodes, commercial gathering spaces, and adjacent corporate facilities.
- **Verified Grounding Citations**: Extracts and renders verifiable Google Maps location links and place review snippets directly in the audit report.

### 4. Multi-Role AI Security Assistant
- **Interactive Multi-Turn Dialogue**: Built-in floating terminal accessible from any dashboard view.
- **Adaptive Specialist Roles**:
  - `Security Advisor`: Executive defensive strategy, policies, and mitigation priorities.
  - `Threat Analyst`: Attack surface evaluation, initial access vectors, and fingerprint entropy.
  - `Privacy Auditor`: Data minimization, regulatory alignment (GDPR, CCPA), and consent verification.
  - `Technical Architect`: Hardening guidance, browser sandbox controls, and network perimeter boundaries.
- **Model Selection Flexibility**:
  - **Maps Grounding**: `gemini-3.8-flash` with spatial grounding.
  - **Balanced**: `gemini-3.8-flash` for low-latency, high-precision technical answers.
  - **Fast**: `gemini-3.1-flash-lite` for instantaneous queries.
  - **Deep Reasoning**: `gemini-3.1-pro-preview` for complex multi-stage risk modeling.

### 5. Firebase Cloud Persistence & Google Authentication
- **Google Sign-In**: Integrated Firebase Authentication with seamless popup authorization.
- **Real-Time Bidirectional Firestore Synchronization**: Automatically persists sessions, audit logs, and telemetry bundles across sessions and devices.
- **Fine-Grained Security Rules**: Deployed `firestore.rules` protecting session configuration and access control.
- **Frictionless Demo Mode**: One-click auditor demo access for instant sandbox exploration.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   Nimbus Frontend                      │
│     React 19 • Tailwind CSS v4 • Motion • Leaflet      │
└──────────────┬──────────────────────────▲──────────────┘
               │                          │
        HTTP REST API              Real-Time Firestore
               │                   Listener (onSnapshot)
               ▼                          │
┌──────────────────────────────┐          │
│    Node.js / Express Server  │          │
│    (Port 3000, Vite Proxy)   │          │
└──────┬───────────────────────┘          │
       │                                  │
       ├─► Google GenAI SDK (@google/genai)
       │    ├─► gemini-3.8-flash (Google Maps Tool & Standard Assistant)
       │    ├─► gemini-3.1-flash-lite (Fast Queries & Spatial Fallback)
       │    └─► gemini-3.1-pro-preview (Deep Audit)
       │
       └─► Firebase Cloud Firestore & Auth
```

### Core Technologies
- **UI Framework**: React 19 (Hooks, Context, Functional Components)
- **Styling**: Tailwind CSS v4 (Embedded utility engine, Swiss brutalist palette `#F8F7F4`, `#111113`, `#E63946`)
- **Animations & Layout**: `motion` (`motion/react`)
- **Icons**: `lucide-react`
- **Mapping & Geovisualization**: Leaflet 1.9 (`leaflet`, `@types/leaflet`)
- **QR Code Generation**: `qrcode` (`@types/qrcode`)
- **Backend Service**: Express 4 (`server.ts`), executed via `tsx` in development and bundled to CommonJS with `esbuild` for production
- **AI Engine**: `@google/genai` (v2.4.0) with server-side API key isolation
- **Cloud Database**: Google Firebase Cloud Firestore (`firebase` v12.19.0) & Firebase Authentication

---

## 📂 Project Structure

```
.
├── firebase-applet-config.json    # Provisioned Firebase project credentials
├── firebase-blueprint.json        # Firestore entity schemas and path mapping
├── firestore.rules                # Deployed security access rules for Firestore
├── metadata.json                  # Application capabilities & browser permissions
├── package.json                   # Dependencies, build pipeline, and scripts
├── server.ts                      # Express API server & Vite middleware bridge
├── vite.config.ts                 # Vite bundler configuration
└── src/
    ├── App.tsx                    # Main application root & view router
    ├── main.tsx                   # React 19 client bootstrap
    ├── index.css                  # Tailwind CSS import & brutalist utility classes
    ├── types.ts                   # Global TypeScript definitions
    ├── context/
    │   └── AuthContext.tsx        # Firebase Authentication context & state
    ├── lib/
    │   └── firebase.ts            # Firebase app, auth, and Firestore helpers
    ├── services/
    │   └── api.ts                 # Client REST API consumer
    ├── data/
    │   └── templates.ts           # Pre-configured session templates
    └── components/
        ├── Navigation.tsx         # Top application header & auth status
        ├── DashboardView.tsx      # Core metrics, Quick Launch, & active sessions
        ├── SessionDetailView.tsx  # Detailed telemetry, Leaflet map, & intel
        ├── MapsGroundingIntelligence.tsx # Gemini Maps Grounding component
        ├── GeminiChatbot.tsx      # Multi-turn AI security assistant
        ├── CreateSessionView.tsx  # Full session creator & configurator
        ├── SessionsListView.tsx   # Searchable, filterable session inventory
        ├── ConsentVisitorView.tsx # Participant consent & landing screen
        ├── DemoParticipantExperience.tsx # Mobile/client participant simulator
        ├── MapComponent.tsx       # Leaflet interactive geolocation map
        ├── QRCodeModal.tsx        # Shareable session QR code overlay
        ├── SecurityCenterView.tsx # Surface overview & telemetry checklist
        └── SettingsView.tsx       # API keys, Firebase status, & storage controls
```

---

## 🔌 API Endpoints Reference

All API routes are served under `/api/*` and isolate sensitive credentials on the server side:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check, API version, and service status |
| `/api/stats` | `GET` | Aggregate evaluation metrics (sessions, telemetry, active audits) |
| `/api/sessions` | `GET` | Retrieve list of all security evaluation sessions |
| `/api/sessions` | `POST` | Create a new session with custom collection flags |
| `/api/sessions/:id` | `GET` | Retrieve single session configuration |
| `/api/sessions/:id` | `DELETE` | Terminate and remove session |
| `/api/sessions/:id/bundle` | `GET` | Retrieve recorded telemetry bundle for session |
| `/api/sessions/:id/telemetry` | `POST` | Record participant telemetry submission |
| `/api/maps-intelligence` | `POST` | Run Google Maps Grounding reconnaissance via `gemini-3.8-flash` |
| `/api/chat` | `POST` | Multi-turn security AI chat with Maps Grounding option |
| `/api/audit-logs` | `GET` | Retrieve tamper-evident operational logs |
| `/api/purge-all` | `POST` | Bulk purge non-default records |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 2. Installation
Clone the repository and install project dependencies:

```bash
npm install
```

### 3. Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Gemini API Key (Configured in AI Studio Secrets)
GEMINI_API_KEY="your-gemini-api-key"

# Base Application URL (Injected automatically in Cloud Run)
APP_URL="http://localhost:3000"
```

### 4. Running the Development Server
Start the unified Express + Vite development environment:

```bash
npm run dev
```

The application will bind to `http://localhost:3000`.

### 5. Production Build & Execution
To compile the TypeScript server and client assets for production:

```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy Notice

**Nimbus is intended exclusively for authorized security awareness training, internal compliance audits, and educational demonstrations.**

- **Explicit Consent**: Telemetry must only be gathered from participants who have been informed and explicitly accepted the evaluation terms.
- **Data Minimization**: Sessions collect only standard browser-exposed parameters required to demonstrate telemetry exposure.
- **Ephemeral Demonstrations**: Evaluation data should be purged promptly after demonstration sessions conclude.
- **Regulatory Compliance**: Designed to support compliance education under frameworks such as GDPR, ISO/IEC 27001, and NIST CSF.

---

## 📄 License

Proprietary / Educational Demonstration License. Designed for AI Studio cloud applet environments.
