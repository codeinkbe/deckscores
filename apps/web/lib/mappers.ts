import type {
  Boompje,
  BoompjeTotals,
  BucketScore,
  Participant,
  Player,
  Profile,
  ScoreBucket,
} from '@deckscores/shared';
import type { BoompjeDoc } from './models/boompje.model';
import type { ProfileDoc } from './models/profile.model';

type WithId<T> = T & { _id: { toString(): string } };

type RawPlayer = { kind: 'account' | 'guest'; clerk_id?: string; display_name: string };
type RawParticipant = { player: RawPlayer; seat: number };
type RawBucket = { id: string; label: string; seats: number[] };
type RawScore = { score: number; roem: number };
type DynamicMap<V> = Record<string, V> | Map<string, V>;

const mapPlayer = (raw: RawPlayer): Player =>
  raw.kind === 'account'
    ? { kind: 'account', clerk_id: raw.clerk_id ?? '', display_name: raw.display_name }
    : { kind: 'guest', display_name: raw.display_name };

const mapParticipant = (raw: RawParticipant): Participant => ({
  player: mapPlayer(raw.player),
  seat: raw.seat,
});

const mapBucket = (raw: RawBucket): ScoreBucket => ({
  id: raw.id,
  label: raw.label,
  seats: [...raw.seats],
});

const mapDynamic = <V, R>(value: DynamicMap<V> | undefined, mapValue: (entry: V) => R): Record<string, R> => {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, entry]) => [key, mapValue(entry)]),
    );
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, mapValue(entry)]),
  );
};

const mapTotals = (value: DynamicMap<number> | undefined): BoompjeTotals =>
  mapDynamic(value, (score) => score);

const mapBucketScore = (raw: RawScore): BucketScore => ({
  score: raw.score,
  roem: raw.roem,
});

export const mapProfile = (doc: WithId<ProfileDoc>): Profile => ({
  id: doc._id.toString(),
  clerk_id: doc.clerk_id,
  first_name: doc.first_name,
  last_name: doc.last_name,
  member_number: doc.member_number,
  email: doc.email,
  created_at: doc.created_at.toISOString(),
});

export const mapBoompje = (doc: WithId<BoompjeDoc>): Boompje => ({
  id: doc._id.toString(),
  owner_clerk_id: doc.owner_clerk_id,
  format: doc.format,
  settings: doc.settings,
  participants: doc.participants.map(mapParticipant),
  buckets: doc.buckets.map(mapBucket),
  dealer_seat: doc.dealer_seat,
  status: doc.status,
  totals: mapTotals(doc.totals),
  giffies: doc.giffies.map((giffie) => ({
    number: giffie.number,
    gegaan_seat: giffie.gegaan_seat,
    troef: giffie.troef,
    scores: mapDynamic(giffie.scores, mapBucketScore),
    nat: giffie.nat,
    pit: giffie.pit,
    verzaakt: giffie.verzaakt,
  })),
  created_at: doc.created_at.toISOString(),
  finished_at: doc.finished_at ? doc.finished_at.toISOString() : null,
});
