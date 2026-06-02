import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import fs from "fs";

import { generateSite } from "./server/pipeline";
import { FirestoreSiteStore } from "./server/firestoreSiteStore";
import { GooglePlaceReader } from "./server/googlePlaceReader";
import { DefaultCopywriter } from "./server/defaultCopywriter";

dotenv.config();

// ─── Firebase init ────────────────────────────────────────────────────────────

const firebaseConfigPath = path.resolve(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
}

const fbApp = initializeApp(firebaseConfig);
// Explicitly pass databaseId if needed, though usually default works
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || "(default)");

// ─── Config ───────────────────────────────────────────────────────────────────

const PLACES_API_KEY = process.env.PLACES_API_KEY!;

// Bump this to invalidate Firestore cache and force regeneration with new prompt
const DATA_VERSION = 3;

// ─── Server ───────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/generate", async (req, res) => {
    const mapsUrl = req.query.url;
    if (!mapsUrl || typeof mapsUrl !== "string") {
      return res.status(400).json({ error: "Missing URL" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (msg: string, data: unknown = null) =>
      res.write(`data: ${JSON.stringify({ message: msg, data })}\n\n`);

    try {
      const store = new FirestoreSiteStore(db);
      const placeReader = new GooglePlaceReader(PLACES_API_KEY);
      const copywriter = new DefaultCopywriter();
      const result = await generateSite(
        mapsUrl,
        {
          placeReader,
          copywriter,
          firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
          store,
          dataVersion: DATA_VERSION,
        },
        (msg) => send(msg),
      );
      send("Done!", result);
    } catch (err: any) {
      console.error(err);
      send("Error", err.message);
    } finally {
      res.end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
