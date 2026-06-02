import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowUpRight, Plus, Minus, Heart, Smiley } from '@phosphor-icons/react';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { FloatingNav } from '../components/ui/FloatingNav';
import { downloadHtml, slugifyFilename } from '../lib/exportHtml';
import type { Review, GeneratedSiteData } from '../types';
import { getWaLink, resolveFaqs } from '../lib/archetypeUtils';
import { buildHtml, playfulThemeAdapter } from '../lib/htmlBuilder';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-orange-100 bg-white/70 rounded-2xl p-4 shadow-sm mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-bold text-lg text-orange-950 leading-snug">{q}</span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
          {open ? <Minus weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <p className="pt-3 text-orange-900/80 leading-relaxed text-base">{a}</p>
      )}
    </div>
  );
}

export function PlayfulSite({ data, onBack, currentOverride, onSwitch }: { data: GeneratedSiteData, onBack: () => void, currentOverride: string, onSwitch: (v: string) => void }) {
  const heroPhoto = data.photos[0] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80';
  const galleryPhotos = data.photos.slice(1, 7);
  const faqsToRender = resolveFaqs(data.copy);
  const ctaLink = getWaLink(data.phone, `Hi ${data.name}! We'd love to drop by or check out your offerings!`);

  const handleExport = () => {
    const html = buildHtml(data, playfulThemeAdapter);
    downloadHtml(html, `${slugifyFilename(data.name)}-playful.html`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF0] text-[#432C12] font-sans selection:bg-orange-200 relative pb-16">
      <FloatingNav onBack={onBack} onSwitch={onSwitch} currentOverride={currentOverride} businessName={data.name} onExport={handleExport} />

      {/* 1. Hero Section */}
      <section className="relative pt-36 pb-24 px-4 max-w-5xl mx-auto z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/60 text-orange-800 text-xs font-black tracking-widest uppercase rounded-full mb-8">
            <Smiley weight="fill" className="w-4 h-4 text-orange-600" /> Welcome to Our Space!
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-orange-950 leading-[1.05] mb-8 max-w-4xl mx-auto">
            {data.copy?.hero_headline || data.name}
          </h1>
          
          <p className="text-lg md:text-2xl text-orange-900/80 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            {data.copy?.subheadline || `Fun and friendly local service right here in ${data.address}!`}
          </p>

          <div className="flex justify-center items-center flex-wrap gap-4 mb-12 text-sm">
            <div className="bg-white border-2 border-orange-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-sm font-extrabold">
              <Star weight="fill" className="text-amber-400 w-4 h-4" /> 
              <span>{data.rating} / 5.0</span>
              <span className="text-orange-900/40 font-normal">({data.reviewCount} Reviews)</span>
            </div>
            <div className="bg-white border-2 border-orange-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-sm font-extrabold text-pink-600">
              <Heart weight="fill" className="w-4 h-4 animate-pulse" /> Local Favorite
            </div>
          </div>

          <div className="flex justify-center mb-16">
            {data.phone ? (
              <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-orange-600 text-white font-extrabold px-10 py-5 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all text-base rounded-full shadow-lg hover:shadow-orange-200/50">
                Let's Connect! <ArrowUpRight weight="bold" className="w-5 h-5" />
              </a>
            ) : (
              <a href="#contact" className="inline-flex items-center gap-3 bg-orange-600 text-white font-extrabold px-10 py-5 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all text-base rounded-full shadow-lg hover:shadow-orange-200/50">
                Come Visit! <ArrowUpRight weight="bold" className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ type: "spring", delay: 0.3 }}
          className="max-w-4xl mx-auto rounded-3xl border-4 border-white shadow-2xl overflow-hidden aspect-[16/9]"
        >
          <img src={heroPhoto} alt={data.name} className="w-full h-full object-cover" />
        </motion.div>
      </section>

      {/* 2. Specialties */}
      {(data.copy?.specialties?.length ?? 0) > 0 && (
        <section className="py-12 px-4 bg-orange-50/50 border-y-2 border-orange-100">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal className="flex flex-col md:flex-row items-center justify-center gap-6">
              <span className="text-orange-950/50 text-xs font-black uppercase tracking-[0.2em]">What we do best</span>
              <div className="flex flex-wrap justify-center gap-2">
                {data.copy.specialties!.map((s, i) => (
                  <span key={i} className="px-5 py-2.5 bg-white border border-orange-100 text-orange-900 text-sm font-extrabold rounded-full shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 3. Value Props */}
      {(data.copy?.value_props?.length ?? 0) > 0 && (
        <section className="py-24 px-4 max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-4 text-center">Why You'll Love Us!</h2>
            <p className="text-orange-900/60 text-lg mb-16 text-center max-w-xl mx-auto font-medium">Here are the top reasons families and friends keep coming back.</p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.copy?.value_props?.slice(0, 3).map((prop, i) => {
              const parts = prop.split(':');
              const title = parts[0]?.trim() || prop;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="h-full p-8 bg-white border-2 border-orange-50 rounded-[2rem] hover:border-orange-200 transition-colors shadow-sm text-center">
                    <div className="text-4xl mb-6 flex justify-center">{['🌟', '🎈', '🍭'][i] || '✨'}</div>
                    <h3 className="text-xl font-black text-orange-950 mb-3">{title}</h3>
                    {desc && <p className="text-orange-900/70 leading-relaxed text-sm font-medium">{desc}</p>}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="py-24 px-4 bg-orange-100/30 border-y-2 border-orange-100">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-12 text-center">Peek Inside!</h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPhotos.slice(0, 4).map((photo, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <img src={photo} alt="" className="w-full aspect-square object-cover border-4 border-white shadow-md rounded-2xl hover:scale-102 transition-transform duration-300" />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Original Reviews */}
      {data.originalReviews && data.originalReviews.length > 0 && (
        <section className="py-24 px-4 max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-16 text-center">Happy Faces!</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.originalReviews.map((review, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="p-8 bg-white border-2 border-orange-50 rounded-[2rem] shadow-sm relative">
                  <div className="absolute -top-4 -left-2 text-3xl">💬</div>
                  <div className="flex text-amber-400 mb-4 pt-2">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-orange-950 leading-relaxed mb-6 font-medium italic">"{review.text}"</p>
                  <div className="border-t border-orange-50 pt-4 flex items-center justify-between text-xs font-black text-orange-900/60 uppercase tracking-wider">
                    <span>{review.author}</span>
                    <span className="text-orange-600">Local Reviewer</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ Section */}
      {faqsToRender.length > 0 && (
        <section className="py-24 px-4 bg-orange-100/30 border-y-2 border-orange-100">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-12 text-center">Frequently Asked Questions</h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="space-y-2">
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
        <section className="py-24 px-4 max-w-5xl mx-auto" id="contact">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal className="lg:col-span-5">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-8">Where to Find Us!</h2>
              
              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <span className="text-orange-950/40 font-black block mb-2 tracking-widest uppercase">ADDRESS</span>
                  <span className="text-orange-950 text-lg font-bold">{data.address}</span>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-extrabold block mt-2 hover:underline">Get Directions <ArrowUpRight weight="bold" className="w-3.5 h-3.5 inline" /></a>
                </div>
                
                {data.hours && data.hours.length > 0 && (
                  <div>
                    <span className="text-orange-950/40 font-black block mb-3 tracking-widest uppercase">OPEN HOURS</span>
                    <ul className="text-orange-900/80 space-y-1.5 text-base font-medium">
                      {data.hours.slice(0, 7).map((h, i) => (
                        <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" />{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="lg:col-span-7">
              <div className="border-4 border-white shadow-xl bg-white rounded-3xl aspect-[16/10] overflow-hidden">
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="opacity-90" />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 text-orange-900/60 border-t-2 border-orange-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4 text-xs font-extrabold tracking-wider uppercase">
          <div>&copy; {new Date().getFullYear()} {data.name}. All Smiles!</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-orange-950 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-950 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
