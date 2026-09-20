import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(
  supabaseUrl || "",
  supabaseKey || ""
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "MEDITECH server is running"
  });
});

// Create blood request
app.post("/api/blood-requests", async (req, res) => {
  try {
    const request = req.body;

    const bloodRequest = {
      patient_name: request.patientName,
      hospital_name: request.hospitalName,
      blood_group: request.bloodGroup,
      component_type: request.componentType,

      units_required:
        request.unitsNeeded ?? request.unitsRequired,

      urgency: request.urgency,
      contact_number: request.contactNumber || null,
      location: request.location || null,

      status: request.status || "Pending",

      created_by_uid:
        request.createdByUid ||
        request.created_by_uid ||
        null,

      required_within_hours:
        request.requiredWithinHours ??
        request.required_within_hours ??
        null
    };

    // Basic validation
    if (!bloodRequest.patient_name) {
      return res.status(400).json({
        success: false,
        error: "Patient name is required"
      });
    }

    if (!bloodRequest.hospital_name) {
      return res.status(400).json({
        success: false,
        error: "Hospital name is required"
      });
    }

    if (!bloodRequest.blood_group) {
      return res.status(400).json({
        success: false,
        error: "Blood group is required"
      });
    }

    if (!bloodRequest.component_type) {
      return res.status(400).json({
        success: false,
        error: "Component type is required"
      });
    }

    if (
      bloodRequest.units_required === undefined ||
      bloodRequest.units_required === null
    ) {
      return res.status(400).json({
        success: false,
        error: "Units required is required"
      });
    }

    const { data, error } = await supabase
      .from("blood_requests")
      .insert([bloodRequest])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
        details: error.details || null,
        hint: error.hint || null
      });
    }

    return res.status(201).json({
      success: true,
      message: "Blood request saved successfully",
      data
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Internal server error"
    });
  }
});

// Get blood requests
app.get("/api/blood-requests", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Internal server error"
    });
  }
});

// IMPORTANT:
// Do NOT use app.listen() when this file is used directly by Vercel.

export default app;
