'use client';
import React, { useState } from 'react';
import styles from './Seo.module.css';

interface Faq {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.priceTitle}>Preguntas Frecuentes (FAQs)</h3>
      {faqs.map((faq, idx) => (
        <div key={idx} className={styles.faqItem}>
          <div className={styles.faqQuestion} onClick={() => toggle(idx)}>
            {faq.question}
            <span>{openIndex === idx ? '−' : '+'}</span>
          </div>
          {openIndex === idx && (
            <div className={styles.faqAnswer}>{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
