import React from 'react';
import { motion } from 'motion/react';

export function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number, key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.32, 0.72, 0, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
