import type { Giffie, Troef } from './giffie';
import type { Player, Seat } from './player';

export type BoompjeFormat = '16_giffies' | '1000_punten' | '1500_punten';

export type Op16eActie = 'maken' | 'draaien';

export type NumPlayers = 2 | 3 | 4;

export type BoompjeSettings = {
  afronden: boolean;
  deler_aangeven: boolean;
  op_16e_actie: Op16eActie;
  num_players: NumPlayers;
};

export type BoompjeStatus = 'open' | 'finished';

export type Participant = {
  player: Player;
  seat: Seat;
};

export type ScoreBucket = {
  id: string;
  label: string;
  seats: Seat[];
};

export type BoompjeTotals = Record<string, number>;

export type Boompje = {
  id: string;
  group_id: string;
  owner_clerk_id: string;
  format: BoompjeFormat;
  settings: BoompjeSettings;
  participants: Participant[];
  buckets: ScoreBucket[];
  dealer_seat: Seat;
  status: BoompjeStatus;
  totals: BoompjeTotals;
  giffies: Giffie[];
  created_at: string;
  finished_at: string | null;
};

export type CreateBoompjeInput = {
  group_id: string;
  format: BoompjeFormat;
  settings: BoompjeSettings;
  participants: Participant[];
  buckets: ScoreBucket[];
  dealer_seat: Seat;
};

export type AddGiffieInput = {
  gegaan_seat: Seat;
  troef: Troef;
  raw_scores: Record<string, { punten: number; roem: number }>;
  pit: string | null;
  verzaakt: string | null;
};

export const BUCKET_WIJ = 'wij';
export const BUCKET_ZIJ = 'zij';

export const seatsForNumPlayers = (num: NumPlayers): Seat[] =>
  Array.from({ length: num }, (_, index) => index);

export const buildBuckets = (participants: Participant[]): ScoreBucket[] => {
  if (participants.length === 4) {
    return [
      { id: BUCKET_WIJ, label: 'Wij', seats: [0, 2] },
      { id: BUCKET_ZIJ, label: 'Zij', seats: [1, 3] },
    ];
  }

  return [...participants]
    .sort((a, b) => a.seat - b.seat)
    .map((participant) => ({
      id: `seat_${participant.seat}`,
      label: participant.player.display_name,
      seats: [participant.seat],
    }));
};

export const bucketForSeat = (
  buckets: ScoreBucket[],
  seat: Seat,
): ScoreBucket => {
  const bucket = buckets.find((entry) => entry.seats.includes(seat));
  if (!bucket) throw new Error(`No bucket for seat ${seat}`);
  return bucket;
};

export const otherBuckets = (
  buckets: ScoreBucket[],
  bucketId: string,
): ScoreBucket[] => buckets.filter((entry) => entry.id !== bucketId);

export const emptyTotals = (buckets: ScoreBucket[]): BoompjeTotals =>
  Object.fromEntries(buckets.map((bucket) => [bucket.id, 0]));
