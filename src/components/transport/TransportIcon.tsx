import { TransportType, transportLabels } from '@/types/trip';
import { cn } from '@/lib/utils';

export type LegMode = TransportType | 'start';

const ICON_PATHS: Record<LegMode, string> = {
  // Avion vu de dessus : fuselage + ailes
  plane: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  // Train de face : cabine, fenêtre, roues, rails
  train: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5V21h2.23l2-2h3.54l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17A1.5 1.5 0 119 15.5 1.5 1.5 0 017.5 17zm9 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM18 10H6V6h12v4z',
  // Voiture de profil : capot, habitacle, roues
  car: 'M18.92 6.01A1.5 1.5 0 0017.5 5h-11a1.5 1.5 0 00-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 118 14.5 1.5 1.5 0 016.5 16zm11 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  // Bus de face : carrosserie, pare-brise, roues
  bus: 'M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1A1.5 1.5 0 116 15.5 1.5 1.5 0 017.5 17zm9 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM18 11H6V6h12v5z',
  // Bateau : coque, cabine, ligne de flottaison
  boat: 'M4 15l1.2-4.4A2 2 0 017.12 9H9V5a1 1 0 011-1h4a1 1 0 011 1v4h1.88a2 2 0 011.92 1.6L20 15H4zm-1.5 2.2h19L20.4 19a2.5 2.5 0 01-2.2 1.3H5.8a2.5 2.5 0 01-2.2-1.3l-1.1-1.8zM11 6v3h2V6h-2z',
  // Métro : rame compacte, sans roues apparentes
  metro: 'M4 6a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V6zm3 12a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z',
  // Hébergement : lit
  logement: 'M7 14a3 3 0 100-6 3 3 0 000 6zm13-6h-8v7H4V5H2v15h2v-3h16v3h2v-9a3 3 0 00-3-3z',
  // Frais divers : ticket / justificatif
  frais: 'M6 2h12a1 1 0 011 1v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1V3a1 1 0 011-1zm2 5h8v1.5H8V7zm0 3h8v1.5H8V10zm0 3h5v1.5H8V13z',
  // Départ : épingle de carte pleine
  start: 'M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z',
};

const MODE_BADGE_CLASS: Record<LegMode, string> = {
  plane: 'transport-plane',
  train: 'transport-train',
  car: 'transport-car',
  bus: 'transport-bus',
  boat: 'transport-boat',
  metro: 'transport-metro',
  logement: 'transport-logement',
  frais: 'bg-muted text-muted-foreground',
  start: 'bg-secondary text-foreground',
};

const MODE_LABEL: Record<LegMode, string> = {
  ...transportLabels,
  start: 'Départ',
};

interface TransportIconProps {
  mode: LegMode;
  className?: string;
  badgeClassName?: string;
}

export function TransportIcon({ mode, className, badgeClassName }: TransportIconProps) {
  const label = MODE_LABEL[mode] ?? mode;

  return (
    <span
      className={cn(
        'w-7 h-7 shrink-0 rounded-full flex items-center justify-center',
        MODE_BADGE_CLASS[mode] ?? MODE_BADGE_CLASS.start,
        badgeClassName
      )}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn('w-4 h-4', className)} aria-hidden="true">
        <path d={ICON_PATHS[mode] ?? ICON_PATHS.start} />
      </svg>
    </span>
  );
}
