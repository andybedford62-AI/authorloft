"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

function FaqAccordionItem({ faq, index }: { faq: FaqItem; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors duration-200 ${open ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{faq.question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-blue-500" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know about AuthorLoft.
          </p>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <ScrollReveal key={faq.id} delay={index * 50} direction="up">
              <FaqAccordionItem faq={faq} index={index} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
