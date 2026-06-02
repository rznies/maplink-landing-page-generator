import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StatusMessage } from '../../types';


interface CinematicLoaderProps {
  messages: StatusMessage[];
}

export function CinematicLoader({ messages }: CinematicLoaderProps) {
  const activeMessage = messages[messages.length - 1];
  const doneCount = messages.filter(m => m.status === 'done').length;
  const total = Math.max(messages.length, 5); // assume ~5 steps
  const progress = Math.min((doneCount / total) * 100, 95);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-zinc-900 overflow-hidden"
    >
      {/* Subtle background gradient pulse */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-zinc-100/60 blur-[120px] animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md text-center px-6">
        
        {/* Minimal dot spinner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="mb-12 flex items-center gap-2"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-900"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        {/* Status text */}
        <div className="h-14 relative w-full flex items-center justify-center overflow-hidden mb-8">
          <AnimatePresence mode="wait">
            {activeMessage ? (
              <motion.p
                key={activeMessage.id}
                initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -12, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className={`absolute text-base font-medium tracking-tight ${activeMessage.status === 'error' ? 'text-red-500' : 'text-zinc-600'}`}
              >
                {activeMessage.text}
              </motion.p>
            ) : (
              <motion.p
                key="init"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute text-base font-medium tracking-tight text-zinc-400"
              >
                Preparing your site…
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-px bg-zinc-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-zinc-900 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Step counter */}
        <p className="mt-4 text-xs text-zinc-300 font-mono tracking-widest uppercase">
          {doneCount > 0 ? `Step ${doneCount} of ${total}` : ''}
        </p>
      </div>
    </motion.div>
  );
}
