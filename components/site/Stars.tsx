import { Star } from "lucide-react";

export function Stars({ value, size = 18 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-mist" role="img" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden size={size} strokeWidth={1.5} fill={n <= rounded ? "currentColor" : "none"} />
      ))}
    </span>
  );
}
