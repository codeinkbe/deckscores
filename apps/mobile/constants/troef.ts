import type { Troef } from '@deckscores/shared';
import { Palette } from './theme';

export const TROEF_LABEL: Record<Troef, string> = {
  klaver: '♣',
  hart: '♥',
  schoppen: '♠',
  ruiten: '♦',
};

export const TROEF_NAME: Record<Troef, string> = {
  klaver: 'Klaveren',
  hart: 'Harten',
  schoppen: 'Schoppen',
  ruiten: 'Ruiten',
};

export const TROEF_COLOR: Record<Troef, string> = {
  klaver: Palette.klaverBlack,
  hart: Palette.hartRed,
  schoppen: Palette.schoppenBlack,
  ruiten: Palette.ruitenRed,
};
