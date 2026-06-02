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

  <!-- Value Props (Bento Grid) -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="py-32 px-4 bg-white">
    <div class="max-w-[1400px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Why people choose us</h2>
      <p class="text-zinc-400 text-lg mb-16 max-w-lg">Real reasons from real customers.</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${data.copy.value_props.slice(0, 3).map((prop, i) => {
          const parts = prop.split(':');
          const title = parts[0]?.trim() || prop;
          const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
          const isFeature = i === 0;
          return `
          <div class="p-10 rounded-[1.5rem] flex flex-col justify-between min-h-[320px] ${
            isFeature
              ? 'bg-zinc-900 text-white md:col-span-2 shadow-lg'
              : 'bg-[#FDFBF7] border border-zinc-200 text-zinc-900 md:col-span-1'
          }">
            <div>
              <div class="text-3xl mb-8 ${isFeature ? 'text-zinc-400' : 'text-zinc-200'}">${['✦', '◆', '●'][i] || '✦'}</div>
              <h3 class="${isFeature ? 'text-3xl md:text-4xl font-bold' : 'text-2xl font-bold'} tracking-tight mb-3">${escapeHtml(title)}</h3>
            </div>
            ${desc ? `<p class="${isFeature ? 'text-zinc-300 text-lg' : 'text-zinc-500 text-base'} leading-relaxed">${escapeHtml(desc)}</p>` : ''}
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- How It Works (Vertical Timeline) -->
  ${(data.copy?.how_it_works?.length ?? 0) > 0 ? `
  <section class="py-32 px-4 bg-[#FDFBF7]">
    <div class="max-w-[1000px] mx-auto">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tighter mb-20 text-center">How it works</h2>
      <div class="relative border-l-2 border-zinc-200 ml-4 md:ml-32 space-y-16 py-2">
        ${data.copy.how_it_works!.map((step, i) => `
          <div class="relative pl-8 md:pl-12">
            <div class="absolute -left-[25px] top-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-md">${i + 1}</div>
            <div class="pt-2">
              <p class="text-xl md:text-2xl font-bold text-zinc-900 leading-tight">${escapeHtml(step.replace(/^\d+\.\s*/, ''))}</p>
              <p class="text-zinc-500 mt-2 leading-relaxed text-sm md:text-base">We coordinate all the details to ensure a seamless experience from start to finish.</p>
            </div>
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .serif { font-family: 'Playfair Display', serif; }
  `,
  bodyClass: 'bg-[#FBFBFA] text-[#111111]',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero (Asymmetric Split Screen) -->
  <section class="pt-40 pb-24 px-6 max-w-6xl mx-auto relative">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      <div class="md:col-span-7 text-left">
        <span class="inline-block px-4 py-1.5 border border-[#EAEAEA] text-[#787774] text-xs uppercase tracking-[0.1em] rounded-full mb-8 font-medium">
          ${escapeHtml(data.types?.[0]?.replace(/_/g, ' ') || 'Establishment')}
        </span>
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.05] mb-8 serif">
          ${escapeHtml(data.copy?.hero_headline || data.name)}
        </h1>
        <p class="text-xl md:text-2xl text-[#787774] mb-8 leading-[1.4] serif italic">
          ${escapeHtml(data.copy?.subheadline || 'Located in ' + data.address)}
        </p>
        ${data.copy?.pull_quote ? `
        <p class="text-base text-[#999] serif italic border-l-2 border-zinc-200 pl-4 mb-8 max-w-md">"${escapeHtml(data.copy.pull_quote)}"</p>
        ` : ''}
        <div class="flex flex-wrap items-center gap-6 text-[#787774] text-xs uppercase tracking-widest font-mono font-semibold">
          <div>★ ${escapeHtml(data.rating)} / 5.0</div>
          <div class="w-1.5 h-1.5 rounded-full bg-[#D1D1D1]"></div>
          <div>${escapeHtml(data.reviewCount)} Reviews</div>
          <div class="w-1.5 h-1.5 rounded-full bg-[#D1D1D1]"></div>
          <div>✓ Verified</div>
        </div>
      </div>
      <div class="md:col-span-5 aspect-[3/4] border border-[#EAEAEA] bg-white p-2 shadow-sm">
        <img src="${escapeAttr(heroPhoto)}" class="w-full h-full object-cover grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-700" alt="${escapeAttr(data.name)}">
      </div>
    </div>
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

  <!-- Reviews (Negative Space Layout) -->
  ${data.originalReviews?.length > 0 ? `
  <section class="py-24 px-4 border-t border-[#EAEAEA] bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-normal serif mb-20 text-center">Selected Thoughts</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        ${data.originalReviews.map(review => `
        <div class="py-6 border-b border-[#EAEAEA]/60 last:border-b-0 flex flex-col justify-between h-full">
          <p class="text-[#111111] text-lg md:text-xl leading-relaxed mb-8 serif italic">"${escapeHtml(review.text)}"</p>
          <div class="flex items-center justify-between text-xs text-[#787774] uppercase tracking-widest font-mono">
            <span class="font-semibold">${escapeHtml(review.author)}</span>
            <span class="flex text-[#111111] tracking-[0.1em]">${'★'.repeat(Math.round(review.rating || 0))}${'☆'.repeat(5-Math.round(review.rating || 0))}</span>
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
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
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
      <img src="${escapeAttr(heroPhoto)}" class="w-full h-full object-cover grayscale contrast-[1.2]" alt="${escapeAttr(data.name)}">
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

  <!-- Value Props (Spreadsheet Monospace Table) -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="border-b-2 border-[#050505] bg-white font-mono">
    <div class="divide-y-2 divide-[#050505]">
      ${data.copy.value_props.slice(0, 3).map((prop, i) => {
        const parts = prop.split(':');
        const title = parts[0]?.trim() || prop;
        const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
        return `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 p-8 md:p-12 hover:bg-[#F4F4F0] items-center">
          <div class="md:col-span-2 text-2xl md:text-3xl font-black text-[#E61919] border-b-2 md:border-b-0 border-[#E61919]/20 pb-2 md:pb-0">0${i+1}.SYS</div>
          <div class="md:col-span-4 text-xl md:text-2xl font-black uppercase tracking-tight text-[#050505]">${escapeHtml(title)}</div>
          <div class="md:col-span-6 text-sm md:text-base font-bold text-[#555] uppercase leading-relaxed">${escapeHtml(desc)}</div>
        </div>
        `;
      }).join('')}
    </div>
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

  <!-- Testimonials Ticker Marquee -->
  <section class="bg-[#050505] text-[#F4F4F0] py-6 overflow-hidden border-b-2 border-[#050505] font-mono text-sm font-bold uppercase tracking-widest relative z-10">
    <div class="flex gap-12 animate-[scroll_30s_linear_infinite] w-max">
      <div class="flex gap-12 items-center">
        <span>✦ FIELD REPORTS ACTIVE</span>
        <span>✦ ${escapeHtml(data.reviewCount)} RECORDS SECURED</span>
        <span>✦ STATUS: VERIFIED</span>
        <span>✦ RATING: ${escapeHtml(data.rating)} / 5.0</span>
      </div>
      <div class="flex gap-12 items-center">
        <span>✦ FIELD REPORTS ACTIVE</span>
        <span>✦ ${escapeHtml(data.reviewCount)} RECORDS SECURED</span>
        <span>✦ STATUS: VERIFIED</span>
        <span>✦ RATING: ${escapeHtml(data.rating)} / 5.0</span>
      </div>
      <div class="flex gap-12 items-center">
        <span>✦ FIELD REPORTS ACTIVE</span>
        <span>✦ ${escapeHtml(data.reviewCount)} RECORDS SECURED</span>
        <span>✦ STATUS: VERIFIED</span>
        <span>✦ RATING: ${escapeHtml(data.rating)} / 5.0</span>
      </div>
      <div class="flex gap-12 items-center">
        <span>✦ FIELD REPORTS ACTIVE</span>
        <span>✦ ${escapeHtml(data.reviewCount)} RECORDS SECURED</span>
        <span>✦ STATUS: VERIFIED</span>
        <span>✦ RATING: ${escapeHtml(data.rating)} / 5.0</span>
      </div>
    </div>
  </section>

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

export const trustThemeAdapter: ThemeAdapter = {
  headCss: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .serif { font-family: 'Playfair Display', serif; }
  `,
  bodyClass: 'bg-[#FDFDFD] text-[#1E293B]',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero -->
  <section class="relative pt-36 pb-24 px-4 max-w-6xl mx-auto border-b border-zinc-200/50">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold tracking-wider uppercase rounded mb-6">
          ✓ Verified Professional Service
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6 serif">
          ${escapeHtml(data.copy?.hero_headline || data.name)}
        </h1>
        <p class="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
          ${escapeHtml(data.copy?.subheadline || 'Dedicated to providing professional services in the community.')}
        </p>
        <div class="flex flex-wrap gap-4 mb-8">
          <div class="flex items-center gap-1.5 text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded shadow-sm text-sm font-semibold">
            <span>★ ${escapeHtml(data.rating)} / 5.0 Rating</span>
            <span class="text-slate-400">(${escapeHtml(data.reviewCount)} Reviews)</span>
          </div>
        </div>
        <a href="${escapeAttr(data.phone ? waLink : '#contact')}" class="inline-block bg-[#0B192C] text-white px-8 py-4 hover:bg-slate-800 text-sm font-bold tracking-wide rounded">
          ${data.phone ? 'Contact Office' : 'Get In Touch'}
        </a>
      </div>
      <div class="lg:col-span-5 relative">
        <img src="${escapeAttr(heroPhoto)}" alt="${escapeAttr(data.name)}" class="w-full aspect-[4/3] object-cover border-4 border-slate-100 rounded shadow-xl">
      </div>
    </div>
  </section>

  <!-- Specialties -->
  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="py-12 px-4 max-w-6xl mx-auto border-b border-zinc-200/50">
    <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
      <span class="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] shrink-0">Specializations</span>
      <div class="flex flex-wrap gap-2.5">
        ${data.copy.specialties!.map(s => `<span class="px-4 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-medium rounded">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Value Props -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="py-24 px-4 max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 serif text-center">Our Commitment to Excellence</h2>
    <p class="text-slate-500 text-lg mb-16 text-center max-w-xl mx-auto">Standard-setting quality backed by consistent patient and client feedback.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${data.copy.value_props.slice(0, 3).map((prop, i) => {
        const parts = prop.split(':');
        const title = parts[0]?.trim() || prop;
        const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
        return `
        <div class="p-8 border border-slate-200 bg-white shadow-sm rounded">
          <div class="text-[#0B192C] font-bold text-2xl mb-6">0${i+1}</div>
          <h3 class="text-xl font-bold text-slate-950 mb-3 serif">${escapeHtml(title)}</h3>
          ${desc ? `<p class="text-slate-600 leading-relaxed text-sm">${escapeHtml(desc)}</p>` : ''}
        </div>
        `;
      }).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Gallery -->
  ${galleryPhotos.length > 0 ? `
  <section class="py-24 px-4 bg-slate-50 border-y border-slate-200/60">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-12 serif">Facility & Practice</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${galleryPhotos.slice(0, 4).map(photo => `
          <img src="${escapeAttr(photo)}" alt="" class="w-full aspect-square object-cover border border-slate-200/50 shadow-sm rounded">
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Reviews -->
  ${data.originalReviews?.length > 0 ? `
  <section class="py-24 px-4 max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-16 serif text-center">Patient & Client Reviews</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      ${data.originalReviews.map(review => `
      <div class="p-8 border border-slate-200 bg-white shadow-sm rounded">
        <div class="text-amber-500 mb-4">${'★'.repeat(review.rating)}</div>
        <p class="text-slate-800 leading-relaxed mb-6 italic">"${escapeHtml(review.text)}"</p>
        <div class="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-800">${escapeHtml(review.author)}</span>
          <span>Verified Patient</span>
        </div>
      </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- FAQs -->
  ${faqsToRender.length > 0 ? `
  <section class="py-24 px-4 bg-slate-50 border-y border-slate-200/60">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-12 serif text-center">Office Policy & FAQ</h2>
      <div class="bg-white border border-slate-200 px-8 py-4 shadow-sm rounded divide-y divide-slate-100">
        ${faqsToRender.map(faq => `
        <div class="py-5">
          <div class="font-semibold text-lg text-zinc-900">${escapeHtml(faq.q)}</div>
          <p class="text-zinc-600 mt-2">${escapeHtml(faq.a)}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Contact -->
  <section id="contact" class="py-24 px-4 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8 serif">Office Location</h2>
        <div class="space-y-6 mb-8 text-sm">
          <div>
            <span class="text-slate-400 font-bold block mb-1">OFFICE ADDRESS</span>
            <span class="text-slate-800 text-base">${escapeHtml(data.address)}</span>
            <a href="${escapeAttr(mapLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold block mt-2 font-bold">Get Directions</a>
          </div>
          ${data.hours?.length > 0 ? `
          <div>
            <span class="text-slate-400 font-bold block mb-2">OFFICE HOURS</span>
            <ul class="text-slate-600 space-y-1.5 text-base">
              ${data.hours.slice(0, 7).map(h => `<li class="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-slate-300"></div>${escapeHtml(h)}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="lg:col-span-7">
        <div class="border border-slate-200 shadow-md p-1 bg-white rounded aspect-[16/10] overflow-hidden">
          <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed" class="opacity-90"></iframe>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-16 text-slate-500 border-t border-slate-200/50 bg-white">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4 text-xs font-medium">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(data.name)}. Certified Professional Practice.</div>
      <div class="flex gap-8">
        <p>Built with <a href="https://maplink.dev" class="underline">MapLink</a></p>
      </div>
    </div>
  </footer>`;
  }
};

export const playfulThemeAdapter: ThemeAdapter = {
  headCss: `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800;900&display=swap');
    body { font-family: 'Outfit', sans-serif; }
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  `,
  bodyClass: 'bg-[#FFFBF0] text-[#432C12]',
  renderBody(data, { heroPhoto, galleryPhotos, faqsToRender, waLink, mapLink }) {
    return `  <!-- Hero -->
  <section class="relative pt-36 pb-24 px-4 max-w-5xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/60 text-orange-800 text-xs font-black tracking-widest uppercase rounded-full mb-8">
      Welcome to Our Space!
    </div>
    <h1 class="text-4xl md:text-7xl font-extrabold tracking-tight text-orange-950 leading-[1.05] mb-8 max-w-4xl mx-auto">
      ${escapeHtml(data.copy?.hero_headline || data.name)}
    </h1>
    <p class="text-lg md:text-2xl text-orange-900/80 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
      ${escapeHtml(data.copy?.subheadline || 'Fun and friendly local service in the neighborhood!')}
    </p>
    <div class="flex justify-center items-center flex-wrap gap-4 mb-12 text-sm">
      <div class="bg-white border-2 border-orange-100 px-5 py-3 rounded-full flex items-center gap-2 shadow-sm font-extrabold">
        <span>★ ${escapeHtml(data.rating)} / 5.0</span>
        <span class="text-orange-900/40 font-normal">(${escapeHtml(data.reviewCount)} Reviews)</span>
      </div>
    </div>
    <div class="flex justify-center mb-16">
      <a href="${escapeAttr(data.phone ? waLink : '#contact')}" class="inline-flex items-center gap-3 bg-orange-600 text-white font-extrabold px-10 py-5 hover:bg-orange-700 text-base rounded-full shadow-lg">
        ${data.phone ? "Let's Connect!" : "Come Visit!"}
      </a>
    </div>
    <img src="${escapeAttr(heroPhoto)}" class="max-w-4xl mx-auto rounded-3xl border-4 border-white shadow-2xl overflow-hidden aspect-[16/9] object-cover" alt="">
  </section>

  <!-- Specialties -->
  ${(data.copy?.specialties?.length ?? 0) > 0 ? `
  <section class="py-12 px-4 bg-orange-50/50 border-y-2 border-orange-100">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
      <span class="text-orange-950/50 text-xs font-black uppercase tracking-[0.2em]">What we do best</span>
      <div class="flex flex-wrap justify-center gap-2">
        ${data.copy.specialties!.map(s => `<span class="px-5 py-2.5 bg-white border border-orange-100 text-orange-900 text-sm font-extrabold rounded-full shadow-sm">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Value Props -->
  ${(data.copy?.value_props?.length ?? 0) > 0 ? `
  <section class="py-24 px-4 max-w-5xl mx-auto">
    <h2 class="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-4 text-center">Why You'll Love Us!</h2>
    <p class="text-orange-900/60 text-lg mb-16 text-center max-w-xl mx-auto font-medium">Here are the top reasons families and friends keep coming back.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${data.copy.value_props.slice(0, 3).map((prop, i) => {
        const parts = prop.split(':');
        const title = parts[0]?.trim() || prop;
        const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
        return `
        <div class="p-8 bg-white border-2 border-orange-50 rounded-[2rem] shadow-sm text-center">
          <div class="text-4xl mb-6">${['🌟', '🎈', '🍭'][i] || '✨'}</div>
          <h3 class="text-xl font-black text-orange-950 mb-3">${escapeHtml(title)}</h3>
          ${desc ? `<p class="text-orange-900/70 leading-relaxed text-sm font-medium">${escapeHtml(desc)}</p>` : ''}
        </div>
        `;
      }).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Gallery -->
  ${galleryPhotos.length > 0 ? `
  <section class="py-24 px-4 bg-orange-100/30 border-y-2 border-orange-100">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-12 text-center">Peek Inside!</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${galleryPhotos.slice(0, 4).map(photo => `
          <img src="${escapeAttr(photo)}" alt="" class="w-full aspect-square object-cover border-4 border-white shadow-md rounded-2xl">
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Reviews -->
  ${data.originalReviews?.length > 0 ? `
  <section class="py-24 px-4 max-w-5xl mx-auto">
    <h2 class="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-16 text-center">Happy Faces!</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      ${data.originalReviews.map(review => `
      <div class="p-8 bg-white border-2 border-orange-50 rounded-[2rem] shadow-sm relative">
        <div class="text-amber-400 mb-4">${'★'.repeat(review.rating)}</div>
        <p class="text-orange-950 leading-relaxed mb-6 font-medium italic">"${escapeHtml(review.text)}"</p>
        <div class="border-t border-orange-50 pt-4 flex items-center justify-between text-xs font-black text-orange-900/60 uppercase tracking-wider">
          <span>${escapeHtml(review.author)}</span>
        </div>
      </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- FAQs -->
  ${faqsToRender.length > 0 ? `
  <section class="py-24 px-4 bg-orange-100/30 border-y-2 border-orange-100">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-12 text-center">Frequently Asked Questions</h2>
      <div class="space-y-4">
        ${faqsToRender.map(faq => `
        <div class="border border-orange-100 bg-white/70 rounded-2xl p-4 shadow-sm">
          <div class="font-bold text-lg text-orange-950">${escapeHtml(faq.q)}</div>
          <p class="text-orange-900/80 mt-2">${escapeHtml(faq.a)}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Contact -->
  <section id="contact" class="py-24 px-4 max-w-5xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5">
        <h2 class="text-3xl md:text-5xl font-black tracking-tight text-orange-950 mb-8">Where to Find Us!</h2>
        <div class="space-y-6 mb-8 text-sm">
          <div>
            <span class="text-orange-950/40 font-black block mb-2 tracking-widest uppercase">ADDRESS</span>
            <span class="text-orange-950 text-lg font-bold">${escapeHtml(data.address)}</span>
            <a href="${escapeAttr(mapLink)}" target="_blank" rel="noopener noreferrer" class="text-orange-600 font-extrabold block mt-2 font-bold">Get Directions</a>
          </div>
          ${data.hours?.length > 0 ? `
          <div>
            <span class="text-orange-950/40 font-black block mb-3 tracking-widest uppercase">OPEN HOURS</span>
            <ul class="text-orange-900/80 space-y-1.5 text-base font-medium">
              ${data.hours.slice(0, 7).map(h => `<li class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>${escapeHtml(h)}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="lg:col-span-7">
        <div class="border-4 border-white shadow-xl bg-white rounded-3xl aspect-[16/10] overflow-hidden">
          <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed" class="opacity-90"></iframe>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-16 text-orange-900/60 border-t-2 border-orange-100 bg-white">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4 text-xs font-extrabold tracking-wider uppercase">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(data.name)}. All Smiles!</div>
      <div class="flex gap-8">
        <p>Built with <a href="https://maplink.dev" class="underline">MapLink</a></p>
      </div>
    </div>
  </footer>`;
  }
};
