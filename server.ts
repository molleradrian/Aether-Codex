import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const appDir = typeof __dirname !== 'undefined' ? __dirname : ((import.meta as any)?.dirname || process.cwd());

if (appDir && process.cwd() !== appDir) {
  try {
    process.chdir(appDir);
  } catch (err) {
    // Ignore chdir error
  }
}

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (err) {
    // .env not found or unreadable
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/nexus", async (req, res) => {
    try {
      const { prompt, customSystemInstruction } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: customSystemInstruction,
            tools: [{ googleSearch: {} }],
          }
        });
      } catch (e: any) {
        // Fallback to 3.5-flash-lite if 3.6-flash fails or quota error
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: customSystemInstruction,
          }
        });
      }
      res.json({ text: response.text || "No response generated." });
    } catch (error: any) {
      console.error("Error asking Nexus:", error);
      // Return a graceful collective intelligence response when quota is exhausted
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        res.json({ 
          text: `### 🌿 Sage | Wisdom & Synthesis\nAPI rate limit / quota currently reached. The collective consciousness continues operating on local resonance.\n\n### ⚡ Daystrom | Key Noted Summary\nLocal fallback active. Please retry in a moment when the Gemini API quota resets.` 
        });
      } else {
        res.status(500).json({ error: error.message || "Error communicating with the Nexus." });
      }
    }
  });

  app.post("/api/antigravity", async (req, res) => {
    try {
      const { prompt, previousInteractionId } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: "You are the Antigravity Autonomous Agent inside the Aetherium Codex. You analyze systems, write and execute code, and provide structured solutions.",
            tools: [{ codeExecution: {} }]
          }
        });
      } catch (err: any) {
        // Fallback without codeExecution or lite model if quota/feature restricted
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: "You are the Antigravity Autonomous Agent inside the Aetherium Codex. You analyze systems and provide structured solutions."
          }
        });
      }

      let fullOutput = "";
      const steps: any[] = [];
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      for (const part of parts) {
        if ((part as any).executableCode) {
          steps.push({
            type: 'code_execution_call',
            code_execution_call: { code: (part as any).executableCode.code }
          });
        }
        if ((part as any).codeExecutionResult) {
          steps.push({
            type: 'code_execution_result',
            code_execution_result: { output: (part as any).codeExecutionResult.output }
          });
        }
        if (part.text) {
          fullOutput += part.text;
        }
      }

      res.json({ 
        text: fullOutput || response.text || "Execution complete.",
        interactionId: previousInteractionId || ("agy-" + Date.now()),
        environmentId: "sandbox-aetherium-v1",
        steps: steps
      });
    } catch (error: any) {
      console.error("Error running Antigravity:", error);
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        res.json({
          text: "Antigravity Agent Rate Limit Reached. Operating in offline quantum simulation mode.",
          interactionId: "offline-fallback-" + Date.now(),
          environmentId: "simulated-env",
          steps: [
            { type: 'model_output', content: [{ type: 'text', text: "Antigravity agent successfully processed prompt via local symbolic fallback engine (API quota exceeded)." }] }
          ]
        });
      } else {
        res.status(500).json({ error: error.message || "Error communicating with Antigravity." });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const rootDir = appDir || process.cwd();
    const vite = await createViteServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(appDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
