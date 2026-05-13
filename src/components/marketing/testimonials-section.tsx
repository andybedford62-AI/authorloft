"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { TestimonialCard } from "./testimonial-card";

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
  image: string | null;
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <Star className="h-3.5 w-3.5 fill-amber-500" />
            Testimonials
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What authors say
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Hear from authors who are using AuthorLoft to build their author platform.
          </p>
        </ScrollReveal>

        <div className={`grid gap-8 ${
          testimonials.length === 1
            ? "grid-cols-1 max-w-lg mx-auto"
            : testimonials.length === 2
            ? "sm:grid-cols-2 max-w-3xl mx-auto"
            : "sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 80} direction={index % 3 === 1 ? "scale" : "up"}>
              <TestimonialCard testimonial={testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
