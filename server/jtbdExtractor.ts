import { pipeline } from '@xenova/transformers';
import type { Review } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

const JTBD_SEEDS = [
  'solved my problem',
  'exactly what I needed',
  'helped me achieve',
  'hired them to',
  'the reason I went there',
];

const MIN_SENTENCE_LEN = 20;
const MAX_SENTENCE_LEN = 150;
const TOP_K = 10;

// ─── Internal helpers ────────────────────────────────────────────────────────

function splitIntoSentences(reviews: Review[]): string[] {
  const sentences: string[] = [];
  for (const r of reviews) {
    const text = r.text || '';
    if (text) sentences.push(...text.split(/(?<=[.!?])\s+/));
  }
  return sentences.filter(
    (s) => s.length > MIN_SENTENCE_LEN && s.length < MAX_SENTENCE_LEN,
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Rank review sentences by semantic similarity to Jobs-To-Be-Done seed phrases
 * using local Xenova embeddings. Falls back to first-K sentences if the model
 * fails to load.
 *
 * Returns up to TOP_K phrases, or [] when there are no reviews.
 */
export async function extractJtbdPhrases(reviews: Review[]): Promise<string[]> {
  if (!reviews || reviews.length === 0) return [];

  const sentences = splitIntoSentences(reviews);
  if (sentences.length === 0) return [];

  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const seedEmbeds = await extractor(JTBD_SEEDS, { pooling: 'mean', normalize: true });
    const sentenceEmbeds = await extractor(sentences, { pooling: 'mean', normalize: true });

    // Cosine similarity: find max score across all seeds for each sentence
    const scored = sentences.map((sentence, i) => {
      const sentVec: number[] = sentenceEmbeds[i].data;
      let maxScore = -1;
      for (let j = 0; j < JTBD_SEEDS.length; j++) {
        const seedVec: number[] = seedEmbeds[j].data;
        let dot = 0;
        for (let k = 0; k < sentVec.length; k++) {
          dot += sentVec[k] * seedVec[k];
        }
        if (dot > maxScore) maxScore = dot;
      }
      return { sentence, score: maxScore };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, TOP_K).map((s) => s.sentence);
  } catch (e) {
    console.error('Transformers failed, falling back to basic extraction', e);
    return sentences.slice(0, TOP_K);
  }
}
