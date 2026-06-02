import React, { useState, useEffect } from 'react';
import { useHistory } from './hooks/useHistory';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MagnifyingGlass, 
  MapPin, 
  ArrowRight,
  Clock,
  ArrowUpRight,
  Star
} from '@phosphor-icons/react';

// Archetypes Registry
import { ARCHETYPES_REGISTRY, resolveArchetype } from './lib/archetypeRegistry';

// Components
import { CinematicLoader } from './components/ui/CinematicLoader';
import { PremiumCard } from './components/ui/PremiumCard';

// Types — canonical definitions live in ./types; re-exported here for
// backwards compatibility with any existing import { X } from './App' callers.
export type { StatusMessage, Review, GeneratedSiteData, Archetype } from './types';
import type { StatusMessage, GeneratedSiteData, Archetype } from './types';


export default function App() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const [siteData, setSiteData] = useState<GeneratedSiteData | null>(null);
  
  // History Hook
  const { history, saveToHistory } = useHistory();

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
          // Delay just a bit to let the user see "Done"
          setTimeout(() => {
            setIsGenerating(false);
            setSiteData(parsed.data);
            saveToHistory(parsed.data);
          }, 800);
          return;
        }

        if (text === 'Error') {
          eventSource.close();
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text: `Error: ${parsed.data}`, status: 'error' }
          ]);
          // We will let the user see the error in the loader
          setTimeout(() => setIsGenerating(false), 3000);
          return;
        }

        setMessages((prev) => {
          const newArr = prev.map(m => m.status === 'active' ? { ...m, status: 'done' as const } : m);
          newArr.push({ id: Date.now().toString(), text, status: 'active' });
          return newArr;
        });

      } catch (err) {
        console.error("Parse error", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setMessages((prev) => [
        ...prev,
        { id: 'err', text: 'Connection lost or error occurred.', status: 'error' }
      ]);
      setTimeout(() => setIsGenerating(false), 3000);
    };
  };

  if (siteData) {
    return <SitePreviewRouter data={siteData} onBack={() => setSiteData(null)} />;
  }

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center pt-24 pb-32 bg-[#FDFBF7] text-zinc-950 px-4 relative overflow-hidden">
      <AnimatePresence>
        {isGenerating && <CinematicLoader messages={messages} />}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] bg-zinc-200/50 opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 100 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-zinc-200/80 bg-white/50 backdrop-blur-md shadow-sm text-xs font-mono tracking-widest uppercase text-zinc-500"
          >
            <MapPin weight="fill" className="w-3 h-3 text-zinc-800" />
            Vibe Routing Engine Active
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-zinc-900 leading-[1.05]" style={{ fontFamily: 'var(--font-sans)' }}>
            Turn Google Maps into a website.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed mt-6">
            Paste any maps link. We'll analyze reviews, extract value props, and automatically route to the perfect agency-level aesthetic.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative w-full group mt-12 mb-24">
          <div className="absolute -inset-2 bg-zinc-200/50 rounded-[2rem] blur-xl opacity-40 transition group-hover:opacity-60 duration-500" />
          <div className="relative bg-white border border-zinc-200 shadow-sm rounded-[2rem] p-2 flex items-center overflow-hidden transition-all focus-within:border-zinc-300 focus-within:ring-4 ring-zinc-100/50">
            <div className="pl-6 pr-2 text-zinc-400">
              <MagnifyingGlass weight="bold" className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-zinc-300 disabled:opacity-50 min-w-0 font-medium"
              required
            />
            <button
              type="submit"
              disabled={!url}
              className="bg-zinc-950 text-white px-8 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-sm transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 select-none overflow-hidden relative group/btn hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">
                Generate 
                <span className="ml-2 flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover/btn:translate-x-1 transition-transform duration-500 ease-premium-spring">
                  <ArrowRight weight="bold" className="w-3 h-3" />
                </span>
              </div>
            </button>
          </div>
        </form>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900" style={{ fontFamily: 'var(--font-sans)' }}>Previously Built Websites</h3>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{history.length} SAVED</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {history.map((site, i) => (
                <button 
                  key={site.placeId + i}
                  onClick={() => setSiteData(site)}
                  className="text-left group outline-none"
                >
                  <PremiumCard className="h-full transition-transform duration-500 ease-premium-spring group-hover:-translate-y-1 group-active:scale-[0.98]" innerClassName="p-6 bg-white flex flex-col justify-between">
                    <div>
                      <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative">
                        <img src={site.photos[0] || ''} alt={site.name} className="w-full h-full object-cover blur-sm group-hover:blur-0 transition-all duration-700 ease-premium-spring scale-110 group-hover:scale-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium">
                          <Star weight="fill" className="text-amber-400" />
                          {site.rating}
                        </div>
                      </div>
                      <h4 className="font-bold text-lg text-zinc-900 leading-tight mb-2 truncate" style={{ fontFamily: 'var(--font-sans)' }}>{site.name}</h4>
                      <p className="text-sm text-zinc-500 truncate flex items-center gap-1.5"><MapPin weight="light" className="w-3.5 h-3.5" />{site.address.split(',')[0]}</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-blue-600 transition-colors">
                      Open Site <ArrowUpRight className="ml-1" />
                    </div>
                  </PremiumCard>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

// ==========================================
// VIBE ROUTING ENGINE
// ==========================================

function SitePreviewRouter({ data, onBack }: { data: GeneratedSiteData, onBack: () => void }) {
  const [override, setOverride] = useState<Archetype | null>(null);
  const archetype = override || resolveArchetype(data.types || []);
  
  const activeConfig = ARCHETYPES_REGISTRY.find(a => a.id === archetype) || ARCHETYPES_REGISTRY[ARCHETYPES_REGISTRY.length - 1];
  const Component = activeConfig.component;

  return (
    <Component 
      data={data} 
      onBack={onBack} 
      currentOverride={archetype} 
      onSwitch={(v) => setOverride(v as Archetype)} 
    />
  );
}
