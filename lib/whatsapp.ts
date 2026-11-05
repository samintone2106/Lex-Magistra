/** Arma el enlace wa.me a partir del número configurado. Devuelve null si no hay número válido. */
export function whatsappUrl(number: string, message?: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${digits}${text}`;
}
