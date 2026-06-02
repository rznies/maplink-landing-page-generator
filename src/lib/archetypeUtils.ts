import type { GeneratedSiteData } from '../types';

/**
 * Shared utilities used by every archetype renderer.
 *
 * Kept here so the three archetype files stay focused on layout and styling
 * rather than repeating the same helpers verbatim.
 */

/** Build a WhatsApp deep-link for a given phone number and prefilled message. */
export function getWaLink(phone: string | undefined, text: string): string {
  if (!phone) return '#contact';
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

/** Canonical fallback FAQ set shown when the AI has not generated FAQs. */
export const FALLBACK_FAQS: { q: string; a: string }[] = [
  {
    q: 'What are your working hours?',
    a: 'Please check our hours listed on this page. We recommend calling ahead to confirm availability for your visit.',
  },
  {
    q: 'Do you offer consultations?',
    a: "Yes, get in touch via WhatsApp or phone and we'll help you understand the next step.",
  },
  {
    q: 'What is your typical turnaround time?',
    a: "Timelines vary by project scope. We'll provide a clear estimate after understanding your requirements.",
  },
  {
    q: 'Do you serve my area?',
    a: 'We primarily serve the local area and surroundings. Contact us with your location and we\'ll confirm coverage.',
  },
];

/**
 * Resolve the FAQs to render: use AI-generated ones if present, else fall back
 * to the canonical set. Exported so both the live renderer and the HTML export
 * function use the same logic.
 */
export function resolveFaqs(
  copy: GeneratedSiteData['copy'],
): { q: string; a: string }[] {
  return copy?.faqs?.length > 0 && copy.faqs[0]?.q ? copy.faqs : FALLBACK_FAQS;
}
