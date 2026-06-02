import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, ArrowUpRight, Plus, Minus, Envelope, PhoneCall } from '@phosphor-icons/react';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { FloatingNav } from '../components/ui/FloatingNav';
import { downloadHtml, slugifyFilename } from '../lib/exportHtml';
import type { Review, GeneratedSiteData } from '../types';
import { getWaLink, resolveFaqs } from '../lib/archetypeUtils';
import { buildHtml, trustThemeAdapter } from '../lib/htmlBuilder';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200/80 py-5">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-semibold text-lg text-zinc-900 leading-snug">{q}</span>
        <span className="shrink-0 text-zinc-400">
          {open ? <Minus weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <p className="pt-3 text-zinc-600 leading-relaxed text-base">{a}</p>
      )}
    </div>
  );
}

export function TrustSite({ data, onBack, currentOverride, onSwitch }: { data: GeneratedSiteData, onBack: () => void, currentOverride: string, onSwitch: (v: string) => void }) {
  const heroPhoto = data.photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  const galleryPhotos = data.photos.slice(1, 7);
  const faqsToRender = resolveFaqs(data.copy);
  const ctaLink = getWaLink(data.phone, `Hi ${data.name}, I would like to schedule an inquiry.`);

  const handleExport = () => {
    const html = buildHtml(data, trustThemeAdapter);
    downloadHtml(html, `${slugifyFilename(data.name)}-trust.html`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFDFD] text-[#1E293B] font-sans selection:bg-slate-200 relative pb-16">
      <FloatingNav onBack={onBack} onSwitch={onSwitch} currentOverride={currentOverride} businessName={data.name} onExport={handleExport} />

      {/* 1. Hero Section */}
      <section className="relative pt-36 pb-24 px-4 max-w-6xl mx-auto z-10 border-b border-zinc-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold tracking-wider uppercase rounded mb-6">
              <ShieldCheck weight="fill" className="w-4 h-4 text-blue-600" /> Verified Professional Service
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6 font-serif">
              {data.copy?.hero_headline || data.name}
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              {data.copy?.subheadline || `Dedicated to providing professional services in the ${data.address} community.`}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded shadow-sm text-sm font-semibold">
                <Star weight="fill" className="text-amber-500 w-4 h-4" /> 
                <span>{data.rating} / 5.0 Rating</span>
                <span className="text-slate-400">({data.reviewCount} Reviews)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {data.phone ? (
                <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#0B192C] text-white px-8 py-4 hover:bg-slate-800 transition-colors text-sm font-bold tracking-wide rounded select-none">
                  <PhoneCall weight="bold" /> Contact Office
                </a>
              ) : (
                <a href="#contact" className="inline-flex items-center justify-center gap-2 bg-[#0B192C] text-white px-8 py-4 hover:bg-slate-800 transition-colors text-sm font-bold tracking-wide rounded select-none">
                  <Envelope weight="bold" /> Get In Touch
                </a>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="border-4 border-slate-100 shadow-xl overflow-hidden aspect-[4/3] rounded">
              <img src={heroPhoto} alt={data.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Credentials/Specialties */}
      {(data.copy?.specialties?.length ?? 0) > 0 && (
        <section className="py-12 px-4 max-w-6xl mx-auto border-b border-zinc-200/50">
          <ScrollReveal className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] shrink-0">Specializations</span>
            <div className="flex flex-wrap gap-2.5">
              {data.copy.specialties!.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-medium rounded">
                  {s}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 3. Value Props / Core Pillars */}
      {(data.copy?.value_props?.length ?? 0) > 0 && (
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 font-serif text-center">Our Commitment to Excellence</h2>
            <p className="text-slate-500 text-lg mb-16 text-center max-w-xl mx-auto">Standard-setting quality backed by consistent patient and client feedback.</p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.copy?.value_props?.slice(0, 3).map((prop, i) => {
              const parts = prop.split(':');
              const title = parts[0]?.trim() || prop;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="h-full p-8 border border-slate-200 bg-white shadow-sm rounded hover:shadow-md transition-shadow">
                    <div className="text-[#0B192C] font-bold text-2xl mb-6">0{i+1}</div>
                    <h3 className="text-xl font-bold text-slate-950 mb-3 font-serif">{title}</h3>
                    {desc && <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="py-24 px-4 bg-slate-50 border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-12 font-serif">Facility & Practice</h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPhotos.slice(0, 4).map((photo, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <img src={photo} alt="" className="w-full aspect-square object-cover border border-slate-200/50 shadow-sm rounded" />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Original Reviews */}
      {data.originalReviews && data.originalReviews.length > 0 && (
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-16 font-serif text-center">Patient & Client Reviews</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.originalReviews.map((review, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="p-8 border border-slate-200 bg-white shadow-sm rounded">
                  <div className="flex text-amber-500 mb-4">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-slate-800 leading-relaxed mb-6 italic">"{review.text}"</p>
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{review.author}</span>
                    <span>Verified Patient</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ Section */}
      {faqsToRender.length > 0 && (
        <section className="py-24 px-4 bg-slate-50 border-y border-slate-200/60">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-12 font-serif text-center">Office Policy & FAQ</h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="bg-white border border-slate-200 px-8 py-4 shadow-sm rounded divide-y divide-slate-100">
                {faqsToRender.map((faq, i) => (
                  <div key={i}><FaqItem q={faq.q} a={faq.a} /></div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 7. Coordinates & Map */}
      {data.address && (
        <section className="py-24 px-4 max-w-6xl mx-auto" id="contact">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal className="lg:col-span-5">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8 font-serif">Office Location</h2>
              
              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">OFFICE ADDRESS</span>
                  <span className="text-slate-800 text-base">{data.address}</span>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold block mt-2 hover:underline">Get Directions <ArrowUpRight weight="bold" className="w-3.5 h-3.5 inline" /></a>
                </div>
                
                {data.hours && data.hours.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-2">OFFICE HOURS</span>
                    <ul className="text-slate-600 space-y-1.5 text-base">
                      {data.hours.slice(0, 7).map((h, i) => (
                        <li key={i} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300" />{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="lg:col-span-7">
              <div className="border border-slate-200 shadow-md p-1 bg-white rounded aspect-[16/10] overflow-hidden">
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="opacity-90" />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 text-slate-500 border-t border-slate-200/50 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4 text-xs font-medium">
          <div>&copy; {new Date().getFullYear()} {data.name}. Certified Professional Practice.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
