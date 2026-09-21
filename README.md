# 🩸 BLOODBRIDGE — MEDITECH

## Blood & Platelet Rapid Response System

**An AI-assisted emergency blood and platelet coordination platform**

BloodBridge helps hospitals coordinate urgent blood and platelet requirements by connecting hospitals, donors, and blood banks through a centralized digital platform.

The system combines **AI-powered emergency request processing, donor matching, blood-bank inventory, shortage prediction, GPS tracking, alerts, messaging, and emergency analytics** into one platform.

---

## 🚨 Problem Statement

During medical emergencies, hospitals may face difficulties such as:

* Finding compatible blood donors quickly
* Locating available blood or platelet units
* Delays in communication between hospitals and donors
* Manual entry of emergency patient information
* Difficulty tracking donor responses
* Limited visibility of blood shortages
* Coordination challenges during mass-casualty events

BloodBridge aims to provide a centralized system to improve the coordination of these emergency requirements.

---

## 💡 Our Solution

BloodBridge provides a digital emergency coordination workflow:

**Hospital → Emergency Request → AI Processing → Resource Matching → Donor/Blood Bank Response → Dispatch → Tracking → Fulfillment**

The platform allows authorized hospital users to create emergency requests manually or use AI to extract structured information from a doctor's note.

---

# ✨ Key Features

## 🚨 Emergency Request Management

* Emergency blood request creation
* Emergency platelet request creation
* Manual request form
* Patient and hospital information
* Blood group selection
* Component type selection
* Units required
* Urgency level
* Required time
* Doctor notes
* Request lifecycle tracking

---

## 🤖 AI Emergency Coordinator

BloodBridge uses Google Gemini to process free-text doctor's notes.

The AI can extract:

* Patient name
* Patient age
* Patient gender
* Hospital name
* Blood group
* Component type
* Required units
* Urgency
* Clinical reason
* Required time
* Doctor information

### AI Fallback

If a Gemini API key is not configured, the system can use a built-in clinical heuristic parser.

This allows the emergency request workflow to continue even when external AI access is unavailable.

---

## 🩸 Donor & Blood Bank Matching

The system helps identify suitable resources based on:

* Blood group
* Component type
* Availability
* Distance
* Emergency priority

Features include:

* AI-assisted match score
* Compatibility matrix
* Dynamic priority explanation
* Donor availability
* Blood-bank resource matching

---

## 🔄 Donor Chain Failover

If a selected donor is unavailable or does not respond, the system can move to another suitable donor.

**Primary Donor → Backup Donor → Next Available Donor**

This provides a fallback mechanism for emergency coordination.

---

## 🏦 Blood Bank Inventory

The system provides blood-bank inventory monitoring for:

* Blood groups
* Blood components
* Available units
* Emergency requirements
* Shortage indicators

---

## 📊 Blood Shortage Prediction

BloodBridge includes analytics to help identify potential blood shortages and visualize resource demand.

---

## 📍 Live GPS Tracking

Leaflet-based maps provide location visualization for emergency coordination.

The platform can support:

* Donor location
* Hospital location
* Transit tracking
* Route visualization
* Emergency resource movement

---

## 🗺️ Emergency Heatmap

Emergency demand can be visualized geographically to identify areas with higher blood and platelet requirements.

---

## 🏥 Hospital-to-Hospital Resource Sharing

Hospitals can coordinate and share available resources with other hospitals during emergency situations.

---

## 🚨 Mass Casualty Simulator

The platform includes a mass-casualty simulation module for demonstrating scenarios involving multiple patients and simultaneous blood requirements.

---

## 🔔 Multi-Channel Alerts

The system provides notification workflows for:

* Donors
* Hospitals
* Blood banks
* Emergency coordinators

---

## 📱 One-Tap Donor Response

Donors can quickly respond to emergency requests through an accept or decline workflow.

---

## 💬 Real-Time Messaging

The platform provides a communication interface between hospital staff and donors for emergency coordination.

---

## 🔄 Request Lifecycle Tracker

Every emergency request can be tracked through different stages:

**Raised → Searching → Matched → Accepted → Dispatched → In Transit → Fulfilled**

---

## 📋 Audit Reports

The system provides audit information for reviewing emergency request activities and operational actions.

---

## 📈 Operational Dashboard

The dashboard provides important operational information such as:

* Active requests
* Donor responses
* Blood availability
* Emergency requirements
* Resource status
* Operational metrics

---

## 🌐 Multi-Language Support

The application supports multiple languages through an internationalization system.

---

## 🌙 Light & Dark Mode

Users can switch between light and dark themes.

---

# 🔄 Emergency Workflow

```text
🏥 Hospital
     ↓
🚨 Create Emergency Request
     ↓
🤖 AI / Manual Processing
     ↓
🩸 Blood & Donor Matching
     ↓
🔔 Notify Donors / Blood Banks
     ↓
👤 Donor Response
     ↓
🚚 Dispatch
     ↓
📍 Live Tracking
     ↓
✅ Request Fulfilled
```

---

# 🧠 AI Architecture

```text
Doctor / Hospital Staff
          ↓
     Doctor's Note
          ↓
  AI Emergency Coordinator
          ↓
     Google Gemini
          ↓
   Structured Information
          ↓
 Emergency Blood Request
          ↓
      Matching System
```

If Gemini is unavailable:

```text
Doctor's Note
      ↓
Clinical Heuristic Parser
      ↓
Structured Emergency Request
```

---

# 🏗️ System Architecture

```text
                USER
                 │
                 ▼
        ┌─────────────────┐
        │ React Frontend  │
        │ TypeScript      │
        │ Tailwind CSS    │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Express Backend │
        │ Node.js         │
        └───────┬─────────┘
                │
        ┌───────┼───────────┐
        ▼       ▼           ▼
   Supabase   Gemini       Maps
   Database     AI        Leaflet
```

---

# 🛠️ Technology Stack

## Frontend

* React 19
* TypeScript
* Vite 8
* Tailwind CSS 4
* Framer Motion / Motion
* Lucide React
* Leaflet

## Backend

* Node.js
* Express 4
* TypeScript
* tsx
* esbuild
* dotenv

## AI

* Google Gemini
* Google GenAI SDK
* Clinical heuristic fallback parser

## Database

* Supabase
* PostgreSQL
* Supabase JavaScript SDK

## Deployment

* Vercel
* Supabase

---

# 📁 Project Structure

```text
meditech-blood-platelet-rapid-response/
│
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── .env.example
├── .env
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    │
    ├── components/
    │   ├── AiEmergencyCoordinator.tsx
    │   ├── AiMatchScoreModal.tsx
    │   ├── AuditReportModal.tsx
    │   ├── BloodBankInventory.tsx
    │   ├── BloodShortagePrediction.tsx
    │   ├── CompatibilityMatrixModal.tsx
    │   ├── DonorChainFailover.tsx
    │   ├── DynamicPriorityExplanation.tsx
    │   ├── EmergencyHeatmap.tsx
    │   ├── EmergencyRequestForm.tsx
    │   ├── Header.tsx
    │   ├── HospitalResourceSharing.tsx
    │   ├── LiveGpsTracking.tsx
    │   ├── MassCasualtyAndSimulator.tsx
    │   ├── MetricsRibbon.tsx
    │   ├── MultiChannelAlerts.tsx
    │   ├── OneTapDonorResponseModal.tsx
    │   ├── RealMessagingModal.tsx
    │   ├── RealTransitMap.tsx
    │   └── RequestLifecycleTracker.tsx
    │
    ├── context/
    │   ├── LanguageContext.tsx
    │   └── ThemeContext.tsx
    │
    ├── data/
    │   └── mockData.ts
    │
    ├── i18n/
    │   └── translations.ts
    │
    ├── types/
    │   └── index.ts
    │
    └── utils/
        └── compatibility.ts
```

---

# 🚀 Getting Started

## Prerequisites

Before running BloodBridge, make sure you have:

* Node.js LTS
* npm
* A Supabase project
* Required Supabase database tables
* Google Gemini API key for AI functionality

---

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd meditech-blood-platelet-rapid-response
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Environment Variable Description

| Variable                    | Purpose                              |
| --------------------------- | ------------------------------------ |
| `GEMINI_API_KEY`            | Google Gemini AI integration         |
| `APP_URL`                   | Application URL                      |
| `SUPABASE_URL`              | Supabase project URL                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase database access |

### ⚠️ Security

Never commit the real `.env` file to GitHub.

The following should remain private:

```text
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

Use `.env.example` with placeholder values for documentation.

---

# ▶️ Running the Project

## Development

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

## Preview Frontend

```bash
npm run preview
```

---

## Type Check

```bash
npm run lint
```

---

## Clean Build Files

```bash
npm run clean
```

---

# 🗄️ Database — Supabase

BloodBridge uses Supabase PostgreSQL for storing emergency and donor information.

The backend expects the following main tables:

## `blood_requests`

Important fields include:

```text
id
patient_name
patient_age
patient_gender
patient_condition
hospital_name
hospital_address
hospital_department
hospital_contact
blood_group
component_type
units_required
urgency
required_within_hours
status
triage_score
privacy_masked
hospital_verification_id
doctor_notes
```

## `donors`

The donor table contains information required for donor matching, including:

```text
blood group
availability
location
contact information
distance_km
```

Additional fields can be added according to application requirements.

---

# 🔌 Backend API

## Health Check

```http
GET /api/health
```

Checks whether the backend server is running.

---

## Create Blood Request

```http
POST /api/blood-requests
```

Creates and stores a new emergency blood or platelet request.

---

## Get Donors

```http
GET /api/donors
```

Fetches donor information used for matching.

---

## AI Doctor Note Parser

```http
POST /api/gemini/parse-doctor-note
```

Accepts a doctor's note and converts it into structured emergency request information.

Example:

```json
{
  "doctorNoteText": "Patient requires urgent B positive platelets."
}
```

---

# ☁️ Deployment

BloodBridge can be deployed using **Vercel + Supabase**.

```text
Users
  ↓
Vercel
  ↓
React Frontend + Express API
  ↓
Supabase PostgreSQL
  ↓
Gemini AI
```

## Vercel Environment Variables

Configure the following variables in the Vercel project:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
APP_URL
```

After adding or changing environment variables, redeploy the application.

---

# 🔐 Security

BloodBridge is designed with security considerations for sensitive emergency information.

Important security practices:

* Never commit `.env`
* Never expose the Supabase Service Role Key to the frontend
* Keep secret keys server-side
* Use environment variables
* Apply appropriate authentication and authorization
* Use Row Level Security where appropriate
* Minimize exposure of patient information
* Maintain audit information for important operations

---

# 📊 Main Dashboard Modules

The BloodBridge dashboard includes:

* 🚨 Emergency Requests
* 🤖 AI Emergency Coordinator
* 🩸 Donor Matching
* 🏦 Blood Bank Inventory
* 📊 Blood Shortage Prediction
* 📍 Live GPS Tracking
* 🗺️ Emergency Heatmap
* 🏥 Hospital Resource Sharing
* 🚨 Mass Casualty Simulator
* 🔔 Alerts
* 💬 Messaging
* 🔄 Request Lifecycle
* 📋 Audit Reports
* 📈 Operational Metrics

---

# 📸 Screenshots

Add project screenshots below:

## Dashboard

*Add dashboard screenshot here.*

## Emergency Request

*Add emergency request screenshot here.*

## AI Emergency Coordinator

*Add AI coordinator screenshot here.*

## Donor Matching

*Add donor matching screenshot here.*

## Blood Bank Inventory

*Add inventory screenshot here.*

## GPS Tracking

*Add GPS tracking screenshot here.*

## Emergency Heatmap

*Add heatmap screenshot here.*

---

# 🔮 Future Scope

Future improvements may include:

* 📱 Dedicated mobile application
* 🔔 Real-time push notifications
* 📞 Automated emergency calling
* 🏥 Verified hospital onboarding
* 🏦 Integration with blood-bank networks
* 📈 Advanced blood-demand forecasting
* 🔐 Advanced role-based access control
* 🌍 Multi-region deployment
* 🌐 Additional language support
* 🤖 Improved AI extraction and validation
* 📍 More advanced emergency routing

---

# 🏆 Hackathon Innovation

BloodBridge combines multiple technologies to address emergency blood coordination:

```text
Artificial Intelligence
        +
Real-Time Coordination
        +
Cloud Database
        +
Maps & Location
        +
Analytics
        +
Emergency Workflows
        =
BLOODBRIDGE
```

The platform demonstrates how AI and modern web technologies can support faster organization of emergency blood and platelet requirements.

---

# ⚠️ Disclaimer

BloodBridge is an educational and hackathon technology prototype.

It is not a replacement for:

* Qualified medical professionals
* Hospital emergency protocols
* Certified blood-bank systems
* Clinical decision-making
* Emergency medical services

All medical and emergency decisions should be made by qualified healthcare professionals and authorized organizations.

---

# 👥 Team

## MEDITECH

### BLOODBRIDGE — Blood & Platelet Rapid Response System

Built as a healthcare technology hackathon project.

---

# 📄 License

This project is intended for educational, research, demonstration, and hackathon purposes.

---

<p align="center">

## 🩸 BLOODBRIDGE

### Connecting Emergency Blood Needs With Available Resources

**Built with React • Node.js • Express • Supabase • Gemini AI • Leaflet**

</p>
