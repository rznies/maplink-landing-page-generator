import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, ArrowUpRight, Plus, Minus } from '@phosphor-icons/react';
import { NoiseOverlay } from '../components/ui/NoiseOverlay';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { FloatingNav } from '../components/ui/FloatingNav';
import { downloadHtml, slugifyFilename } from '../lib/exportHtml';
import type { Review, GeneratedSiteData } from '../types';
import { getWaLink, resolveFaqs } from '../lib/archetypeUtils';
import { buildHtml, minimalistThemeAdapter } from '../lib/htmlBuilder';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#EAEAEA] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-7 text-left gap-4"
      >
        <span className="font-normal text-xl font-serif leading-snug">{q}</span>
        <span className="shrink-0 text-[#787774]">
          {open ? <Minus weight="light" className="w-5 h-5" /> : <Plus weight="light" className="w-5 h-5" />}
        </span>
      </button>
      {open && (
        <p className="pb-7 text-[#787774] leading-relaxed text-lg font-serif max-w-2xl">{a}</p>
      )}
    </div>
  );
}

export function MinimalistSite({ data, onBack, currentOverride, onSwitch }: { data: GeneratedSiteData, onBack: () => void, currentOverride: string, onSwitch: (v: string) => void }) {
  const heroPhoto = data.photos[0] || '';
  const galleryPhotos = data.photos.slice(1, 7);
  const ctaLink = getWaLink(data.phone, `Hi ${data.name}, I found you on Google.`);

  const handleExport = () => {
    const html = buildHtml(data, minimalistThemeAdapter);
    downloadHtml(html, `${slugifyFilename(data.name)}-minimalist.html`);
  };
  
  return (
    <div className="min-h-[100dvh] bg-[#FBFBFA] text-[#111111] font-sans selection:bg-[#EAEAEA] relative">
      <FloatingNav onBack={onBack} onSwitch={onSwitch} currentOverride={currentOverride} businessName={data.name} onExport={handleExport} />
      <NoiseOverlay />

      {/* 1. Hero */}
      <section className="pt-40 pb-24 px-4 max-w-5xl mx-auto text-center relative z-10">
         <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}>
            <span className="inline-block px-4 py-1.5 border border-[#EAEAEA] text-[#787774] text-xs uppercase tracking-[0.1em] rounded-full mb-10 font-medium">
              {data.types?.[0]?.replace(/_/g, ' ') || 'Establishment'}
            </span>
            <h1 className="text-6xl md:text-[6.5rem] font-normal tracking-tight leading-[0.95] mb-10 font-serif">
              {data.copy?.hero_headline || data.name}
            </h1>
            <p className="text-2xl text-[#787774] mb-8 leading-relaxed max-w-2xl mx-auto font-serif italic">
              {data.copy?.subheadline || `Located in ${data.address}`}
            </p>

            {/* Pull quote */}
            {data.copy?.pull_quote && (
              <p className="text-lg text-[#999] font-serif italic mb-10 max-w-xl mx-auto">
                "{data.copy.pull_quote}"
              </p>
            )}
            
            <div className="flex justify-center items-center gap-6 mb-16 text-[#787774] text-sm tracking-wide">
               <div className="flex items-center gap-2"><Star weight="light" className="text-[#111111]" /> {data.rating} Rating</div>
               <div className="w-1 h-1 rounded-full bg-[#D1D1D1]" />
               <div>{data.reviewCount} Reviews</div>
               <div className="w-1 h-1 rounded-full bg-[#D1D1D1]" />
               <div className="flex items-center gap-1"><ShieldCheck weight="light" /> Verified</div>
            </div>
         </motion.div>
         
         <motion.div 
           initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} 
           animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
           transition={{ delay: 0.3, duration: 1.2, ease: [0.32, 0.72, 0, 1] }} 
           className="w-full aspect-[16/9] md:aspect-[21/9] border border-[#EAEAEA] bg-white p-2"
         >
            <img src={heroPhoto} className="w-full h-full object-cover grayscale opacity-90" alt="Hero" />
         </motion.div>
      </section>

      {/* 2. Specialties */}
      {(data.copy?.specialties?.length ?? 0) > 0 && (
        <section className="py-12 px-4 border-t border-[#EAEAEA] relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <ScrollReveal>
              <span className="text-[#787774] text-xs uppercase tracking-[0.15em] mr-4">Known for</span>
              {data.copy.specialties!.map((s, i) => (
                <span key={i} className="inline-block font-serif italic text-lg text-[#111111] mx-3">
                  {s}{i < data.copy.specialties!.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 3. Values — Editorial Split */}
      {(data.copy?.value_props?.length ?? 0) > 0 && (
         <section className="py-32 px-4 border-t border-[#EAEAEA] relative z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
               <ScrollReveal>
                  <h2 className="text-4xl md:text-5xl font-normal font-serif mb-8 md:sticky md:top-32">The Philosophy</h2>
               </ScrollReveal>
               <div className="space-y-16">
                  {data.copy?.value_props?.map((prop, i) => (
                     <ScrollReveal key={i} delay={i * 0.1}>
                        <h3 className="text-2xl font-normal mb-4 font-serif">{prop.split(':')[0] || prop}</h3>
                        {prop.includes(':') && <p className="text-[#787774] leading-relaxed text-lg max-w-md">{prop.split(':').slice(1).join(':')}</p>}
                     </ScrollReveal>
                  ))}
               </div>
            </div>
         </section>
      )}

      {/* 4. Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="py-32 px-4 border-t border-[#EAEAEA] relative z-10">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-normal font-serif mb-16">Moments</h2>
            </ScrollReveal>
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {galleryPhotos.map((photo, i) => (
                <ScrollReveal key={i} delay={i * 0.07} className="break-inside-avoid">
                  <img src={photo} alt="" className="w-full object-cover grayscale opacity-85 hover:opacity-100 hover:grayscale-0 transition-all duration-700" />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Reviews */}
      {data.originalReviews && data.originalReviews.length > 0 && (
        <section className="py-32 px-4 border-t border-[#EAEAEA] relative z-10 bg-white">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-normal mb-20 text-center font-serif">Selected Thoughts</h2>
            </ScrollReveal>
            <div className="columns-1 md:columns-2 gap-8 space-y-8">
               {data.originalReviews.map((review, i) => (
                  <ScrollReveal key={i} delay={i * 0.1} className="break-inside-avoid">
                    <div className="border border-[#EAEAEA] p-10 hover:border-[#D1D1D1] transition-colors bg-[#FBFBFA]">
                      <p className="text-[#111111] text-xl leading-relaxed mb-8 font-serif">"{review.text}"</p>
                      <div className="flex items-center justify-between text-sm text-[#787774] uppercase tracking-widest">
                        <span className="font-medium">{review.author}</span>
                        <span className="flex text-[#111111] tracking-[0.2em]">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                      </div>
                    </div>
                  </ScrollReveal>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ */}
      {(data.copy?.faqs?.length ?? 0) > 0 && (
        <section className="py-32 px-4 border-t border-[#EAEAEA] relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-normal font-serif md:sticky md:top-32">Questions</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              {data.copy.faqs.map((faq, i) => (
                <div key={i}><FaqItem q={faq.q} a={faq.a} /></div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 7. Location & CTA */}
      {data.address && (
      <section className="py-32 px-4 border-t border-[#EAEAEA] relative z-10">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
               <h2 className="text-4xl md:text-5xl font-normal mb-12 font-serif">Find Us</h2>
               <div className="mb-10">
                 <div className="font-medium uppercase tracking-widest text-xs mb-3 text-[#787774]">Address</div>
                 <div className="text-xl">{data.address}</div>
                 <a href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium uppercase tracking-widest mt-6 inline-flex items-center gap-2 border-b border-[#111111] pb-1 hover:text-[#787774] hover:border-[#787774] transition-colors">Get Directions <ArrowUpRight weight="bold" className="w-3 h-3" /></a>
               </div>
               
               {data.hours && data.hours.length > 0 && (
                 <div className="mb-16">
                   <div className="font-medium uppercase tracking-widest text-xs mb-3 text-[#787774]">Hours</div>
                   <div className="space-y-2 text-lg">
                     {data.hours.slice(0,7).map((h, i) => <div key={i}>{h}</div>)}
                   </div>
                 </div>
               )}

               {data.phone ? (
                 <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#111111] text-white px-10 py-5 hover:bg-[#333333] transition-colors text-sm uppercase tracking-widest w-full text-center">
                   Inquire Now
                 </a>
               ) : (
                 <button className="inline-block bg-[#111111] text-white px-10 py-5 hover:bg-[#333333] transition-colors text-sm uppercase tracking-widest w-full text-center">
                   Visit Us
                 </button>
               )}
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} className="aspect-[4/5] border border-[#EAEAEA] p-2 bg-white">
               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="grayscale opacity-80" />
            </ScrollReveal>
         </div>
      </section>
      )}

      {/* Footer */}
      <footer className="py-12 text-[#787774] text-xs border-t border-[#EAEAEA] uppercase tracking-widest relative z-10">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
           <div>&copy; {new Date().getFullYear()} {data.name}.</div>
           <div className="flex gap-8">
             <a href="#" className="hover:text-[#111111] transition-colors">Privacy</a>
             <a href="#" className="hover:text-[#111111] transition-colors">Terms</a>
           </div>
         </div>
      </footer>
    </div>
  );
}
