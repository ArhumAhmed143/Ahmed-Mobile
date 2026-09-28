import React from 'react';

/**
 * Official Ahmed Mobile Logo Badge Component
 * Displays the signature AM lavender monogram on dark background.
 */
export default function Logo({ 
  className = "w-10 h-10 sm:w-11 sm:h-11", 
  rounded = "rounded-xl",
  glow = true,
  alt = "Ahmed Mobile Logo" 
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} bg-[#08080a] border border-violet-400/25 flex items-center justify-center transition-transform hover:scale-105 ${
        glow ? 'shadow-[0_0_15px_rgba(167,139,250,0.25)]' : ''
      } ${className}`}
    >
      <img
        src="/logo.jpg"
        alt={alt}
        className="w-full h-full object-cover scale-[1.08] select-none"
        loading="eager"
      />
    </div>
  );
}
