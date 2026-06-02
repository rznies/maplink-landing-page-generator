import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'whatsapp';
}

export function MagneticButton({ children, icon, className = '', variant = 'primary', ...props }: MagneticButtonProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const baseStyles = "relative group flex items-center justify-center gap-3 rounded-full px-8 py-4 font-bold uppercase tracking-widest transition-all hover:bg-opacity-90 overflow-hidden active:scale-[0.98] z-50 shadow-sm";
  
  const variants = {
    primary: "bg-zinc-950 text-white hover:bg-zinc-800 shadow-zinc-900/20",
    secondary: "bg-white text-zinc-950 border border-zinc-200 hover:border-zinc-300 shadow-black/5",
    whatsapp: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10 text-sm md:text-base">{children}</span>
      
      {/* Button-in-Button architecture for trailing icon */}
      {icon && (
        <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-transform duration-500 ease-premium-spring">
          {icon}
        </span>
      )}

      {/* Subtle hover spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              75px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
    </motion.button>
  );
}
