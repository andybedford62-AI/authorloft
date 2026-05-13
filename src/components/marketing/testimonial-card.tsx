import { Star } from "lucide-react";

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
  image: string | null;
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="group h-full bg-white rounded-2xl border border-gray-100 p-8 space-y-4 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 transition-all duration-300">
      {/* Star rating */}
      {testimonial.rating && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating! ? "fill-amber-400 text-amber-400" : "text-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <p className="text-gray-700 leading-relaxed text-sm group-hover:text-gray-900 transition-colors duration-300">
        "{testimonial.quote}"
      </p>

      {/* Author info */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
          {testimonial.authorName}
        </h3>
        {testimonial.authorRole && (
          <p className="text-xs text-gray-500 mt-1">{testimonial.authorRole}</p>
        )}
      </div>

      {/* Image (if available) */}
      {testimonial.image && (
        <div className="pt-2">
          <img
            src={testimonial.image}
            alt={testimonial.authorName}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
