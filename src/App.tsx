import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, MapPin, Clock, Star, Phone, CheckCircle, ExternalLink, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
// @ts-expect-error no default export in types

// ==========================================
// TYPES
// ==========================================
type StatusMessage = {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

type GeneratedSiteData = {
  placeId: string;
  name: string;
  types: string[];
  address: string;
  rating: number;
  reviewCount: number;
  hours: string[];
  website: string;
  photos: string[];
  copy: {
    hero_headline: string;
    subheadline: string;
    value_props: string[];
    faqs: { q: string; a: string }[];
    testimonials: string[];
  };
};

export default function App() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const [siteData, setSiteData] = useState<GeneratedSiteData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsGenerating(true);
    setSiteData(null);
    setMessages([]);

    const eventSource = new EventSource(`/api/generate?url=${encodeURIComponent(url)}`);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const text = parsed.message;
        
        if (text === 'Done!') {
          eventSource.close();
          setIsGenerating(false);
          setSiteData(parsed.data);
          return;
        }

        if (text === 'Error') {
          eventSource.close();
          setIsGenerating(false);
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text: `Error: ${parsed.data}`, status: 'error' }
          ]);
          return;
        }

        setMessages((prev) => {
          // Mark previous as done
          const newArr = prev.map(m => m.status === 'active' ? { ...m, status: 'done' as const } : m);
          // Add new as active
          newArr.push({ id: Date.now().toString(), text, status: 'active' });
          return newArr;
        });

      } catch (err) {
        console.error("Parse error", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        { id: 'err', text: 'Connection lost or error occurred.', status: 'error' }
      ]);
    };
  };

  if (siteData) {
    return <SitePreview data={siteData} onBack={() => setSiteData(null)} />;
  }

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#fafafa] text-zinc-950 font-sans selection:bg-black selection:text-white px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[100px] bg-emerald-100/30 opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[120px] bg-blue-100/30 opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 100 }}
        className="w-full max-w-2xl translate-y-[-10vh] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/60 backdrop-blur-md border border-zinc-200/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-xs font-mono tracking-wide text-zinc-500"
          >
            <MapPin className="w-3 h-3 text-emerald-500" />
            AI STUDIO BUILD DEMO
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-zinc-900 leading-[1.1]">
            Turn Google Maps into a website.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-lg mx-auto">
            Paste any maps link. We'll analyze reviews, extract value props, and build a beautiful landing page in 10 seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative w-full group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl blur-lg opacity-40 transition group-hover:opacity-60 duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-zinc-200/50 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-2 flex items-center overflow-hidden transition-all focus-within:border-zinc-300 focus-within:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
            <div className="pl-4 pr-3 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isGenerating}
              placeholder="https://maps.app.goo.gl/..."
              className="flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-zinc-400 disabled:opacity-50 min-w-0"
              required
            />
            <button
              type="submit"
              disabled={isGenerating || !url}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium transition-transform hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shrink-0 select-none overflow-hidden relative"
            >
              <AnimatePresence mode="popLayout">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Building...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                  >
                    Generate Site
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </form>

        {/* Progress Display */}
        <div className="mt-8 relative h-[200px]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: msg.status === 'active' || msg.status === 'error' ? 1 : 0.4, x: 0 }}
                exit={{ opacity: 0 }}
                layout
                className={`flex items-center gap-3 py-2 ${msg.status === 'error' ? 'text-red-500' : 'text-zinc-600'}`}
              >
                {msg.status === 'active' && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
                {msg.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {msg.status === 'error' && <CheckCircle className="w-4 h-4 text-red-500" />}
                <span className="font-mono text-sm">{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </motion.div>
    </main>
  );
}

// ==========================================
// GENERATED SITE PREVIEW
// ==========================================

function SitePreview({ data, onBack }: { data: GeneratedSiteData, onBack: () => void }) {
  const [brandColor, setBrandColor] = useState('10, 10, 10'); // RGB string
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Extract color
    const extractColor = () => {
      if (imgRef.current && imgRef.current.complete && data.photos.length > 0) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
             canvas.width = imgRef.current.width;
             canvas.height = imgRef.current.height;
             ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
             const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
             let r = 0, g = 0, b = 0, count = 0;
             for (let i = 0; i < data.length; i += 16) {
                 r += data[i];
                 g += data[i + 1];
                 b += data[i + 2];
                 count++;
             }
             r = Math.floor(r / count);
             g = Math.floor(g / count);
             b = Math.floor(b / count);
             setBrandColor(`${r}, ${g}, ${b}`);
          }
        } catch (e) {
          console.error("ColorThief failed", e);
        }
      }
    };
    
    // We add CORS mapping or just load the image to canvas if allowed.
    // Note: Places API media might have CORS blocks if not careful, 
    // but crossOrigin="anonymous" might work.
    
    if (imgRef.current) {
        if (imgRef.current.complete) {
            extractColor();
        } else {
            imgRef.current.addEventListener('load', extractColor);
        }
    }
  }, [data.photos]);

  const heroPhoto = data.photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';

  return (
    <div 
      className="min-h-screen bg-white transition-colors duration-1000 ease-in-out font-sans"
      style={{ '--brand': brandColor } as React.CSSProperties}
    >
      {/* Dev Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-4 text-sm font-mono whitespace-nowrap">
        <span>Preview Mode</span>
        <button onClick={onBack} className="text-white/60 hover:text-white transition">Exit</button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
        {/* Extracted Brand Color Bloom */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div 
                className="absolute -top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-20 transition-all duration-1000 ease-out" 
                style={{ backgroundColor: `rgb(var(--brand))` }} 
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 100 }}
          >
            <div 
              className="inline-block px-3 py-1 mb-6 rounded-full text-sm font-medium border border-black/10 backdrop-blur-sm"
              style={{ color: 'rgb(var(--brand))', backgroundColor: 'rgba(var(--brand), 0.05)' }}
            >
              {data.types?.[0]?.replace(/_/g, ' ') || 'Local Business'}
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-zinc-900 mb-6">
              {data.copy?.hero_headline || data.name}
            </h1>
            <p className="text-xl text-zinc-500 mb-10 leading-relaxed max-w-lg">
              {data.copy?.subheadline || `The best ${data.types?.[0]?.replace(/_/g, ' ')} located in ${data.address}`}
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
               <button 
                  className="px-8 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 hover:scale-[0.98] transition-all shadow-lg overflow-hidden relative group"
                  style={{ backgroundColor: 'rgb(var(--brand))', boxShadow: '0 8px 30px -10px rgba(var(--brand), 0.5)' }}
               >
                 <span className="relative z-10 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> Let's Talk
                 </span>
                 <div className="absolute inset-0 bg-black/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
               </button>
               {data.website && (
                 <a href={data.website} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 text-zinc-600 hover:text-black border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all">
                    Visit Official Site <ExternalLink className="w-4 h-4" />
                 </a>
               )}
            </div>
          </motion.div>

          {/* Image Glass Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 30 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-2xl border border-zinc-200/40 transform -rotate-2 hover:rotate-0 transition-all duration-500">
               <img 
                 ref={imgRef}
                 src={heroPhoto} 
                 crossOrigin="anonymous"
                 alt={data.name} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
            </div>
            
            {/* Floating Rating Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white flex gap-4 items-center"
            >
               <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
               </div>
               <div>
                 <div className="text-2xl font-bold tracking-tight">{data.rating}</div>
                 <div className="text-sm font-medium text-zinc-500">Google Reviews</div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-zinc-50">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.copy?.value_props?.slice(0,3).map((prop, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100"
               >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'rgba(var(--brand), 0.1)', color: 'rgb(var(--brand))' }}
                  >
                     <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{prop.split(':')[0] || prop}</h3>
                  {prop.includes(':') && (
                     <p className="text-zinc-500 leading-relaxed">{prop.split(':')[1]}</p>
                  )}
               </motion.div>
            ))}
         </div>
      </section>

      {/* Details (Map / Address) */}
      <section className="py-24">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
                <h2 className="text-4xl font-bold tracking-tighter mb-8">Location & Hours</h2>
                <div className="space-y-6">
                   <div className="flex gap-4 items-start">
                      <div className="p-3 rounded-full bg-zinc-100 text-zinc-600 mt-1">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-semibold text-lg mb-1">Address</h4>
                         <p className="text-zinc-500 leading-relaxed max-w-xs">{data.address}</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="p-3 rounded-full bg-zinc-100 text-zinc-600 mt-1">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-semibold text-lg mb-1">Opening Hours</h4>
                         <ul className="text-zinc-500 space-y-1 mt-3">
                            {data.hours?.map((h, i) => (
                               <li key={i} className="text-sm border-b border-zinc-100 pb-1">{h}</li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
             </motion.div>
             <div className="aspect-square bg-zinc-100 rounded-3xl relative overflow-hidden border border-zinc-200 shadow-inner p-2 flex items-center justify-center flex-col text-zinc-400">
                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                <p>Map embed requires GMaps JS API key.</p>
                <p className="text-sm">Location: {data.name}</p>
                {/* Normally we'd use Google Maps Embed API here */}
             </div>
         </div>
      </section>

      {/* Testimonials */}
      {(data.copy?.testimonials?.length ?? 0) > 0 && (
         <section className="py-24 bg-black text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(var(--brand),0.8)_0%,transparent_70%)]" />
             <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-8" />
                <h2 className="text-4xl font-semibold tracking-tighter mb-16">What people are saying</h2>
                <div className="grid gap-12">
                   {data.copy?.testimonials?.slice(0,2).map((t, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={i} 
                        className="text-2xl md:text-3xl font-medium leading-tight text-zinc-300"
                      >
                         "{t}"
                      </motion.div>
                   ))}
                </div>
             </div>
         </section>
      )}

      {/* FAQ */}
      {(data.copy?.faqs?.length ?? 0) > 0 && (
         <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                   {data.copy?.faqs?.map((faq, i) => (
                      <details key={i} className="group bg-zinc-50 rounded-2xl border border-zinc-100 p-6 cursor-pointer open:bg-white open:ring-1 open:ring-black/5 open:shadow-lg transition-all">
                         <summary className="font-semibold text-lg list-none flex justify-between items-center outline-none">
                            {faq.q}
                            <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform" />
                         </summary>
                         <p className="mt-4 text-zinc-500 leading-relaxed">{faq.a}</p>
                      </details>
                   ))}
                </div>
            </div>
         </section>
      )}
    </div>
  );
}
