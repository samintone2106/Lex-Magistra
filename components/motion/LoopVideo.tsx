"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "./MotionProvider";

interface Props {
  mp4: string;
  webm?: string;
  poster: string;
  label: string;
  className?: string;
}

/**
 * Video corto en bucle, mudo y decorativo. No descarga nada hasta acercarse a la pantalla,
 * se pausa al salir de ella y con movimiento reducido se queda en el póster.
 */
export function LoopVideo({ mp4, webm, poster, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion()) return;
    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            video.preload = "auto";
            video.load();
            loaded = true;
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      disablePictureInPicture
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
