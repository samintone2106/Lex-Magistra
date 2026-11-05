"use client";

import { useEffect, useState } from "react";

/** Interruptor accesible para reducir animaciones. Recarga para aplicar el cambio en todo el sitio. */
export function MotionToggle() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(document.documentElement.classList.contains("reduce-motion")), []);

  const toggle = () => {
    const next = !reduced;
    try {
      if (next) localStorage.setItem("motion", "reduce");
      else localStorage.removeItem("motion");
    } catch {
      // sin almacenamiento: solo esta visita
    }
    document.documentElement.classList.toggle("reduce-motion", next);
    window.location.reload();
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={reduced} className="link text-left">
      {reduced ? "Activar animaciones" : "Reducir animaciones"}
    </button>
  );
}
