import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MEDITECH Server listening on http://0.0.0.0:${PORT}`);
});

app.use(express.json());


// ======================================================
// SAVE EMERGENCY BLOOD REQUEST TO SUPABASE
// ======================================================

app.post("/api/blood-requests", async (req, res) => {
  try {
    const request = req.body;

    const dbRequest = {
      id: request.id ?? crypto.randomUUID(),

      patient_name: request.patientName,
      patient_age: request.age ?? request.patientAge,
      patient_gender: request.gender ?? request.patientGender,
      patient_condition: request.clinicalReason,

      hospital_name: request.hospitalName,
      hospital_address: request.hospitalAddress,
      hospital_department: request.hospitalDepartment,
      hospital_contact: request.hospitalContact,

      blood_group: request.bloodGroup,
      component_type: request.componentType,
      units_required: request.unitsNeeded ?? request.unitsRequired,

      urgency: request.urgency,
      required_within_hours: request.requiredWithinHours,

      status: request.status ?? "searching",
      triage_score: request.triageScore,

      privacy_masked: request.privacyMasked ?? true,
      hospital_verification_id: request.hospitalVerificationId,
      doctor_notes: request.doctorNotes,
    };

    const { data, error } = await supabase
      .from("blood_requests")
      .insert([dbRequest])
      .select()
      .single();

    if (error) {
      console.error("Blood Request Insert Error:", error);

      res.status(500).json({
        success: false,
        error: error.message,
      });

      return;
    }

    console.log("Blood request saved to Supabase:", data);

    res.json({
      success: true,
      message: "Blood request saved successfully!",
      data,
    });

  } catch (error: any) {
    console.error("Blood Request Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ======================================================
// GET DONORS FROM SUPABASE
// ======================================================

app.get("/api/donors", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .order("distance_km", { ascending: true });

    if (error) {
      console.error("Donor Fetch Error:", error);

      res.status(500).json({
        success: false,
        error: error.message,
      });

      return;
    }

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error("Donor API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ======================================================
// LAZY-INITIALIZE GEMINI AI CLIENT
// ======================================================

let aiClient: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return aiClient;
}


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "MEDITECH Server"
  });
});


// ======================================================
// GEMINI - PARSE DOCTOR NOTE
// ======================================================

app.post("/api/gemini/parse-doctor-note", async (req, res) => {
  try {
    const { doctorNoteText } = req.body;

    if (!doctorNoteText || typeof doctorNoteText !== "string") {
      res.status(400).json({
        error: "Doctor's note text is required."
      });

      return;
    }

    const ai = getGeminiAI();

    if (ai) {

      const prompt = `
You are a medical AI assistant for MEDITECH Emergency Blood & Platelet Availability System.

Extract structured clinical emergency requirement data from the following doctor's note or medical prescription.

Note text:

"""
${doctorNoteText}
"""

Extract and respond ONLY with a JSON object adhering strictly to this schema:

{
  "patientName": "string",
  "age": 30,
  "gender": "Male" | "Female" | "Other",
  "hospitalName": "string",
  "bloodGroup": "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+",
  "componentType": "platelets_sdp" | "platelets_rdp" | "prbc" | "whole_blood" | "ffp" | "cryo",
  "unitsNeeded": 2,
  "urgency": "critical" | "high" | "moderate",
  "requiredWithinHours": 1,
  "clinicalReason": "string",
  "prescribingDoctor": "string",
  "confidenceScore": 0.9
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text?.trim() || "{}";

      const parsedData = JSON.parse(responseText);

      res.json({
        success: true,
        data: parsedData,
        source: "gemini-3.8-flash"
      });

      return;
    }


    // ==================================================
    // FALLBACK PARSER
    // ==================================================

    const lower = doctorNoteText.toLowerCase();

    // Blood group
    let bloodGroup = "O+";

    const bgMatch = doctorNoteText.match(
      /\b(O|A|B|AB)[+-]\b/i
    );

    if (bgMatch) {
      bloodGroup = bgMatch[0].toUpperCase();
    }


    // Component
    let componentType = "platelets_sdp";

    if (
      lower.includes("sdp") ||
      lower.includes("apheresis")
    ) {
      componentType = "platelets_sdp";

    } else if (
      lower.includes("rdp") ||
      lower.includes("random donor")
    ) {
      componentType = "platelets_rdp";

    } else if (
      lower.includes("prbc") ||
      lower.includes("packed cell") ||
      lower.includes("packed red")
    ) {
      componentType = "prbc";

    } else if (
      lower.includes("whole blood") ||
      lower.includes("wb")
    ) {
      componentType = "whole_blood";

    } else if (
      lower.includes("ffp") ||
      lower.includes("plasma")
    ) {
      componentType = "ffp";

    } else if (
      lower.includes("cryo")
    ) {
      componentType = "cryo";
    }


    // Units
    let unitsNeeded = 2;

    const unitsMatch = doctorNoteText.match(
      /(\d+)\s*(unit|units|bag|bags|pkt|pkts)/i
    );

    if (unitsMatch) {
      unitsNeeded = parseInt(unitsMatch[1], 10) || 2;
    }


    // Urgency
    let urgency: "critical" | "high" | "moderate" = "critical";

    let requiredWithinHours = 1;

    if (
      lower.includes("stat") ||
      lower.includes("immediately") ||
      lower.includes("urgent") ||
      lower.includes("emergency") ||
      lower.includes("shock")
    ) {
      urgency = "critical";
      requiredWithinHours = 0.5;

    } else if (
      lower.includes("today") ||
      lower.includes("scheduled")
    ) {
      urgency = "moderate";
      requiredWithinHours = 4;
    }


    // Patient name
    let patientName = "Emergency Patient";

    const nameMatch = doctorNoteText.match(
      /(?:pt|patient|name|patient\s*name)[:\s]+([A-Za-z\s]+?)(?:,|\n|\d|age|yrs|yo)/i
    );

    if (nameMatch && nameMatch[1].trim().length > 2) {
      patientName = nameMatch[1].trim();
    }


    // Age
    let age = 32;

    const ageMatch = doctorNoteText.match(
      /(\d{1,2})\s*(?:yrs|yr|years|yo|age)/i
    );

    if (ageMatch) {
      age = parseInt(ageMatch[1], 10) || 32;
    }


    // Gender
    let gender = "Female";

    if (
      lower.includes("male") &&
      !lower.includes("female")
    ) {
      gender = "Male";

    } else if (
      lower.includes("female")
    ) {
      gender = "Female";
    }


    res.json({
      success: true,

      data: {
        patientName,
        age,
        gender,
        hospitalName: "Ruby Hall Clinic ICU",
        bloodGroup,
        componentType,
        unitsNeeded,
        urgency,
        requiredWithinHours,
        clinicalReason:
          doctorNoteText.substring(0, 120) + "...",
        prescribingDoctor:
          "Attending Emergency Physician",
        confidenceScore: 0.88,
      },

      source: "clinical-heuristic-engine",
    });

  } catch (error: any) {

    console.error(
      "Gemini Note Parse Error:",
      error
    );

    res.status(500).json({
      error: "Failed to parse doctor's note.",
      details: error.message,
    });
  }
});


// ======================================================
// START SERVER
// ======================================================

async function startServer() {

  if (process.env.NODE_ENV !== "production") {

    const { createServer: createViteServer } =
      await import("vite");

    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },

      appType: "spa",
    });

    app.use(vite.middlewares);

  } else {

    const distPath = path.join(
      process.cwd(),
      "dist"
    );

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(
        path.join(distPath, "index.html")
      );
    });
  }


  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `MEDITECH Server listening on http://0.0.0.0:${PORT}`
      );
    }
  );
}

startServer();