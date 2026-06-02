import type { GeneratedSiteData } from '../types';
import { escapeHtml, escapeAttr, getExportableImageUrl } from './exportHtml';
import { getWaLink, resolveFaqs } from './archetypeUtils';

export interface ThemeAdapter {
  headCss: string;
  bodyClass: string;
  renderBody(
    data: GeneratedSiteData,
    helpers: {
      heroPhoto: string;
      galleryPhotos: string[];
      faqsToRender: { q: string; a: string }[];
      waLink: string;
      mapLink: string;
    }
  ): string;
}

export function buildHtml(data: GeneratedSiteData, theme: ThemeAdapter): string {
  const heroPhoto = getExportableImageUrl(data.photos[0]) || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  const galleryPhotos = data.photos.slice(1, 7).map(getExportableImageUrl).filter(Boolean);
  const faqsToRender = resolveFaqs(data.copy);
  const waLink = getWaLink(data.phone, `Hi ${data.name}, I found you on Google.`);
  const mapLink = `https://maps.google.com/?q=${encodeURIComponent(data.address)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.name)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${theme.headCss}
  </style>
</head>
<body class="${theme.bodyClass}">
  ${theme.renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink })}
</body>
</html>`;
}

export const structuralThemeAdapter: ThemeAdapter = {
  headCss: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .reviews-scroll:hover { animation-play-state: paused; }
  `,
  bodyClass: 'bg-[#FDFBF7] text-zinc-900',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero -->
  <section class="min-h-screen pt-24 pb-24 px-4 md:px-8 flex flex-col justify-center max-w-[1400px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      <div class="lg:col-span-6">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-zinc-900 mb-6">
          ${escapeHtml(data.copy?.hero_headline || data.name)}
        </h1>
        <p class="text-xl md:text-2xl text-zinc-500 mb-8 leading-relaxed max-w-xl">
          ${escapeHtml(data.copy?.subheadline || 'Premium service located in ' + data.address)}
        </p>
        <div class="flex flex-wrap items-center gap-4 mb-10">
          <div class="bg-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-2">
            <span class="text-amber-500">★</span>
            <span class="font-bold text-sm">${escapeHtml(data.rating)} / 5.0</span>
            <span class="text-zinc-500 text-sm">(${escapeHtml(data.reviewCount)} Reviews)</span>
          </div>
          <div class="bg-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-2">
            <span class="text-blue-600">✓</span>
            <span class="font-semibold text-sm">Verified</span>
          </div>
        </div>
        <a href="#contact" class="inline-block bg-zinc-950 text-white px-8 py-4 rounded-full font-bold text-sm">Get in Touch →</a>
      </div>
      <div class="lg:col-span-6">
        <img src="${escapeAttr(heroPhoto)}" alt="${escapeAttr(data.name)}" class="w-full aspect-[4/3] lg:aspect-square object-cover rounded-2xl shadow-xl">
      </div>
    </div>
  </section>

  <!-- Specialties -->
  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="py-10 bg-zinc-950">
    <div class="max-w-[1400px] mx-auto px-4">
      <div class="flex flex-wrap items-center gap-8">
        <span class="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">What we're known for</span>
        <div class="flex flex-wrap gap-3">
          ${data.copy.specialties!.map(s => `<span class="px-6 py-3 rounded-full border border-zinc-700 text-white text-sm">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Value Props -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="py-32 px-4 bg-white">
    <div class="max-w-[1400px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Why people choose us</h2>
      <p class="text-zinc-400 text-lg mb-16 max-w-lg">Real reasons from real customers.</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${data.copy?.value_props?.slice(0, 3).map((prop, i) => {
          const parts = prop.split(':');
          const title = parts[0]?.trim() || prop;
          const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
          return `
          <div class="p-10 bg-[#FDFBF7] border border-zinc-200 rounded-2xl">
            <div class="text-3xl mb-8 text-zinc-200">${['✦', '◆', '●'][i] || '✦'}</div>
            <h3 class="text-2xl font-bold mb-3">${escapeHtml(title)}</h3>
            ${desc ? `<p class="text-zinc-500">${escapeHtml(desc)}</p>` : ''}
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- How It Works -->
  ${(data.copy?.how_it_works?.length ?? 0) > 0 ? `
  <section class="py-24 px-4 bg-[#FDFBF7]">
    <div class="max-w-[1400px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-12">How it works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${data.copy.how_it_works!.map((step, i) => `
          <div class="p-8 bg-white border border-zinc-200 rounded-2xl">
            <div class="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold mb-6">${i + 1}</div>
            <p class="text-xl font-semibold text-zinc-800">${escapeHtml(step.replace(/^\d+\.\s*/, ''))}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Gallery -->
  ${galleryPhotos.length > 0 ? `
  <section class="py-24 px-4 bg-zinc-50">
    <div class="max-w-[1400px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-12">Gallery</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${galleryPhotos.slice(0, 4).map(photo => `
          <img src="${escapeAttr(photo)}" class="w-full aspect-square object-cover rounded-xl" alt="">
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Reviews -->
  ${data.originalReviews?.length > 0 ? `
  <section class="py-24 px-4 bg-[#FDFBF7]">
    <div class="max-w-[1400px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-12">What people say</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${data.originalReviews.map(review => `
          <div class="bg-white border border-zinc-200 rounded-2xl p-8">
            <div class="text-amber-500 mb-4">${'★'.repeat(Math.round(review.rating || 0))}</div>
            <p class="text-zinc-800 leading-relaxed mb-6">"${escapeHtml(review.text)}"</p>
            <div class="font-semibold text-sm text-zinc-900">${escapeHtml(review.author)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- FAQs -->
  <section class="py-24 px-4 bg-white">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-12">Frequently asked questions</h2>
      <div class="space-y-0">
        ${faqsToRender.map(faq => `
          <div class="border-b border-zinc-200 py-6">
            <div class="font-semibold text-lg">${escapeHtml(faq.q)}</div>
            <p class="text-zinc-500 mt-2">${escapeHtml(faq.a)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Contact -->
  <section id="contact" class="py-24 px-4 bg-zinc-950 text-white">
    <div class="max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Get in touch</h2>
          <p class="text-zinc-400 text-lg mb-8">We'd love to hear from you.</p>
          ${data.phone ? `
           <a href="${escapeAttr(waLink)}" class="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold mb-4">
            <span>WhatsApp</span> <span>→</span>
          </a>
          <br>
          ` : ''}
          <a href="${escapeAttr(mapLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-zinc-400 hover:text-white">
            <span>📍</span> <span>${escapeHtml(data.address)}</span>
          </a>
        </div>
        <div>
          ${data.hours?.length > 0 ? `
          <div class="bg-zinc-900 rounded-2xl p-8">
            <h3 class="font-bold text-lg mb-4">Hours</h3>
            <div class="space-y-2 text-zinc-400">
              ${data.hours.map(h => `<div>${escapeHtml(h)}</div>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 px-4 bg-zinc-950 text-zinc-500 text-sm text-center">
    <p>Built with <a href="https://maplink.dev" class="underline">MapLink</a></p>
  </footer>`;
  }
};

export const minimalistThemeAdapter: ThemeAdapter = {
  headCss: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .serif { font-family: 'Playfair Display', serif; }
  `,
  bodyClass: 'bg-[#FBFBFA] text-[#111111]',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero -->
  <section class="pt-40 pb-24 px-4 max-w-5xl mx-auto text-center">
    <span class="inline-block px-4 py-1.5 border border-[#EAEAEA] text-[#787774] text-xs uppercase tracking-[0.1em] rounded-full mb-10">
      ${escapeHtml(data.types?.[0]?.replace(/_/g, ' ') || 'Establishment')}
    </span>
    <h1 class="text-6xl md:text-[6.5rem] font-normal tracking-tight leading-[0.95] mb-10 serif">
      ${escapeHtml(data.copy?.hero_headline || data.name)}
    </h1>
    <p class="text-2xl text-[#787774] mb-8 leading-relaxed max-w-2xl mx-auto serif italic">
      ${escapeHtml(data.copy?.subheadline || 'Located in ' + data.address)}
    </p>
    ${data.copy?.pull_quote ? `
    <p class="text-lg text-[#999] serif italic mb-10 max-w-xl mx-auto">"${escapeHtml(data.copy.pull_quote)}"</p>
    ` : ''}
    <div class="flex justify-center items-center gap-6 mb-16 text-[#787774] text-sm tracking-wide">
      <div>★ ${escapeHtml(data.rating)} Rating</div>
      <div class="w-1 h-1 rounded-full bg-[#D1D1D1]"></div>
      <div>${escapeHtml(data.reviewCount)} Reviews</div>
      <div class="w-1 h-1 rounded-full bg-[#D1D1D1]"></div>
      <div>✓ Verified</div>
    </div>
    <img src="${escapeAttr(heroPhoto)}" class="w-full aspect-[16/9] md:aspect-[21/9] object-cover grayscale opacity-90" alt="${escapeAttr(data.name)}">
  </section>

  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="py-12 px-4 border-t border-[#EAEAEA]">
    <div class="max-w-5xl mx-auto text-center">
      <span class="text-[#787774] text-xs uppercase tracking-[0.15em] mr-4">Known for</span>
      ${data.copy.specialties!.map(s => `
      <span class="inline-block px-4 py-2 bg-[#F5F5F5] text-[#111] text-sm mr-2 mb-2">${escapeHtml(s)}</span>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="py-24 px-4">
    <div class="max-w-4xl mx-auto">
      ${data.copy.value_props!.slice(0, 3).map((prop, i) => `
      <div class="py-12 border-b border-[#EAEAEA]">
        <h3 class="text-2xl font-normal serif mb-4">${escapeHtml(prop)}</h3>
      </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <section class="py-24 px-4 max-w-3xl mx-auto">
    <h2 class="text-3xl font-normal serif mb-12 text-center">Questions</h2>
    ${faqsToRender.map(faq => `
    <div class="border-b border-[#EAEAEA] py-7">
      <div class="font-normal text-xl serif">${escapeHtml(faq.q)}</div>
      <p class="text-[#787774] mt-2 serif">${escapeHtml(faq.a)}</p>
    </div>
    `).join('')}
  </section>

  ${galleryPhotos.length > 0 ? `
  <section class="py-24 px-4 border-t border-[#EAEAEA]">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-normal serif mb-12 text-center">Moments</h2>
      <div class="columns-2 md:columns-3 gap-4 space-y-4">
        ${galleryPhotos.map(photo => `<img src="${escapeAttr(photo)}" alt="" class="w-full object-cover grayscale opacity-85 mb-4">`).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${data.originalReviews?.length > 0 ? `
  <section class="py-24 px-4 border-t border-[#EAEAEA] bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-normal serif mb-12 text-center">Selected Thoughts</h2>
      <div class="columns-1 md:columns-2 gap-8 space-y-8">
        ${data.originalReviews.map(review => `
        <div class="break-inside-avoid border border-[#EAEAEA] p-10 bg-[#FBFBFA] mb-8">
          <p class="text-[#111111] text-xl leading-relaxed mb-8 serif">"${escapeHtml(review.text)}"</p>
          <div class="flex items-center justify-between text-sm text-[#787774] uppercase tracking-widest">
            <span>${escapeHtml(review.author)}</span>
            <span>${'★'.repeat(Math.round(review.rating || 0))}</span>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <section id="contact" class="py-24 px-4 bg-[#111] text-white text-center">
    <h2 class="text-4xl font-normal serif mb-8">Get in touch</h2>
    ${data.hours?.length > 0 ? `
    <div class="text-zinc-400 mb-8 space-y-1">
      ${data.hours.slice(0, 7).map(h => `<div>${escapeHtml(h)}</div>`).join('')}
    </div>
    ` : ''}
    ${data.phone ? `
    <a href="${escapeAttr(waLink)}" class="inline-block px-8 py-4 border border-white rounded-full mb-8">WhatsApp</a>
    <br>
    ` : ''}
    <a href="${escapeAttr(mapLink)}" target="_blank" rel="noopener noreferrer" class="text-zinc-400">${escapeHtml(data.address)}</a>
  </section>

  <footer class="py-8 px-4 text-center text-[#999] text-sm">
    <p>Built with <a href="https://maplink.dev" class="underline">MapLink</a></p>
  </footer>`;
  }
};

export const brutalistThemeAdapter: ThemeAdapter = {
  headCss: `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Space Grotesk', sans-serif; }
  `,
  bodyClass: 'bg-[#F4F4F0] text-[#050505] pb-24',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero -->
  <header class="pt-24 px-4 md:px-8 border-b-2 border-[#050505] pb-12">
    <div class="flex flex-col justify-between items-end gap-12 uppercase">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
        <div class="text-[#E61919] font-black tracking-widest text-sm flex items-center gap-3">
          <span class="w-4 h-4 bg-[#E61919] inline-block"></span>
          ${escapeHtml(data.types?.[0]?.replace(/_/g, ' ') || 'FACILITY')}
        </div>
        <div class="text-left sm:text-right text-xs text-[#555] font-mono font-bold tracking-widest">
          <div>ID NO. ${escapeHtml(data.placeId.slice(0, 8).toUpperCase())}</div>
          <div>SYS.ACTIVE</div>
        </div>
      </div>
      <h1 class="text-6xl md:text-[9rem] lg:text-[11rem] font-black leading-[0.8] tracking-tighter uppercase break-words w-full">
        ${escapeHtml(data.name)}
      </h1>
    </div>
  </header>

  <!-- Headline + Photo -->
  <section class="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-[#050505]">
    <div class="lg:col-span-5 p-8 md:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-[#050505]">
      <h2 class="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-8">
        ${escapeHtml(data.copy?.hero_headline || 'BUILT FOR RESULTS')}
      </h2>
      <p class="text-xl text-[#333] font-bold leading-relaxed max-w-sm uppercase">
        ${escapeHtml(data.copy?.subheadline || 'Premium facility located in ' + data.address)}
      </p>
      <div class="flex items-center gap-4 mt-8">
        <a href="#contact" class="bg-[#050505] text-white px-6 py-3 font-black uppercase tracking-wider text-sm">GET IN TOUCH</a>
        <span class="text-xs font-mono">★ ${escapeHtml(data.rating)} / 5.0 (${escapeHtml(data.reviewCount)})</span>
      </div>
    </div>
    <div class="lg:col-span-7">
      <img src="${escapeAttr(heroPhoto)}" class="w-full h-full object-cover" alt="${escapeAttr(data.name)}">
    </div>
  </section>

  <!-- Specialties -->
  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="border-b-2 border-[#050505]">
    <div class="px-4 py-3 bg-[#050505] text-white font-mono text-xs font-bold tracking-widest">SPECIALTIES</div>
    <div class="p-8 flex flex-wrap gap-3">
      ${data.copy.specialties!.map(s => `
      <span class="border-2 border-[#050505] px-4 py-2 font-black uppercase text-sm">${escapeHtml(s)}</span>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Value Props -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="grid grid-cols-1 md:grid-cols-3 border-b-2 border-[#050505]">
    ${data.copy.value_props!.slice(0, 3).map((prop, i) => `
    <div class="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#050505] ${i === 2 ? 'border-r-0' : ''}">
      <div class="text-4xl font-black text-[#E61919] mb-4">0${i + 1}</div>
      <div class="font-bold uppercase text-sm">${escapeHtml(prop)}</div>
    </div>
    `).join('')}
  </section>
  ` : ''}

  <!-- FAQs -->
  <section class="py-16 px-4 max-w-3xl mx-auto">
    <div class="font-mono text-xs font-bold tracking-widest mb-8">Q&A</div>
    ${faqsToRender.map(faq => `
    <div class="border-b-2 border-[#050505] py-6">
      <div class="font-bold uppercase text-sm mb-2">${escapeHtml(faq.q)}</div>
      <p class="text-zinc-600 text-sm">${escapeHtml(faq.a)}</p>
    </div>
    `).join('')}
  </section>

  ${galleryPhotos.length > 0 ? `
  <section class="border-y-2 border-[#050505]">
    <div class="grid grid-cols-2 md:grid-cols-3 divide-x-2 divide-[#050505]">
      ${galleryPhotos.slice(0, 6).map(photo => `<img src="${escapeAttr(photo)}" alt="" class="w-full aspect-square object-cover grayscale contrast-[1.2] border-b-2 border-[#050505]">`).join('')}
    </div>
  </section>
  ` : ''}

  ${data.originalReviews?.length > 0 ? `
  <section class="border-b-2 border-[#050505] bg-white p-8 md:p-16">
    <h2 class="text-5xl font-black uppercase mb-12">FIELD REPORTS</h2>
    <div class="divide-y-2 divide-[#050505]">
      ${data.originalReviews.map(review => `
      <div class="py-10 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-2 font-mono font-black text-sm uppercase tracking-widest text-[#E61919]">
          <div>${'★'.repeat(Math.round(review.rating || 0))}</div>
          <div class="text-[#050505] break-all">${escapeHtml(review.author)}</div>
        </div>
        <p class="md:col-span-10 text-xl font-bold leading-relaxed text-[#333] uppercase">"${escapeHtml(review.text)}"</p>
      </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Contact -->
  <section id="contact" class="border-t-2 border-[#050505] p-8 md:p-16">
    <h2 class="text-6xl font-black uppercase mb-8">GET IN TOUCH</h2>
    ${data.hours?.length > 0 ? `
    <div class="font-mono uppercase font-bold text-sm tracking-widest mb-8 space-y-1">
      ${data.hours.slice(0, 7).map(h => `<div>${escapeHtml(h)}</div>`).join('')}
    </div>
    ` : ''}
    ${data.phone ? `
    <a href="${escapeAttr(waLink)}" class="inline-block bg-[#25D366] text-white px-8 py-4 font-bold uppercase">WHATSAPP →</a>
    <br><br>
    ` : ''}
    <a href="${escapeAttr(mapLink)}" target="_blank" rel="noopener noreferrer" class="font-mono text-sm">${escapeHtml(data.address)}</a>
  </section>

  <footer class="py-8 px-4 text-center font-mono text-xs">
    <p>BUILT WITH <a href="https://maplink.dev" class="underline">MAPLINK</a></p>
  </footer>`;
  }
};
