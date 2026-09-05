import {
  Carrot,
  Fish,
  Drumstick,
  Snowflake,
  Wheat,
  CupSoda,
  Croissant,
  Package,
  SprayCan,
  CookingPot,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  carrot: Carrot,
  fish: Fish,
  drumstick: Drumstick,
  snowflake: Snowflake,
  wheat: Wheat,
  'cup-soda': CupSoda,
  croissant: Croissant,
  package: Package,
  'spray-can': SprayCan,
  'cooking-pot': CookingPot,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Package;
  return <Icon className={className} aria-hidden />;
}
