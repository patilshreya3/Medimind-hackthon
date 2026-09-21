# Supabase Integration

This project uses **Supabase** for storing and retrieving emergency blood and donor data.

## What Supabase is Used For

* Fetching live donor information
* Storing emergency blood requests
* Retrieving donor data for emergency response
* Connecting the website with the Supabase backend

## Integration

The application uses the official Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

Supabase is integrated into the following project components:

* `DonorChainFailover.tsx` — fetches live donor data from Supabase.
* `EmergencyRequestForm.tsx` — saves emergency blood requests to Supabase.

## Environment Variables

Supabase connection details are configured using environment variables.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Do not upload your `.env` file or any secret/service-role keys to GitHub.

## Data Flow

```text
Website
   ↓
Supabase Client
   ↓
Supabase
   ↓
Donor Data / Emergency Blood Requests
   ↓
Website
```
