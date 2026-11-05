/** Monograma de la firma: un frontón institucional con dos columnas. Trazo, sin relleno. */
export function Monogram({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M6 16 L24 5 L42 16 Z" />
      <line x1="13" y1="21" x2="13" y2="37" />
      <line x1="24" y1="21" x2="24" y2="37" />
      <line x1="35" y1="21" x2="35" y2="37" />
      <line x1="5" y1="42" x2="43" y2="42" />
    </svg>
  );
}
