import {
  bucketForSeat,
  emptyTotals,
  otherBuckets,
  type BoompjeFormat,
  type BoompjeTotals,
  type ScoreBucket,
} from '../types/boompje';
import type { BucketScore, Giffie } from '../types/giffie';
import type { Seat } from '../types/player';
import { TOTAAL_PUNTEN_PER_GIFFIE } from './cards';

const PIT_BONUS = 100;
const MAKEN_GRENS = 82;

export type GiffieDraftInput = {
  gegaan_seat: Seat;
  troef: Giffie['troef'];
  raw_scores: Record<string, { punten: number; roem: number }>;
  pit: string | null;
  verzaakt: string | null;
};

export type CalculatedGiffie = Omit<Giffie, 'number'> & {
  warnings: string[];
};

const initEmptyScores = (
  buckets: ScoreBucket[],
): Record<string, BucketScore> =>
  Object.fromEntries(buckets.map((bucket) => [bucket.id, { score: 0, roem: 0 }]));

const sumRawField = (
  buckets: ScoreBucket[],
  raw: GiffieDraftInput['raw_scores'],
  field: 'punten' | 'roem',
) =>
  buckets.reduce(
    (total, bucket) => total + (raw[bucket.id]?.[field] ?? 0),
    0,
  );

export const calculateGiffie = (
  input: GiffieDraftInput,
  buckets: ScoreBucket[],
): CalculatedGiffie => {
  const warnings: string[] = [];
  const gegaanBucket = bucketForSeat(buckets, input.gegaan_seat);

  const totalPunten = sumRawField(buckets, input.raw_scores, 'punten');
  const totalRoem = sumRawField(buckets, input.raw_scores, 'roem');

  if (input.verzaakt === null && totalPunten !== TOTAAL_PUNTEN_PER_GIFFIE) {
    warnings.push(
      `Som spelpunten is ${totalPunten}, verwacht ${TOTAAL_PUNTEN_PER_GIFFIE}.`,
    );
  }

  if (input.verzaakt) {
    const winners = otherBuckets(buckets, input.verzaakt);
    const sharedScore = TOTAAL_PUNTEN_PER_GIFFIE + totalRoem;
    const perWinner = sharedScore / winners.length;
    const perWinnerRoem = totalRoem / winners.length;
    const scores = initEmptyScores(buckets);
    for (const winner of winners) {
      scores[winner.id] = { score: perWinner, roem: perWinnerRoem };
    }
    return {
      gegaan_seat: input.gegaan_seat,
      troef: input.troef,
      scores,
      nat: false,
      pit: null,
      verzaakt: input.verzaakt,
      warnings,
    };
  }

  const gegaanInput = input.raw_scores[gegaanBucket.id] ?? {
    punten: 0,
    roem: 0,
  };
  const isNat = gegaanInput.punten + gegaanInput.roem < MAKEN_GRENS;
  const scores = initEmptyScores(buckets);

  if (isNat) {
    const others = otherBuckets(buckets, gegaanBucket.id);
    const sharedScore = TOTAAL_PUNTEN_PER_GIFFIE + totalRoem;
    const perOther = sharedScore / others.length;
    const perOtherRoem = totalRoem / others.length;
    for (const other of others) {
      scores[other.id] = { score: perOther, roem: perOtherRoem };
    }
  } else {
    for (const bucket of buckets) {
      const raw = input.raw_scores[bucket.id] ?? { punten: 0, roem: 0 };
      scores[bucket.id] = { score: raw.punten + raw.roem, roem: raw.roem };
    }
  }

  if (input.pit && scores[input.pit]) {
    scores[input.pit] = {
      ...scores[input.pit],
      score: scores[input.pit].score + PIT_BONUS,
    };
  }

  return {
    gegaan_seat: input.gegaan_seat,
    troef: input.troef,
    scores,
    nat: isNat,
    pit: input.pit,
    verzaakt: null,
    warnings,
  };
};

export const sumGiffies = (
  giffies: Giffie[],
  buckets: ScoreBucket[],
): BoompjeTotals => {
  const totals = emptyTotals(buckets);
  for (const giffie of giffies) {
    for (const bucket of buckets) {
      totals[bucket.id] += giffie.scores[bucket.id]?.score ?? 0;
    }
  }
  return totals;
};

export const isBoompjeFinished = (
  format: BoompjeFormat,
  giffies: Giffie[],
  buckets: ScoreBucket[],
): boolean => {
  if (format === '16_giffies') return giffies.length >= 16;
  const totals = sumGiffies(giffies, buckets);
  const target = format === '1500_punten' ? 1500 : 1000;
  return Object.values(totals).some((value) => value >= target);
};

export const formatScaledOnly = (format: BoompjeFormat) => format === '16_giffies';

export const displayScore = (
  score: number,
  options: { afronden: boolean; format: BoompjeFormat },
): number => {
  if (!options.afronden) return Math.round(score);
  if (!formatScaledOnly(options.format)) return Math.round(score);
  return Math.round(score / 10);
};

export const PUNTEN_TE_GAAN_DREMPEL = MAKEN_GRENS;
