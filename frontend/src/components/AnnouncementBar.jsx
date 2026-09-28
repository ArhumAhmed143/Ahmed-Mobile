import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const messages = [
  '🚚 Free Delivery on Orders Above Rs 3,000',
  '🔥 Mega Sale — Upto 40% OFF',
  '💳 Cash on Delivery Available All Over Pakistan'
];

export default function AnnouncementBar() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % messages.length);
    }, 3000);

    return () => window.clearInterval(rotation);
  }, []);

  return (
    <div className="relative z-50 flex h-8 sm:h-8.5 items-center justify-center overflow-hidden border-b border-black/10 bg-[#a78bfa] px-4 text-center text-[10px] font-bold tracking-wide text-[#0d0d0f] sm:text-xs">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="truncate"
        >
          {messages[messageIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}