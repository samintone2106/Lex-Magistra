"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavSession {
  signedIn: boolean;
  isAdmin: boolean;
}

const SIGNED_OUT: NavSession = { signedIn: false, isAdmin: false };
// Cookie de sesión de @supabase/ssr (puede venir partida en .0, .1…).
const AUTH_COOKIE = /(?:^|;\s*)sb-[^=]*-auth-token(?:\.\d+)?=/;

/**
 * Estado de sesión solo para la UI del menú público (Iniciar sesión / Mi panel).
 * Se resuelve en el cliente para que el layout público no lea cookies y pueda ser estático.
 * No protege nada: /panel y /admin siguen validados en el middleware y en el servidor.
 * El SDK de Supabase se carga bajo demanda y solo si hay cookie de sesión.
 */
export function useNavSession(): NavSession {
  const pathname = usePathname();
  const [state, setState] = useState<NavSession>(SIGNED_OUT);
  // Rol ya resuelto por usuario, para no repetir la consulta en cada navegación.
  const roleCache = useRef<{ userId: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    if (!AUTH_COOKIE.test(document.cookie)) {
      roleCache.current = null;
      setState(SIGNED_OUT);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const { createClient } = await import("./client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          if (active) setState(SIGNED_OUT);
          return;
        }
        const userId = session.user.id;
        if (roleCache.current?.userId !== userId) {
          const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
          roleCache.current = { userId, isAdmin: data?.role === "admin" };
        }
        if (active) setState({ signedIn: true, isAdmin: roleCache.current.isAdmin });
      } catch {
        if (active) setState(SIGNED_OUT);
      }
    })();
    return () => {
      active = false;
    };
  }, [pathname]);

  return state;
}
