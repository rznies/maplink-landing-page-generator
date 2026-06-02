import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Clock,
  Plus,
  Minus,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react';
import { PremiumCard } from '../components/ui/PremiumCard';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { FloatingNav } from '../components/ui/FloatingNav';
import { downloadHtml, slugifyFilename } from '../lib/exportHtml';
import type { Review, GeneratedSiteData } from '../types';
import { getWaLink, resolveFaqs } from '../lib/archetypeUtils';
import { buildHtml, structuralThemeAdapter } from '../lib/htmlBuilder';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-6 text-left gap-4 group"
      >
        <span className="font-semibold text-lg text-zinc-900 tracking-tight leading-snug">{q}</span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
          {open ? <Minus weight="bold" className="w-4 h-4 text-zinc-600" /> : <Plus weight="bold" className="w-4 h-4 text-zinc-600" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <p className="pb-6 text-zinc-500 leading-relaxed text-base max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Floating WhatsApp FAB */
function WhatsAppFab({ phone, name }: { phone?: string; name: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!phone) return null;
  const link = getWaLink(phone, `Hi ${name}, I found you on Google and would like to know more.`);

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {expanded && (
          <motion.a
            href={link} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white border border-zinc-200 shadow-2xl rounded-2xl px-5 py-4 flex items-center gap-3 hover:shadow-3xl transition-shadow"
          >
            <WhatsappLogo weight="fill" className="w-6 h-6 text-[#25D366]" />
            <div>
              <div className="text-sm font-bold text-zinc-900">Message on WhatsApp</div>
              <div className="text-xs text-zinc-400">Typically replies instantly</div>
            </div>
          </motion.a>
        )}
      </AnimatePresence>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
      >
        {expanded ? <X weight="bold" className="w-6 h-6" /> : <WhatsappLogo weight="fill" className="w-7 h-7" />}
      </button>
    </div>
  );
}

/* Infinite sliding reviews ticker */
function ReviewsTicker({ reviews }: { reviews: Review[] }) {
  const doubled = [...reviews, ...reviews];
  return (
    <section className="py-24 bg-[#FDFBF7] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 mb-12">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900" style={{ fontFamily: 'var(--font-sans)' }}>
            What people say
          </h2>
        </ScrollReveal>
      </div>
      <div className="relative">
        <div className="flex gap-6 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {doubled.map((review, i) => (
            <div key={i} className="w-[400px] shrink-0 bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} weight={j < review.rating ? "fill" : "regular"} className="w-4 h-4" />)}
                </div>
                <p className="text-zinc-800 leading-relaxed mb-6 line-clamp-4">"{review.text}"</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                {review.authorPhoto ? (
                  <img src={review.authorPhoto} alt="" className="w-10 h-10 rounded-full ring-2 ring-zinc-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-sm">{review.author.charAt(0)}</div>
                )}
                <span className="font-semibold text-sm text-zinc-900 tracking-tight">{review.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

const VALUE_ICONS = ['✦', '◆', '●'];

export function StructuralSite({ data, onBack, currentOverride, onSwitch }: { data: GeneratedSiteData, onBack: () => void, currentOverride: string, onSwitch: (v: string) => void }) {
  const heroPhoto = data.photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  const galleryPhotos = data.photos.slice(1, 7);
  const faqsToRender = resolveFaqs(data.copy);

  const navSections = [
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleExport = () => {
    const html = buildHtml(data, structuralThemeAdapter);
    downloadHtml(html, `${slugifyFilename(data.name)}-structural.html`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-zinc-200 relative">
      <FloatingNav onBack={onBack} onSwitch={onSwitch} currentOverride={currentOverride} businessName={data.name} onExport={handleExport} />
      <WhatsAppFab phone={data.phone} name={data.name} />

      {/* 1. Hero */}
      <section className="relative min-h-[100dvh] pt-24 pb-24 px-4 md:px-8 flex flex-col justify-center max-w-[1400px] mx-auto overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 30, stiffness: 80, delay: 0.1 }}
            className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
          >
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.95] text-zinc-900 mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
              {data.copy?.hero_headline || data.name}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 mb-8 leading-relaxed max-w-xl">
              {data.copy?.subheadline || `Premium service located in ${data.address}`}
            </p>

            {data.copy?.pull_quote && (
              <p className="text-base text-zinc-400 italic border-l-2 border-zinc-200 pl-4 mb-8 leading-relaxed max-w-md">
                "{data.copy.pull_quote}"
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mb-10">
               <div className="bg-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-2">
                 <Star weight="fill" className="w-4 h-4 text-amber-500" />
                 <span className="font-bold text-sm tracking-tight">{data.rating} / 5.0</span>
                 <span className="text-zinc-500 text-sm">({data.reviewCount} Reviews)</span>
               </div>
               <div className="bg-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-2">
                 <ShieldCheck weight="fill" className="w-4 h-4 text-blue-600" />
                 <span className="font-semibold text-sm tracking-tight">Verified</span>
               </div>
            </div>
            
            <a href="#contact" className="inline-block w-max">
              <button className="bg-zinc-950 text-white px-8 py-4 rounded-full font-bold text-sm tracking-tight flex items-center gap-3 hover:bg-zinc-800 transition-colors active:scale-[0.98]">
                Get in Touch <ArrowUpRight weight="bold" className="w-4 h-4" />
              </button>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 30 }}
            className="lg:col-span-6 relative order-1 lg:order-2"
          >
            <PremiumCard className="aspect-[4/3] lg:aspect-square">
               <img src={heroPhoto} alt={data.name} className="w-full h-full object-cover" />
            </PremiumCard>
          </motion.div>
        </div>
      </section>

      {/* 2. Specialties — full-width marquee style */}
      {(data.copy?.specialties?.length ?? 0) > 0 && (
        <section className="py-10 bg-zinc-950 overflow-hidden" id="about">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <ScrollReveal className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] shrink-0">What we're known for</span>
              <div className="flex flex-wrap gap-3">
                {data.copy.specialties!.map((s, i) => (
                  <span key={i} className="px-6 py-3 rounded-full border border-zinc-700 text-white text-sm font-medium tracking-tight hover:bg-zinc-800 transition-colors cursor-default">
                    {s}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 3. Why us — Value Props (Bento Grid) */}
      {(data.copy?.value_props?.length ?? 0) > 0 && (
         <section className="py-32 px-4 bg-white">
            <div className="max-w-[1400px] mx-auto">
               <ScrollReveal>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-zinc-900" style={{ fontFamily: 'var(--font-sans)' }}>Why people choose us</h2>
                  <p className="text-zinc-400 text-lg mb-16 max-w-lg">Real reasons from real customers.</p>
               </ScrollReveal>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.copy?.value_props?.slice(0,3).map((prop, i) => {
                    const parts = prop.split(':');
                    const title = parts[0]?.trim() || prop;
                    const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
                    
                    const isFeature = i === 0;
                    const cardClass = isFeature
                      ? "h-full p-10 bg-zinc-900 text-white rounded-3xl group md:col-span-2 flex flex-col justify-between min-h-[320px] transition-transform duration-500 hover:scale-[1.01]"
                      : "h-full p-10 bg-[#FDFBF7] border border-zinc-200 rounded-3xl group md:col-span-1 flex flex-col justify-between min-h-[320px] hover:border-zinc-300 transition-colors";
                    const titleClass = isFeature
                      ? "text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight text-white"
                      : "text-2xl font-bold tracking-tight mb-3 text-zinc-900 leading-tight";
                    const descClass = isFeature
                      ? "text-zinc-300 leading-relaxed text-lg max-w-xl"
                      : "text-zinc-500 leading-relaxed text-base";
                    const iconClass = isFeature
                      ? "text-4xl mb-12 text-zinc-400 group-hover:text-white transition-colors duration-500"
                      : "text-3xl mb-8 text-zinc-200 group-hover:text-zinc-900 transition-colors duration-500";

                    return (
                      <ScrollReveal key={i} delay={i * 0.1} className={isFeature ? "md:col-span-2" : "md:col-span-1"}>
                        <div className={cardClass}>
                          <div>
                            <div className={iconClass} style={{ fontFamily: 'var(--font-sans)' }}>
                              {VALUE_ICONS[i] || '✦'}
                            </div>
                            <h3 className={titleClass}>{title}</h3>
                          </div>
                          {desc && <p className={descClass}>{desc}</p>}
                        </div>
                      </ScrollReveal>
                    );
                  })}
               </div>
            </div>
         </section>
      )}

      {/* 4. How It Works — Clean vertical progress split */}
      {(data.copy?.how_it_works?.length ?? 0) > 0 && (
        <section className="py-32 px-4 bg-[#FDFBF7]">
          <div className="max-w-[1000px] mx-auto">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-20 text-zinc-900 text-center" style={{ fontFamily: 'var(--font-sans)' }}>How it works</h2>
            </ScrollReveal>
            <div className="relative border-l-2 border-zinc-200 ml-4 md:ml-32 space-y-16 py-2">
              {data.copy.how_it_works!.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="relative pl-8 md:pl-12">
                    {/* Step number badge pinned on the timeline line */}
                    <div className="absolute -left-[33px] top-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {i + 1}
                    </div>
                    {/* Step Content */}
                    <div className="pt-2">
                      <p className="text-xl md:text-2xl font-bold text-zinc-900 leading-tight">{step.replace(/^\d+\.\s*/, '')}</p>
                      <p className="text-zinc-500 mt-2 leading-relaxed text-sm md:text-base">We coordinate all the details to ensure a seamless experience from start to finish.</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="py-32 px-4 bg-white" id="gallery">
          <div className="max-w-[1400px] mx-auto">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-16 text-zinc-900" style={{ fontFamily: 'var(--font-sans)' }}>Gallery</h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryPhotos.map((photo, i) => (
                <ScrollReveal key={i} delay={i * 0.07}>
                  <PremiumCard className="aspect-square">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </PremiumCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Reviews — Infinite sliding ticker */}
      {data.originalReviews && data.originalReviews.length > 0 && (
        <div id="reviews">
          <ReviewsTicker reviews={data.originalReviews} />
        </div>
      )}

      {/* 7. FAQ — Always rendered */}
      <section className="py-32 px-4 bg-white" id="faq">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 lg:sticky lg:top-24" style={{ fontFamily: 'var(--font-sans)' }}>
                Frequently asked questions
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="divide-y divide-zinc-200">
                {faqsToRender.map((faq, i) => (
                  <div key={i}><FaqItem q={faq.q} a={faq.a} /></div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 8. Location */}
      {data.address && (
      <section className="py-32 px-4 bg-[#FDFBF7]" id="contact">
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
             <ScrollReveal className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-zinc-900" style={{ fontFamily: 'var(--font-sans)' }}>Find Us</h2>
                <div className="space-y-10 mb-16">
                   <div className="flex gap-6 items-start">
                      <div className="p-4 rounded-2xl bg-zinc-100/50 border border-zinc-100 text-zinc-900 mt-1"><MapPin weight="light" className="w-6 h-6" /></div>
                      <div>
                         <h4 className="font-bold text-xl mb-2 text-zinc-900 tracking-tight">Location</h4>
                         <p className="text-zinc-500 leading-relaxed text-lg max-w-sm">{data.address}</p>
                         <a href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium mt-3 inline-flex items-center gap-1 hover:underline">Get Directions <ArrowUpRight weight="bold" className="w-3 h-3" /></a>
                      </div>
                   </div>
                   {data.hours && data.hours.length > 0 && (
                     <div className="flex gap-6 items-start">
                        <div className="p-4 rounded-2xl bg-zinc-100/50 border border-zinc-100 text-zinc-900 mt-1"><Clock weight="light" className="w-6 h-6" /></div>
                        <div>
                           <h4 className="font-bold text-xl mb-3 text-zinc-900 tracking-tight">Hours</h4>
                           <ul className="text-zinc-500 space-y-2">
                              {data.hours.slice(0,7).map((h, i) => (
                                 <li key={i} className="text-lg flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />{h}</li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   )}
                </div>
             </ScrollReveal>

             <ScrollReveal delay={0.2} className="lg:col-span-7">
                <PremiumCard className="aspect-square md:aspect-[16/10]">
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="grayscale opacity-90" />
                </PremiumCard>
             </ScrollReveal>
         </div>
      </section>
      )}

      {/* Footer — professional with nav links */}
      <footer className="bg-zinc-950 text-zinc-400 py-20 px-4">
         <div className="max-w-[1400px] mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
             <div>
               <h3 className="font-bold text-white text-lg tracking-tight mb-4">{data.name}</h3>
               <p className="text-sm leading-relaxed max-w-xs">{data.copy?.subheadline || data.address}</p>
             </div>
             <div>
               <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">Quick Links</h4>
               <ul className="space-y-2.5 text-sm">
                 {navSections.map(s => (
                   <li key={s.id}><a href={`#${s.id}`} className="hover:text-white transition-colors">{s.label}</a></li>
                 ))}
               </ul>
             </div>
             <div>
               <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">Contact</h4>
               <ul className="space-y-2.5 text-sm">
                 <li>{data.address}</li>
                 {data.phone && <li>{data.phone}</li>}
                 {data.website && <li><a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Website</a></li>}
               </ul>
             </div>
           </div>
           <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
             <div>&copy; {new Date().getFullYear()} {data.name}. All rights reserved.</div>
             <div className="flex gap-6">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
             </div>
           </div>
         </div>
      </footer>
    </div>
  );
}
