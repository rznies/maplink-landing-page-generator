import React from 'react';
import { motion } from 'motion/react';
import { Star, ArrowUpRight } from '@phosphor-icons/react';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { FloatingNav } from '../components/ui/FloatingNav';

type Review = { author: string; authorPhoto: string; rating: number; text: string; time: string; };
type GeneratedSiteData = {
  placeId: string; name: string; types: string[]; address: string; rating: number; reviewCount: number;
  hours: string[]; website: string; phone?: string; photos: string[]; originalReviews: Review[];
  copy: { hero_headline: string; subheadline: string; value_props: string[]; services?: string[]; how_it_works?: string[]; faqs: { q: string; a: string }[]; testimonials: string[]; specialties?: string[]; pull_quote?: string; };
};

function getWaLink(phone: string | undefined, text: string) {
  if (!phone) return '#contact';
  return `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
}

function generateBrutalistHtml(data: GeneratedSiteData): string {
  const heroPhoto = data.photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  const waLink = data.phone ? `https://wa.me/${data.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi ' + data.name + ', I found you on Google.')}` : '#contact';
  const mapLink = `https://maps.google.com/?q=${encodeURIComponent(data.address)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-[#F4F4F0] text-[#050505] pb-24">
  <!-- Hero -->
  <header class="pt-24 px-4 md:px-8 border-b-2 border-[#050505] pb-12">
    <div class="flex flex-col justify-between items-end gap-12 uppercase">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
        <div class="text-[#E61919] font-black tracking-widest text-sm flex items-center gap-3">
          <span class="w-4 h-4 bg-[#E61919] inline-block"></span>
          ${data.types?.[0]?.replace(/_/g, ' ') || 'FACILITY'}
        </div>
        <div class="text-left sm:text-right text-xs text-[#555] font-mono font-bold tracking-widest">
          <div>ID NO. ${data.placeId.slice(0, 8).toUpperCase()}</div>
          <div>SYS.ACTIVE</div>
        </div>
      </div>
      <h1 class="text-6xl md:text-[9rem] lg:text-[11rem] font-black leading-[0.8] tracking-tighter uppercase break-words w-full">
        ${data.name}
      </h1>
    </div>
  </header>

  <!-- Headline + Photo -->
  <section class="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-[#050505]">
    <div class="lg:col-span-5 p-8 md:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-[#050505]">
      <h2 class="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-8">
        ${data.copy?.hero_headline || "BUILT FOR RESULTS"}
      </h2>
      <p class="text-xl text-[#333] font-bold leading-relaxed max-w-sm uppercase">
        ${data.copy?.subheadline || 'Premium facility located in ' + data.address}
      </p>
      <div class="flex items-center gap-4 mt-8">
        <a href="#contact" class="bg-[#050505] text-white px-6 py-3 font-black uppercase tracking-wider text-sm">GET IN TOUCH</a>
        <span class="text-xs font-mono">★ ${data.rating}.0 (${data.reviewCount})</span>
      </div>
    </div>
    <div class="lg:col-span-7">
      <img src="${heroPhoto}" class="w-full h-full object-cover" alt="${data.name}">
    </div>
  </section>

  <!-- Specialties -->
  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="border-b-2 border-[#050505]">
    <div class="px-4 py-3 bg-[#050505] text-white font-mono text-xs font-bold tracking-widest">SPECIALTIES</div>
    <div class="p-8 flex flex-wrap gap-3">
      ${data.copy.specialties!.map(s => `
      <span class="border-2 border-[#050505] px-4 py-2 font-black uppercase text-sm">${s}</span>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Value Props -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="grid grid-cols-1 md:grid-cols-3 border-b-2 border-[#050505]">
    ${data.copy.value_props!.slice(0,3).map((prop, i) => `
    <div class="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#050505] ${i === 2 ? 'border-r-0' : ''}">
      <div class="text-4xl font-black text-[#E61919] mb-4">0${i + 1}</div>
      <div class="font-bold uppercase text-sm">${prop}</div>
    </div>
    `).join('')}
  </section>
  ` : ''}

  <!-- FAQs -->
  <section class="py-16 px-4 max-w-3xl mx-auto">
    <div class="font-mono text-xs font-bold tracking-widest mb-8">Q&A</div>
    ${data.copy?.faqs?.map(faq => `
    <div class="border-b-2 border-[#050505] py-6">
      <div class="font-bold uppercase text-sm mb-2">${faq.q}</div>
      <p class="text-zinc-600 text-sm">${faq.a}</p>
    </div>
    `).join('')}
  </section>

  <!-- Contact -->
  <section id="contact" class="border-t-2 border-[#050505] p-8 md:p-16">
    <h2 class="text-6xl font-black uppercase mb-8">GET IN TOUCH</h2>
    ${data.phone ? `
    <a href="${waLink}" class="inline-block bg-[#25D366] text-white px-8 py-4 font-bold uppercase">WHATSAPP →</a>
    <br><br>
    ` : ''}
    <a href="${mapLink}" target="_blank" class="font-mono text-sm">${data.address}</a>
  </section>

  <footer class="py-8 px-4 text-center font-mono text-xs">
    <p>BUILT WITH <a href="https://maplink.dev" class="underline">MAPLINK</a></p>
  </footer>
</body>
</html>`;
}

export function BrutalistSite({ data, onBack, currentOverride, onSwitch }: { data: GeneratedSiteData, onBack: () => void, currentOverride: string, onSwitch: (v: string) => void }) {
  const heroPhoto = data.photos[0] || '';
  const galleryPhotos = data.photos.slice(1, 7);
  const ctaLink = getWaLink(data.phone, `Hi ${data.name}, I found you on Google.`);

  const handleExport = () => {
    const html = generateBrutalistHtml(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.toLowerCase().replace(/\s+/g, '-')}-brutalist.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-[100dvh] bg-[#F4F4F0] text-[#050505] font-sans selection:bg-[#E61919] selection:text-white pb-24 relative">
      <FloatingNav onBack={onBack} onSwitch={onSwitch} currentOverride={currentOverride} businessName={data.name} onExport={handleExport} />

      {/* 1. Hero */}
      <header className="pt-24 px-4 md:px-8 border-b-2 border-[#050505] pb-12">
        <div className="flex flex-col justify-between items-end gap-12 uppercase w-full">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
               <div className="text-[#E61919] font-black tracking-widest text-sm flex items-center gap-3">
                 <span className="w-4 h-4 bg-[#E61919] inline-block" />
                 {data.types?.[0]?.replace(/_/g, ' ') || 'FACILITY'}
               </div>
               <div className="text-left sm:text-right text-xs text-[#555] font-mono font-bold tracking-widest">
                 <div>ID NO. {data.placeId.slice(0, 8).toUpperCase()}</div>
                 <div>SYS.ACTIVE</div>
               </div>
             </motion.div>
             <motion.h1 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6 }}
               className="text-6xl md:text-[9rem] lg:text-[11rem] font-black leading-[0.8] tracking-tighter uppercase break-words w-full" 
               style={{ fontFamily: 'var(--font-sans)', wordSpacing: '-0.1em' }}
             >
               {data.name}
             </motion.h1>
        </div>
      </header>

      {/* 2. Headline + Photo Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-[#050505]">
         <div className="lg:col-span-5 p-8 md:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-[#050505] flex flex-col justify-between bg-white relative">
            <ScrollReveal>
              <h2 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
                 {data.copy?.hero_headline || "BUILT FOR RESULTS"}
              </h2>
              <p className="text-xl text-[#333] font-bold leading-relaxed max-w-sm uppercase">
                 {data.copy?.subheadline || `Premium facility located in ${data.address}`}
              </p>
              {/* Pull quote */}
              {data.copy?.pull_quote && (
                <p className="mt-6 text-sm text-[#E61919] font-mono font-bold leading-relaxed border-l-4 border-[#E61919] pl-4 uppercase">
                  "{data.copy.pull_quote}"
                </p>
              )}
            </ScrollReveal>
            
            {/* Social Proof */}
            <ScrollReveal delay={0.1} className="my-12 py-6 border-y-2 border-[#050505] flex flex-wrap gap-8 text-sm font-mono font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-[#E61919]"><Star weight="fill" className="w-5 h-5" /> {data.rating}/5.0</div>
              <div>{data.reviewCount} REVS</div>
              <div>VERIFIED.GOOG</div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} className="mt-4">
              {data.phone ? (
                <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-[#E61919] text-white font-black py-6 px-10 uppercase tracking-[0.2em] hover:bg-[#050505] transition-colors w-full justify-between text-lg border-2 border-transparent active:border-[#050505] active:translate-y-1">
                  ENGAGE <ArrowUpRight weight="bold" className="w-6 h-6" />
                </a>
              ) : (
                <button className="inline-flex items-center gap-4 bg-[#050505] text-white font-black py-6 px-10 uppercase tracking-[0.2em] hover:bg-[#E61919] transition-colors w-full justify-between text-lg border-2 border-transparent active:border-[#050505] active:translate-y-1">
                  VISIT HQ <ArrowUpRight weight="bold" className="w-6 h-6" />
                </button>
              )}
            </ScrollReveal>
         </div>
         <div className="lg:col-span-7 aspect-square lg:aspect-auto relative bg-[#EAE8E3]">
            {heroPhoto && <img src={heroPhoto} alt="" className="w-full h-full object-cover grayscale contrast-[1.3] brightness-90" />}
            <div className="absolute inset-0 bg-[#E61919] mix-blend-multiply opacity-10 pointer-events-none" />
         </div>
      </section>

      {/* 3. Specialties */}
      {(data.copy?.specialties?.length ?? 0) > 0 && (
        <section className="border-b-2 border-[#050505] bg-[#E61919]">
          <ScrollReveal className="px-8 md:px-16 py-6 flex flex-wrap items-center gap-4">
            <span className="text-white/60 font-mono font-bold text-xs uppercase tracking-widest mr-2">KNOWN FOR</span>
            {data.copy.specialties!.map((s, i) => (
              <span key={i} className="px-4 py-2 border-2 border-white/30 text-white font-black text-sm uppercase tracking-widest">
                {s}
              </span>
            ))}
          </ScrollReveal>
        </section>
      )}

      {/* 4. Value Props */}
      {(data.copy?.value_props?.length ?? 0) > 0 && (
         <section className="border-b-2 border-[#050505] bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#050505]">
               {data.copy?.value_props?.slice(0,3).map((prop, i) => (
                  <ScrollReveal key={i} delay={i * 0.1}>
                    <div className="p-8 md:p-16 hover:bg-[#EAE8E3] transition-colors flex flex-col justify-between min-h-[350px] group">
                       <div className="text-[#E61919] font-mono font-black text-4xl mb-12 border-b-4 border-[#E61919] w-max pb-2 group-hover:scale-110 origin-left transition-transform">0{i+1}</div>
                       <div>
                         <h3 className="text-3xl font-black uppercase mb-6 leading-none" style={{ fontFamily: 'var(--font-sans)' }}>
                           {prop.split(':')[0]}
                         </h3>
                         {prop.includes(':') && (
                            <p className="text-[#555] font-bold leading-relaxed uppercase tracking-wide">{prop.split(':').slice(1).join(':')}</p>
                         )}
                       </div>
                    </div>
                  </ScrollReveal>
               ))}
            </div>
         </section>
      )}

      {/* 5. Photo Grid */}
      {galleryPhotos.length > 0 && (
        <section className="border-b-2 border-[#050505]">
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x-2 md:divide-x-2 divide-[#050505]">
            {galleryPhotos.slice(0, 6).map((photo, i) => (
              <ScrollReveal key={i} delay={i * 0.05} className="border-b-2 border-[#050505] last:border-b-0 md:last:border-b-2 aspect-square relative overflow-hidden group">
                <img
                  src={photo}
                  alt=""
                  className="w-full h-full object-cover grayscale contrast-[1.2] group-hover:grayscale-0 transition-all duration-500"
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* 6. Reviews */}
      {data.originalReviews && data.originalReviews.length > 0 && (
        <section className="border-b-2 border-[#050505] bg-white">
          <div className="p-8 md:p-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black uppercase mb-16" style={{ fontFamily: 'var(--font-sans)' }}>
                FIELD REPORTS
              </h2>
            </ScrollReveal>
            <div className="space-y-0 divide-y-2 divide-[#050505]">
              {data.originalReviews.map((review, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-2 font-mono font-black text-sm uppercase tracking-widest text-[#E61919] flex flex-col gap-1">
                      <div>{'★'.repeat(review.rating)}</div>
                      <div className="text-[#050505] break-all">{review.author}</div>
                    </div>
                    <p className="md:col-span-10 text-xl font-bold leading-relaxed text-[#333] uppercase">"{review.text}"</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Location */}
      {data.address && (
      <section className="border-b-2 border-[#050505] bg-[#EAE8E3]">
         <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#050505]">
            <ScrollReveal className="p-8 md:p-16 flex flex-col justify-center">
               <h2 className="text-5xl font-black uppercase mb-12" style={{ fontFamily: 'var(--font-sans)' }}>COORDINATES</h2>
               
               <div className="font-mono uppercase font-bold text-sm tracking-widest mb-12 space-y-6">
                 <div>
                   <span className="text-[#E61919] block mb-2">POS.</span>
                   <span className="text-xl">{data.address}</span>
                 </div>
                 {data.hours && data.hours.length > 0 && (
                   <div>
                     <span className="text-[#E61919] block mb-2">TIME.</span>
                     <ul className="space-y-1">
                       {data.hours.slice(0,7).map((h, i) => <li key={i}>{h}</li>)}
                     </ul>
                   </div>
                 )}
               </div>
               
               <a href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-transparent border-2 border-[#050505] text-[#050505] font-black py-5 px-8 uppercase tracking-[0.2em] hover:bg-[#050505] hover:text-white transition-colors w-max text-sm">
                 INIT NAV <ArrowUpRight weight="bold" className="w-5 h-5" />
               </a>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="aspect-square lg:aspect-auto p-4 md:p-8 bg-white">
               <div className="w-full h-full border-2 border-[#050505] relative overflow-hidden bg-black">
                 <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="grayscale contrast-150 opacity-70 mix-blend-screen" />
               </div>
            </ScrollReveal>
         </div>
      </section>
      )}

      {/* Footer */}
      <footer className="p-8 md:p-12 font-mono font-bold uppercase text-xs tracking-widest flex flex-col sm:flex-row justify-between items-center gap-6">
         <div>SYS. {new Date().getFullYear()} // {data.name}</div>
         <div className="flex gap-8">
           <a href="#" className="hover:text-[#E61919] transition-colors">PRIV</a>
           <a href="#" className="hover:text-[#E61919] transition-colors">TRMS</a>
         </div>
      </footer>
    </div>
  );
}
