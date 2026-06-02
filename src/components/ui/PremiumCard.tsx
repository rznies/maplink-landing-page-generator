import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  key?: React.Key;
}

export function PremiumCard({ children, className = '', innerClassName = '' }: PremiumCardProps) {
  return (
    <div className={`p-[6px] bg-zinc-950/5 dark:bg-white/5 rounded-[2.5rem] border border-zinc-950/5 shadow-sm ${className}`}>
      <div className={`w-full h-full rounded-[calc(2.5rem-6px)] bg-white overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ${innerClassName}`}>
        {children}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[calc(2.5rem-6px)] pointer-events-none" />
      </div>
    </div>
  );
}
