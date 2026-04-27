import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { pipeline } from "@xenova/transformers";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

dotenv.config();

const firebaseConfigPath = path.resolve(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
}

const fbApp = initializeApp(firebaseConfig);
// Explicitly pass databaseId if needed, though usually default works
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || "(default)");

const PLACES_API_KEY = process.env.PLACES_API_KEY;

// In-memory coalescer for requests
const pendingRequests = new Map();

// Helper to unroll maps URL
async function unrollUrl(url) {
  if (!url.includes("maps.app.goo.gl")) return url;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const location = res.headers.get("location");
    return location || url;
  } catch (e) {
    return url;
  }
}

// Helper to extract place_id or cid
function extractPlaceId(url) {
  const placeIdMatch = url.match(/place_id:([^&?]+)/);
  if (placeIdMatch) return placeIdMatch[1];
  const cidMatch = url.match(/cid=([0-9]+)/);
  if (cidMatch) return `cid_${cidMatch[1]}`;
  const ftidMatch = url.match(/ftid=([^&?]+)/);
  if (ftidMatch) return `ftid_${ftidMatch[1]}`;
  return null;
}

// TextSearch API as fallback if ID can't be found
async function findPlaceId(query) {
  if (!PLACES_API_KEY) throw new Error("Missing PLACES_API_KEY");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query }),
  });
  const data = await res.json();
  return data.places?.[0]?.id;
}

async function getPlaceDetails(placeId) {
  if (!PLACES_API_KEY) throw new Error("Missing PLACES_API_KEY");
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,types,rating,userRatingCount,currentOpeningHours,websiteUri,photos,reviews&key=${PLACES_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch place details");
  return await res.json();
}

async function getEmbeddings(texts) {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  return Promise.all(texts.map((text) => extractor(text, { pooling: "mean", normalize: true })));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
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

    const sendMsg = (msg, data = null) => {
      res.write(`data: ${JSON.stringify({ message: msg, data })}\n\n`);
    };

    try {
      sendMsg("Unfolding link...");
      const finalUrl = await unrollUrl(mapsUrl);
      
      let placeId = extractPlaceId(finalUrl);
      if (!placeId) {
        // Fallback: try searching
        placeId = await findPlaceId(finalUrl.split("?")[0]);
      }
      if (!placeId) {
        throw new Error("Could not determine Place ID from URL");
      }

      // Check cache coalesce
      if (pendingRequests.has(placeId)) {
        const cachedPromise = pendingRequests.get(placeId);
        sendMsg("Waiting for another site generation for this place...");
        const result = await cachedPromise;
        sendMsg("Done!", result);
        return res.end();
      }

      const generatePromise = (async () => {
        // Check firestore cache
        const siteDocRef = doc(db, "sites", placeId);
        const siteDoc = await getDoc(siteDocRef);
        
        if (siteDoc.exists()) {
          const data = siteDoc.data();
          if (Date.now() - data.createdAt < 30 * 24 * 60 * 60 * 1000) {
            return JSON.parse(data.siteData);
          }
        }

        // Lock pattern check
        const lockRef = doc(db, "locks", placeId);
        const lockDoc = await getDoc(lockRef);
        if (lockDoc.exists() && Date.now() < lockDoc.data().expiresAt) {
          throw new Error("Generation already in progress");
        }
        await setDoc(lockRef, { expiresAt: Date.now() + 10000 });

        sendMsg("Reading verified reviews...");
        const details = await getPlaceDetails(placeId);

        let jtbdPhrases = [];
        if (details.reviews && details.reviews.length > 0) {
          sendMsg("Extracting jobs-to-be-done from reviews locally...");
          const reviewsText = details.reviews.map(r => r.text?.text || r.originalText?.text || "").filter(Boolean);
          // Split into sentences broadly
          let sentences = [];
          for (const text of reviewsText) {
             sentences.push(...text.split(/(?<=[.!?])\s+/));
          }
          sentences = sentences.filter(s => s.length > 20 && s.length < 150);

          let topPhrases = sentences;
          try {
             // Local embeddings to find phrases most similar to JTBD concepts
             const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
             const jtbdSeed = ["solved my problem", "exactly what I needed", "helped me achieve", "hired them to", "the reason I went there"];
             
             const seedEmbeds = await extractor(jtbdSeed, { pooling: "mean", normalize: true });
             const sentenceEmbeds = await extractor(sentences, { pooling: "mean", normalize: true });
             
             // Simple scoring: for each sentence, find max similarity against seeds
             const scored = sentences.map((sentence, i) => {
                 const currentEmbed = sentenceEmbeds[i].data;
                 let maxScore = -1;
                 for (let j = 0; j < jtbdSeed.length; j++) {
                     let score = 0;
                     const seedRow = seedEmbeds[j].data;
                     for (let k = 0; k < currentEmbed.length; k++) {
                         score += currentEmbed[k] * seedRow[k];
                     }
                     if (score > maxScore) maxScore = score;
                 }
                 return { sentence, score: maxScore };
             });
             scored.sort((a, b) => b.score - a.score);
             topPhrases = scored.slice(0, 10).map(s => s.sentence);
          } catch(e) {
             console.error("Transformers failed, falling back to basic extraction", e);
             topPhrases = sentences.slice(0, 10);
          }
          jtbdPhrases = topPhrases;
        }

        sendMsg("Writing your headline...");
        const sysPrompt = `You are a JTBD analyst. Given business name, category, and customer phrases, output JSON: {hero_headline:string, subheadline:string, value_props:[string, string, string], faqs:[{q:string,a:string}], testimonials:[string, string]}. Reuse customer wording, do not invent services.`;
        
        let aiResultStr = "{}";
        try {
            const ai = new GoogleGenAI({});
            const aiResult = await ai.models.generateContent({
              model: "gemini-3.1-pro",
              contents: `Name: ${details.displayName?.text}. Type: ${details.types?.[0]}. Reviews: ${JSON.stringify(jtbdPhrases)}`,
              config: {
                systemInstruction: sysPrompt,
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            });
            aiResultStr = aiResult.text || "{}";
        } catch(e: any) {
            console.error(e);
            if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
                sendMsg("Warning: Gemini API Key is invalid. Using fallback copy. Check your Secrets panel.");
            } else {
                sendMsg("Warning: AI generation failed. Using fallback copy.");
            }
            aiResultStr = "{}"; // Fallback
        }

        let copyResult = JSON.parse(aiResultStr);

        const resultObj = {
          placeId,
          name: details.displayName?.text,
          types: details.types,
          address: details.formattedAddress,
          rating: details.rating,
          reviewCount: details.userRatingCount,
          hours: details.currentOpeningHours?.weekdayDescriptions || [],
          website: details.websiteUri,
          photos: details.photos?.slice(0, 3).map(p => `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=800&maxWidthPx=800&key=${PLACES_API_KEY}`) || [],
          copy: copyResult,
        };

        // Save cache
        await setDoc(siteDocRef, {
          placeId,
          siteData: JSON.stringify(resultObj),
          createdAt: Date.now()
        });

        return resultObj;
      })();

      pendingRequests.set(placeId, generatePromise);
      
      try {
        const result = await generatePromise;
        sendMsg("Done!", result);
      } finally {
        pendingRequests.delete(placeId);
      }

    } catch (err) {
      console.error(err);
      sendMsg("Error", err.message);
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
