export type CardCode = 'A' | '10' | 'H' | 'V' | 'B' | '9' | '8' | '7';

export const TROEF_VALUES: Record<CardCode, number> = {
  A: 11,
  '10': 10,
  H: 4,
  V: 3,
  B: 20,
  '9': 14,
  '8': 0,
  '7': 0,
};

export const NORMAAL_VALUES: Record<CardCode, number> = {
  A: 11,
  '10': 10,
  H: 4,
  V: 3,
  B: 2,
  '9': 0,
  '8': 0,
  '7': 0,
};

export const LAATSTE_SLAG_BONUS = 10;

export const TOTAAL_PUNTEN_PER_GIFFIE = 162;

export type CardCount = Partial<Record<CardCode, number>>;

const sumCardValues = (counts: CardCount, table: Record<CardCode, number>) =>
  (Object.entries(counts) as [CardCode, number][]).reduce(
    (sum, [card, count]) => sum + table[card] * (count ?? 0),
    0,
  );

export type TelhulpInput = {
  troef_counts: CardCount;
  normaal_counts: CardCount;
  laatste_slag: boolean;
};

export const calculateTelhulpPunten = ({
  troef_counts,
  normaal_counts,
  laatste_slag,
}: TelhulpInput): number => {
  const troefPunten = sumCardValues(troef_counts, TROEF_VALUES);
  const normaalPunten = sumCardValues(normaal_counts, NORMAAL_VALUES);
  const slag = laatste_slag ? LAATSTE_SLAG_BONUS : 0;
  return troefPunten + normaalPunten + slag;
};
