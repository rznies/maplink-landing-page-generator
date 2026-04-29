import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CaretDown, Check, Export } from '@phosphor-icons/react';

interface FloatingNavProps {
  onBack: () => void;
  currentOverride: string;
  onSwitch: (v: string) => void;
  businessName?: string;
  onExport?: () => void;
}

export function FloatingNav({ onBack, currentOverride, onSwitch, businessName, onExport }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { id: 'structural', label: 'Soft Structuralism' },
    { id: 'minimalist', label: 'Editorial Luxury' },
    { id: 'brutalist', label: 'Swiss Industrial' }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="pointer-events-auto w-full bg-white/70 backdrop-blur-2xl border-b border-zinc-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Left: Back + Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-900"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
            </button>
            {businessName && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-sm tracking-tight text-zinc-900 hidden sm:block"
              >
                {businessName}
              </motion.span>
            )}
          </div>

          {/* Right: Export + Vibe Switcher */}
          <div className="flex items-center gap-2">
            {onExport && (
              <button 
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-700 transition-colors text-sm font-semibold tracking-tight text-white"
              >
                <Export weight="bold" className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors text-sm font-semibold tracking-tight text-zinc-900"
            >
              {options.find(o => o.id === currentOverride)?.label || 'Vibe Switcher'}
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
                <CaretDown weight="bold" className="w-3 h-3 text-zinc-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-3xl border border-zinc-200 rounded-2xl p-1.5 shadow-2xl origin-top-right min-w-[200px]"
                  >
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onSwitch(opt.id);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors text-sm font-medium text-zinc-900 text-left"
                      >
                        {opt.label}
                        {currentOverride === opt.id && <Check weight="bold" className="w-4 h-4 text-zinc-900" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
