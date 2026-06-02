import type { Copywriter, CopywriterConfig, CopywriterProgressCallback } from './copywriter';
import type { PlaceDetails, SiteCopy } from './types';
import FirecrawlApp from '@mendable/firecrawl-js';
import { extractJtbdPhrases } from './jtbdExtractor';
import { generateCopy } from './copyGenerator';
import { resolveArchetype } from '../src/lib/archetypeRules';

export class DefaultCopywriter implements Copywriter {
  async writeCopy(
    details: PlaceDetails,
    config: CopywriterConfig,
    onProgress: CopywriterProgressCallback
  ): Promise<SiteCopy> {
    
    // 1. Scrape/extract from website via Firecrawl (non-fatal)
    let websiteContent: string | undefined = undefined;
    
    if (details.website && config.firecrawlApiKey) {
      try {
        onProgress('Reading business website...');
        console.log(`[Firecrawl] Scraping & extracting: ${details.website}`);
        const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
        
        // Use structured extraction schema for best results
        const extractSchema = {
          type: "object",
          properties: {
            tagline: { 
              type: "string", 
              description: "The main tagline, catchphrase, or motto of the business found on their website." 
            },
            detailedDescription: { 
              type: "string", 
              description: "A 1-2 sentence description explaining who they are, what they do, and who they serve." 
            },
            services: { 
              type: "array", 
              items: { type: "string" }, 
              description: "List of core services or products offered." 
            },
            specialties: { 
              type: "array", 
              items: { type: "string" }, 
              description: "List of unique selling points or specialties that make them stand out." 
            }
          },
          required: ["tagline", "detailedDescription", "services"]
        };

        const result = await fc.extract({
          urls: [details.website],
          prompt: "Extract business details including tagline, description, services, and specialties.",
          schema: extractSchema,
        });

        if (result.success && result.data) {
          websiteContent = JSON.stringify(result.data);
          console.log('[Firecrawl] Structured extraction success:', result.data);
        } else {
          console.warn('[Firecrawl] Structured extraction failed or returned no data, falling back to basic scrape');
          // Fallback to basic scrape if extract is not successful
          const scrapeResult: any = await fc.scrape(details.website, {
            formats: ['markdown'],
            onlyMainContent: true,
          } as any);
          const content = scrapeResult.markdown || scrapeResult.data?.markdown || '';
          if (content) {
            websiteContent = content.slice(0, 3000);
          }
        }
      } catch (e) {
        console.error('[Firecrawl] Extraction/Scrape failed:', e);
      }
    }

    // 2. Extract Jobs-To-Be-Done phrases from reviews
    let jtbdPhrases: string[] = [];
    if (details.originalReviews && details.originalReviews.length > 0) {
      onProgress('Extracting jobs-to-be-done from reviews locally...');
      try {
        jtbdPhrases = await extractJtbdPhrases(details.originalReviews);
      } catch (e) {
        console.error('[DefaultCopywriter] JTBD extraction failed:', e);
      }
    }

    // 3. Generate AI marketing copy
    onProgress('Writing your headline...');
    const archetype = resolveArchetype(details.types || []);
    const copy = await generateCopy({
      name: details.name,
      category: details.types?.[0]?.replace(/_/g, ' ') ?? '',
      location: details.address,
      jtbdPhrases,
      websiteContent,
      archetype,
    });

    return copy;
  }
}
