import { GoogleGenAI } from '@google/genai';
import type { SiteCopy } from './types';

// ─── Copywriting context ──────────────────────────────────────────────────────

export interface CopyContext {
  name: string;
  category: string;
  location: string;
  jtbdPhrases: string[];
  websiteContent?: string;
  archetype?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Ordered list of models to try. First available wins. */
const MODELS_TO_TRY = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
] as const;

function getSystemPrompt(archetype?: string): string {
  let toneInstruction = "Write in a clear, friendly, and structured professional tone. Focus on how-to guides, customer ease, step-by-step processes, and direct benefits. Keep it highly legible and modern.";
  if (archetype === 'minimalist') {
    toneInstruction = "Write in a slow-paced, poetic, and premium luxury tone. Focus on details, craftsmanship, sanctuary, and high-end materials. Avoid exclamation marks. Use verbs of feeling/observing. Make it feel clean and high-end.";
  } else if (archetype === 'brutalist') {
    toneInstruction = "Write in an assertive, high-impact, direct, and utilitarian industrial tone. Focus on speed, strength, machinery, and no-nonsense outcomes. Use uppercase and telegraphic, short sentences. Avoid fluff.";
  } else if (archetype === 'trust') {
    toneInstruction = "Write in a formal, authoritative, traditional, secure, and reassuring tone. Focus on credentials, licensing, safety, clinical/professional precision, and peace of mind. Use clear, structured benefit statements.";
  } else if (archetype === 'playful') {
    toneInstruction = "Write in a bouncy, friendly, warm, high-character, and accessible tone. Focus on fun, community, comfort, sweetness, and high energy. Keep it conversational and bright.";
  }

  return `You are a senior conversion copywriter building a landing page for a local business. Given business info and customer review phrases, output ONLY valid JSON.

TONE OF VOICE REQUIREMENT:
${toneInstruction}

RULES — never break these:
1. hero_headline: Short, punchy, intuitive. MAX 8 WORDS. Must feel like a tagline a real brand would use. Name a specific offering or outcome. NEVER use comparatives ("best", "better than"). NEVER use generic adjectives ("premium", "amazing", "top-notch", "great"). 
   GOOD: "Interiors That Feel Like Home"
   GOOD: "Specialty Coffee, Roasted Daily"
   BAD: "Residential Interior Design and Architecture for Homes in Delhi NCR" (too long, too literal)
   BAD: "The Best Interior Design Company" (generic superlative)
2. subheadline: One crisp sentence. Mention city/area + what you do. Conversational tone, not a brochure. Max 15 words.
3. value_props: Exactly 3 strings. Format: "Title: Description". The Title (2-4 words) should be a clear benefit. The Description (8-15 words) explains WHY using specifics from reviews. Do NOT start with "Hired for". Make each one different and specific.
   GOOD: "On-Time Delivery: Every project completed within the promised timeline, no exceptions"
   GOOD: "Space That Works: Layouts optimized for how your family actually lives"
   BAD: "Hired for: constructing dream homes with technical expertise" (robotic, generic)
4. services: 3-5 specific named offerings extracted from reviews or website. Use exact nouns customers use.
5. how_it_works: Exactly 3 steps describing the customer journey. Each step: short imperative sentence (5-10 words). Must flow logically from first contact to completion.
6. faqs: MANDATORY. Exactly 4 questions a first-time customer would ask. Answers max 2 sentences each. If reviews don't cover it, use universal questions for this business type (pricing, timeline, process, guarantees). NEVER leave empty.
7. specialties: Array of 3-5 items the business is specifically known for. Extract from reviews — specific service names, product names, or techniques.
8. pull_quote: Single best 1-sentence customer quote from reviews. Verbatim. If none, omit.
9. testimonials: 2 short customer phrases (under 20 words each).

Output JSON schema: { hero_headline, subheadline, value_props, services, how_it_works, faqs, specialties, pull_quote, testimonials }`;
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Generate marketing copy for a business using the Gemini API.
 *
 * Tries each model in MODELS_TO_TRY in order; skips overloaded (503) or
 * unavailable (404) models. Returns an empty SiteCopy on API key errors so
 * the rest of the pipeline can still produce a site with fallback copy.
 */
export async function generateCopy(ctx: CopyContext): Promise<SiteCopy> {
  const userContent = [
    `Business: ${ctx.name}`,
    `Category: ${ctx.category}`,
    `Location: ${ctx.location}`,
    `Customer review phrases: ${JSON.stringify(ctx.jtbdPhrases)}`,
    ctx.websiteContent
      ? `\nBusiness website content (use this to extract specific product/service names, specialties, and brand voice):\n${ctx.websiteContent}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const ai = new GoogleGenAI({});
    let aiResult: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Trying model ${modelName}...`);
        aiResult = await ai.models.generateContent({
          model: modelName,
          contents: userContent,
          config: {
            systemInstruction: getSystemPrompt(ctx.archetype),
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });
        console.log(`Success with ${modelName}!`);
        break;
      } catch (modelErr: any) {
        if (modelErr.status === 503 || modelErr.status === 404) {
          console.log(`${modelName} failed with ${modelErr.status}, trying next...`);
          continue;
        }
        throw modelErr; // non-retriable error — bubble up
      }
    }

    if (!aiResult) throw new Error('All models are currently overloaded or unavailable.');
    return JSON.parse(aiResult.text || '{}') as SiteCopy;
  } catch (e: any) {
    console.error(e);
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      console.warn('[copyGenerator] Gemini API key is invalid. Returning empty copy.');
    } else {
      console.warn('[copyGenerator] AI generation failed. Returning empty copy.');
    }
    // Non-fatal: caller will produce a site with fallback copy in archetypes
    return {} as SiteCopy;
  }
}
