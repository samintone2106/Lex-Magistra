"use client";

import { useEffect, useState } from "react";

/**
 * Interruptor accesible para reducir animaciones. Guarda la elección explícita ("reduce" | "full")
 * para que pese más que la preferencia del sistema, y recarga para aplicarla en todo el sitio.
 */
export function MotionToggle({ className = "link text-left" }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(document.documentElement.classList.contains("reduce-motion")), []);

  const toggle = () => {
    const next = !reduced;
    try {
      localStorage.setItem("motion", next ? "reduce" : "full");
    } catch {
      // sin almacenamiento: solo esta visita
    }
    document.documentElement.classList.toggle("reduce-motion", next);
    window.location.reload();
  };

  return (
    // La etiqueta dice la acción; por eso no lleva aria-pressed (se contradecirían).
    <button type="button" onClick={toggle} className={className}>
      {reduced ? "Activar animaciones" : "Reducir animaciones"}
    </button>
  );
}
