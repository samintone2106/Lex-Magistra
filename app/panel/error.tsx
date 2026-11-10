"use client";

import { ScreenError } from "@/components/panel/ScreenStates";

export default function ScreenRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ScreenError error={error} reset={reset} home="/panel" />;
}
