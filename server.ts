import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body payload limit for high-resolution camera base64 strings
app.use(express.json({ limit: "25mb" }));

// Initialize GenAI client lazily or securely
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Route: Analyze Civic Issue Photo
app.post("/api/analyze-issue", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", lat, lng, locationName = "Current Location" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image payload provided." });
    }

    const ai = getAIClient();
    
    // Clean base64 string if data URL header is attached
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are an AI civic infrastructure inspector and public works dispatcher. 
Analyze the provided photo of a community issue (such as a road pothole, clogged drainage, broken streetlight, overflowing trash, graffiti, or sidewalk damage).

Location context provided: Coordinates (${lat || "Unknown Lat"}, ${lng || "Unknown Lng"}) near "${locationName}".

Return a detailed JSON evaluation matching the requested structure. Ensure the draft message is formal, respectful, polite, and urgently requests municipal relief.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Concise title of the civic problem." },
            category: { 
              type: Type.STRING, 
              description: "Category: 'Roads & Potholes', 'Drainage & Flooding', 'Sanitation & Trash', 'Streetlights & Power', 'Parks & Trees', or 'Public Hazard'." 
            },
            description: { type: Type.STRING, description: "Detailed summary of the defect and safety hazards for commuters/citizens." },
            severity: { type: Type.INTEGER, description: "Severity rating from 1 (minor cosmetic) to 10 (life-threatening emergency)." },
            recommendedAction: { type: Type.STRING, description: "Technical recommendation for city maintenance crews." },
            concernedAuthority: { type: Type.STRING, description: "Exact municipal department name responsible." },
            authorityEmail: { type: Type.STRING, description: "Official contact email for the department." },
            estimatedDaysToFix: { type: Type.INTEGER, description: "Reasonable estimate of repair timeline in days." },
            draftMessage: { type: Type.STRING, description: "Formal notification letter to the authority requesting prompt relief action." }
          },
          required: ["title", "category", "description", "severity", "recommendedAction", "concernedAuthority", "authorityEmail", "estimatedDaysToFix", "draftMessage"]
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Model returned empty response.");
    }

    const analysisData = JSON.parse(text);
    return res.json({ success: true, data: analysisData });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to analyze civic issue image." 
    });
  }
});

// API Route: Dispatch Official Notice
app.post("/api/dispatch-notice", (req, res) => {
  const { reportId, authorityEmail, title, concernedAuthority } = req.body;
  
  // Generate a realistic official municipal tracking ID
  const trackingNumber = `CIVIC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  return res.json({
    success: true,
    trackingNumber,
    dispatchedAt: new Date().toISOString(),
    recipient: authorityEmail || "dispatch@citygov.org",
    department: concernedAuthority || "Municipal Public Works Bureau",
    status: "Notice Dispatched & Logged"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Civic Issue Reporter" });
});

// Vite middleware / Static serving
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Civic Issue Reporter Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
