// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '923355708704').replace(/\D/g, '');
// const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi')}`;

// function WhatsAppIcon() {
//   return (
//     <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current text-white">
//       <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.07 24l6.28-1.65a11.9 11.9 0 0 0 5.73 1.46h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.46-8.43Zm-8.43 18.3h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.88 9.88 0 0 1-1.52-5.26C2.21 6.44 6.64 2.01 12.08 2.01a9.85 9.85 0 0 1 7.02 2.91 9.9 9.9 0 0 1 2.9 7.04c0 5.44-4.43 9.87-9.91 9.87Zm5.41-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.56-.35Z" />
//     </svg>
//   );
// }

// export default function WhatsAppButton() {
//   const [isHovered, setIsHovered] = useState(false);
//   const [wiggle, setWiggle] = useState(false);

//   // Periodic subtle wiggle every 5 seconds to draw attention
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setWiggle(true);
//       const resetTimer = setTimeout(() => setWiggle(false), 900);
//       return () => clearTimeout(resetTimer);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, []);

//   if (!whatsappNumber) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30, scale: 0.8 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ delay: 1, duration: 0.5, ease: 'easeOut' }}
//       className="fixed bottom-6 right-6 z-50 flex items-center"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Tooltip on Hover */}
//       <AnimatePresence>
//         {isHovered && (
//           <motion.div
//             initial={{ opacity: 0, x: 10, scale: 0.95 }}
//             animate={{ opacity: 1, x: 0, scale: 1 }}
//             exit={{ opacity: 0, x: 8, scale: 0.95 }}
//             transition={{ duration: 0.2, ease: 'easeOut' }}
//             className="pointer-events-none absolute right-full mr-3.5 flex items-center whitespace-nowrap rounded-lg border border-white/10 bg-[#16161a] px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/50"
//           >
//             <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
//             <span>Chat with us on WhatsApp</span>
//             {/* Small right pointer arrow */}
//             <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#16161a]" />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Button Anchor with Pulse Ring & Hover Scale */}
//       <motion.a
//         href={whatsappUrl}
//         target="_blank"
//         rel="noopener noreferrer"
//         aria-label="Chat with us on WhatsApp"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         transition={{ duration: 0.3, ease: 'easeInOut' }}
//         className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 focus:ring-offset-2 focus:ring-offset-[#0d0d0f]"
//       >
//         {/* Continuous Pulse Ring */}
//         <span
//           className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping"
//           style={{ animationDuration: '2s' }}
//         />

//         {/* Official WhatsApp Icon with Periodic Wiggle */}
//         <motion.span
//           className="relative z-10 flex items-center justify-center"
//           animate={
//             wiggle
//               ? {
//                   rotate: [0, -14, 14, -10, 10, -4, 4, 0],
//                   transition: { duration: 0.8, ease: 'easeInOut' }
//                 }
//               : { rotate: 0 }
//           }
//         >
//           <WhatsAppIcon />
//         </motion.span>
//       </motion.a>
//     </motion.div>
//   );
// } 

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '923355708704').replace(/\D/g, '');
const whatsappMessage = "Hello Ahmed Mobile! I'm interested in your products. Can you help me?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current text-white">
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.07 24l6.28-1.65a11.9 11.9 0 0 0 5.73 1.46h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.46-8.43Zm-8.43 18.3h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.88 9.88 0 0 1-1.52-5.26C2.21 6.44 6.64 2.01 12.08 2.01a9.85 9.85 0 0 1 7.02 2.91 9.9 9.9 0 0 1 2.9 7.04c0 5.44-4.43 9.87-9.91 9.87Zm5.41-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.56-.35Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  // Periodic subtle wiggle every 5 seconds to draw attention
  useEffect(() => {
    const timer = setInterval(() => {
      setWiggle(true);
      const resetTimer = setTimeout(() => setWiggle(false), 900);
      return () => clearTimeout(resetTimer);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  if (!whatsappNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: 'easeOut' }}
      className="fixed bottom-6 right-6 z-50 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none absolute right-full mr-3.5 flex items-center whitespace-nowrap rounded-lg border border-white/10 bg-[#16161a] px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/50"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Chat with us on WhatsApp</span>
            {/* Small right pointer arrow */}
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#16161a]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Anchor with Pulse Ring & Hover Scale */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 focus:ring-offset-2 focus:ring-offset-[#0d0d0f]"
      >
        {/* Continuous Pulse Ring */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping"
          style={{ animationDuration: '2s' }}
        />

        {/* Official WhatsApp Icon with Periodic Wiggle */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          animate={
            wiggle
              ? {
                  rotate: [0, -14, 14, -10, 10, -4, 4, 0],
                  transition: { duration: 0.8, ease: 'easeInOut' }
                }
              : { rotate: 0 }
          }
        >
          <WhatsAppIcon />
        </motion.span>
      </motion.a>
    </motion.div>
  );
}