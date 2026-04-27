import type { Seat } from './player';

export type Troef = 'klaver' | 'hart' | 'schoppen' | 'ruiten';

export const ALL_TROEVEN: Troef[] = ['klaver', 'hart', 'schoppen', 'ruiten'];

export type BucketScore = {
  score: number;
  roem: number;
};

export type Giffie = {
  number: number;
  gegaan_seat: Seat;
  troef: Troef;
  scores: Record<string, BucketScore>;
  nat: boolean;
  pit: string | null;
  verzaakt: string | null;
};
