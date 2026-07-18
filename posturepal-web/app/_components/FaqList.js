'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from './motion';

// Accessible accordion with animated open/close, shared by both pages.
const FaqList = ({ items }) => {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div>
      {items.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`faq-row${isOpen ? ' open' : ''}`}>
            <button
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              {faq.q}
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{ fontSize: '1.4rem', fontWeight: 400, lineHeight: 1, flexShrink: 0, color: 'var(--emerald)' }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="faq-a">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FaqList;
