================================================================================
 BLOODBRIDGE(MEDITECH)— Blood & Platelet Rapid Response System
================================================================================

A real-time, AI-assisted emergency blood and platelet coordination platform.
It helps hospitals raise urgent blood/platelet requests, match them against
nearby donors and blood banks, track donor response and transit, and manage
mass-casualty scenarios — with an AI layer that can parse a doctor's
handwritten/typed note straight into a structured emergency request.

--------------------------------------------------------------------------------
 1. KEY FEATURES
--------------------------------------------------------------------------------

- Emergency blood/platelet request intake (manual form + AI-assisted note parsing)
- AI Emergency Coordinator powered by Google Gemini
  - Extracts patient, hospital, blood group, component type, urgency, and
    required units directly from free-text doctor's notes
  - Falls back to a built-in rule-based ("clinical-heuristic") parser if no
    Gemini API key is configured, so the app still works offline/without AI
- Donor & blood bank matching
  - AI match-score modal, compatibility matrix, dynamic priority explanation
- Blood bank inventory tracking
- Blood shortage prediction
- Donor chain failover (automatic fallback to the next best donor)
- Live GPS tracking / real transit map (Leaflet-based)
- Emergency heatmap of demand across a region
- Hospital-to-hospital resource sharing
- Mass casualty event simulator
- Multi-channel alerts (notifications to donors/hospitals)
- One-tap donor response flow
- Real-time messaging between hospital staff and donors
- Request lifecycle tracker (from raised -> matched -> dispatched -> fulfilled)
- Audit report generation
- Metrics ribbon / operational dashboard
- Multi-language support (i18n) and light/dark theme support

--------------------------------------------------------------------------------
 2. TECH STACK
--------------------------------------------------------------------------------

Frontend:
  - React 19 + TypeScript
  - Vite 8 (build tool / dev server)
  - Tailwind CSS 4
  - Leaflet + @types/leaflet (maps, live GPS tracking)
  - Framer Motion / "motion" (animations)
  - lucide-react (icons)

Backend:
  - Node.js + Express 4 (server.ts)
  - tsx (TypeScript execution in dev)
  - esbuild (bundles server.ts to dist/server.cjs for production)
  - Google GenAI SDK (@google/genai) — Gemini model integration
  - dotenv (environment variable loading)

Database / Storage:
  - Supabase (hosted Postgres + client SDK: @supabase/supabase-js)
  - No local schema/migration files are included in this repo — tables are
    expected to already exist in your Supabase project (see Section 6).

--------------------------------------------------------------------------------
 3. PROJECT STRUCTURE
--------------------------------------------------------------------------------

meditech-blood-platelet-rapid-response/
├── server.ts                     Express server: API routes, Gemini + Supabase wiring
├── index.html                    Vite entry HTML
├── package.json                  Scripts & dependencies
├── tsconfig.json                 TypeScript config
├── vite.config.ts                Vite config
├── metadata.json                 App metadata (AI Studio)
├── .env.example                  Sample environment variables
├── .env                          Local environment variables (not committed)
└── src/
    ├── main.tsx                  React app entry point
    ├── App.tsx                   Root application component / routing
    ├── index.css                 Global styles (Tailwind)
    ├── components/
    │   ├── AiEmergencyCoordinator.tsx      AI note-parsing / request assistant
    │   ├── AiMatchScoreModal.tsx           Donor/request AI match score UI
    │   ├── AuditReportModal.tsx            Audit trail / report generation
    │   ├── BloodBankInventory.tsx          Blood bank stock levels
    │   ├── BloodShortagePrediction.tsx     Predictive shortage analytics
    │   ├── CompatibilityMatrixModal.tsx    Blood type compatibility matrix
    │   ├── DonorChainFailover.tsx          Automatic donor fallback chain
    │   ├── DynamicPriorityExplanation.tsx  Explains why a request is prioritized
    │   ├── EmergencyHeatmap.tsx            Regional demand heatmap
    │   ├── EmergencyRequestForm.tsx        Manual emergency request form
    │   ├── Header.tsx                      App header/navigation
    │   ├── HospitalResourceSharing.tsx     Inter-hospital resource sharing
    │   ├── LiveGpsTracking.tsx             Live donor/courier GPS tracking
    │   ├── MassCasualtyAndSimulator.tsx    Mass casualty event simulation
    │   ├── MetricsRibbon.tsx               Top-line operational metrics
    │   ├── MultiChannelAlerts.tsx          SMS/push/email-style alert center
    │   ├── OneTapDonorResponseModal.tsx    Donor accept/decline flow
    │   ├── RealMessagingModal.tsx          In-app messaging
    │   ├── RealTransitMap.tsx              Live transit/route map (Leaflet)
    │   └── RequestLifecycleTracker.tsx     Status timeline for a request
    ├── context/
    │   ├── LanguageContext.tsx             i18n language provider
    │   └── ThemeContext.tsx                Light/dark theme provider
    ├── data/
    │   └── mockData.ts                     Sample/mock data for local dev
    ├── i18n/
    │   └── translations.ts                 Translated UI strings
    ├── types/
    │   └── index.ts                        Shared TypeScript types/interfaces
    └── utils/
        └── compatibility.ts                Blood type compatibility logic

--------------------------------------------------------------------------------
 4. PREREQUISITES
--------------------------------------------------------------------------------

  - Node.js (LTS recommended)
  - npm (or compatible package manager — a bun.lock file is also present)
  - A Supabase project (URL + Service Role Key) with "blood_requests" and
    "donors" tables (see Section 6)
  - (Optional but recommended) A Google Gemini API key, for AI note-parsing

--------------------------------------------------------------------------------
 5. SETUP & RUNNING LOCALLY
--------------------------------------------------------------------------------

1. Install dependencies:
     npm install

2. Create a .env file in the project root (or copy .env.example) and set:
     GEMINI_API_KEY=your_gemini_api_key_here
     APP_URL=http://localhost:3000
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   Notes:
     - If GEMINI_API_KEY is not set, the AI note-parsing endpoint automatically
       falls back to a built-in heuristic parser (no external AI call is made).
     - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the
       /api/blood-requests and /api/donors endpoints to work, since the
       server creates its Supabase client at startup.

3. Run the app in development mode (Vite dev server + Express, via tsx):
     npm run dev

   The server listens on:
     http://0.0.0.0:3000

4. Build for production:
     npm run build
   This runs `vite build` (bundles the frontend) and `esbuild` (bundles
   server.ts into dist/server.cjs).

5. Start the production build:
     npm start
   Runs `node dist/server.cjs`, which serves the built frontend from /dist
   and exposes the same API routes.

6. Preview the frontend build only (no backend):
     npm run preview

7. Type-check without emitting files:
     npm run lint

8. Clean build artifacts:
     npm run clean

--------------------------------------------------------------------------------
 6. DATABASE (SUPABASE)
--------------------------------------------------------------------------------

This project does NOT ship SQL migration/schema files. The backend expects
the following tables to already exist in your Supabase project:

  blood_requests
    id                          uuid / text (primary key)
    patient_name                text
    patient_age                 int
    patient_gender               text
    patient_condition           text
    hospital_name               text
    hospital_address            text
    hospital_department         text
    hospital_contact            text
    blood_group                 text
    component_type              text
    units_required               int
    urgency                     text
    required_within_hours       numeric
    status                      text        (default: "searching")
    triage_score                numeric
    privacy_masked               boolean     (default: true)
    hospital_verification_id    text
    doctor_notes                 text

  donors
    (columns referenced by the API include at least)
    distance_km                 numeric     (used for default sort order)
    ... plus whatever donor profile fields your app expects
    (blood group, availability, location, contact, etc.)

You will need to create these tables (and any others referenced elsewhere in
the frontend/mock data) in your own Supabase project, and set SUPABASE_URL /
SUPABASE_SERVICE_ROLE_KEY accordingly.

--------------------------------------------------------------------------------
 7. BACKEND API ENDPOINTS (server.ts)
--------------------------------------------------------------------------------

  GET  /api/health
       Simple health check. Returns { status: "ok", service: "MEDITECH Server" }.

  POST /api/blood-requests
       Saves a new emergency blood/platelet request to Supabase
       ("blood_requests" table). Accepts a JSON body with patient, hospital,
       and request details (patientName, age/patientAge, gender/patientGender,
       clinicalReason, hospitalName, hospitalAddress, hospitalDepartment,
       hospitalContact, bloodGroup, componentType, unitsNeeded/unitsRequired,
       urgency, requiredWithinHours, status, triageScore, privacyMasked,
       hospitalVerificationId, doctorNotes).

  GET  /api/donors
       Fetches all donors from Supabase ("donors" table), ordered by
       distance_km ascending.

  POST /api/gemini/parse-doctor-note
       Accepts { doctorNoteText: string } and returns a structured emergency
       request object (patientName, age, gender, hospitalName, bloodGroup,
       componentType, unitsNeeded, urgency, requiredWithinHours,
       clinicalReason, prescribingDoctor, confidenceScore).
       - If GEMINI_API_KEY is configured, uses the Gemini model
         ("gemini-3.8-flash") to extract this data from free text.
       - Otherwise, falls back to a deterministic regex/keyword-based parser
         (source: "clinical-heuristic-engine") so the endpoint always returns
         a usable result.

--------------------------------------------------------------------------------
 8. ENVIRONMENT VARIABLES SUMMARY
--------------------------------------------------------------------------------

  GEMINI_API_KEY               Google Gemini API key (optional — enables AI
                                note parsing; falls back to heuristics if unset)
  APP_URL                      Public URL the app is hosted at (used for
                                self-referential links / callbacks)
  SUPABASE_URL                 Your Supabase project URL (required)
  SUPABASE_SERVICE_ROLE_KEY    Your Supabase service role key (required —
                                keep this secret, server-side only)

--------------------------------------------------------------------------------
 9. NOTES
--------------------------------------------------------------------------------

- This app was originally scaffolded via Google AI Studio (see metadata.json /
  original README reference to https://ai.studio).
- Do not commit your real .env file — only .env.example should be checked in.
- The Supabase Service Role Key bypasses row-level security; never expose it
  to the frontend/browser. It is only used in server.ts.

================================================================================

