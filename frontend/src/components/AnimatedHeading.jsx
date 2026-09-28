import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedHeading({ as = 'h2', children, className = '', delay = 0 }) {
  const Heading = motion[as] || motion.h2;
  const text = typeof children === 'string' ? children : String(children);
  const words = text.split(' ');

  return (
    <Heading
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.03
          }
        }
      }}
    >
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          <span className="inline-block whitespace-nowrap">
            {word.split('').map((character, charIndex) => (
              <motion.span
                key={`${character}-${charIndex}`}
                aria-hidden="true"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
                }}
                className="inline-block"
              >
                {character}
              </motion.span>
            ))}
          </span>
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Heading>
  );
}