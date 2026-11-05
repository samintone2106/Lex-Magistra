import { BadgeCheck, Car, Gavel, Landmark, Plane, Scale, ShieldCheck, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  car: Car,
  gavel: Gavel,
  landmark: Landmark,
  shield: ShieldCheck,
  plane: Plane,
  "badge-check": BadgeCheck,
  scale: Scale,
};

export const ICON_NAMES = Object.keys(ICONS);

export function SpecialtyIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Scale;
  return <Icon aria-hidden strokeWidth={1.5} {...props} />;
}
