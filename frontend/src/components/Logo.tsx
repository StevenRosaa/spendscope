'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  withText?: boolean;
  animated?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function Logo({ 
  className = "w-12 h-12", 
  withText = false, 
  animated = false,
  layout = 'horizontal'
}: LogoProps) {
  const gradientId = "spendscope-gradient";
  const sparkleId = "spendscope-sparkle";
  
  const icon = (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Main Sphere Gradient - Radial for 3D effect */}
        <radialGradient id={gradientId} cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#A78BFA" /> {/* Lighter Violet */}
          <stop offset="50%" stopColor="#7C3AED" /> {/* Violet */}
          <stop offset="100%" stopColor="#4C1D95" /> {/* Dark Violet */}
        </radialGradient>
        
        {/* Lobe Gradient - Darker to recede */}
        <linearGradient id="lobeGradient" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B21B6" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Top Lobe - Behind */}
      <circle
        cx="100"
        cy="45"
        r="28"
        fill="url(#lobeGradient)"
        className="dark:opacity-90"
      />
      
      {/* Bottom Lobe - Behind */}
      <circle
        cx="100"
        cy="155"
        r="28"
        fill="url(#lobeGradient)"
        className="dark:opacity-90"
      />
      
      {/* Main Sphere */}
      <circle
        cx="100"
        cy="100"
        r="65"
        fill={`url(#${gradientId})`}
        className="drop-shadow-lg"
      />
      
      {/* Sparkle */}
      <g transform="translate(100, 100)">
        {/* Vertical Ray */}
        <path
          d="M 0,-35 C 2,-15 2,-15 4,0 C 2,15 2,15 0,35 C -2,15 -2,15 -4,0 C -2,-15 -2,-15 0,-35"
          fill="white"
          className="animate-pulse"
        />
        {/* Horizontal Ray */}
        <path
          d="M -35,0 C -15,-2 -15,-2 0,-4 C 15,-2 15,-2 35,0 C 15,2 15,2 0,4 C -15,2 -15,2 -35,0"
          fill="white"
          className="animate-pulse"
        />
        {/* Center Glow */}
        <circle cx="0" cy="0" r="4" fill="white" />
      </g>
    </svg>
  );

  const Wrapper = animated ? motion.div : 'div';
  const containerClasses = layout === 'vertical' 
    ? "flex flex-col items-center gap-3" 
    : "flex items-center gap-3";

  return (
    <Wrapper 
      className={containerClasses}
      {...(animated ? { 
        whileHover: { scale: 1.05 }, 
        whileTap: { scale: 0.95 },
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      } : {})}
    >
      {icon}
      {withText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center text-center' : 'items-start'}`}>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
            SpendScope
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Enterprise Financial Software
          </span>
        </div>
      )}
    </Wrapper>
  );
}
