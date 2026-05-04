import type {
  Boompje,
  BoompjeTotals,
  BucketScore,
  Group,
  GroupMember,
  Participant,
  Player,
  Profile,
  ScoreBucket,
} from '@deckscores/shared';
import type { BoompjeDoc } from './models/boompje.model';
import type { GroupDoc } from './models/group.model';
import type { ProfileDoc } from './models/profile.model';

type WithId<T> = T & { _id: { toString(): string } };

type RawPlayer = {
  kind: 'account' | 'guest';
  member_id: string;
  clerk_id?: string | null;
  display_name: string;
};
type RawParticipant = { player: RawPlayer; seat: number };
type RawBucket = { id: string; label: string; seats: number[] };
type RawScore = { score: number; roem: number };
type RawGroupMember = {
  id: string;
  kind: 'account' | 'guest';
  clerk_id?: string | null;
  display_name: string;
  role: 'owner' | 'member';
  status: 'invited' | 'active' | 'left';
  joined_at: Date | string;
};

const mapPlayer = (raw: RawPlayer): Player =>
  raw.kind === 'account'
    ? {
        kind: 'account',
        member_id: raw.member_id,
        clerk_id: raw.clerk_id ?? '',
        display_name: raw.display_name,
      }
    : { kind: 'guest', member_id: raw.member_id, display_name: raw.display_name };

const mapParticipant = (raw: RawParticipant): Participant => ({
  player: mapPlayer(raw.player),
  seat: raw.seat,
});

const mapBucket = (raw: RawBucket): ScoreBucket => ({
  id: raw.id,
  label: raw.label,
  seats: [...raw.seats],
});

const mapBucketScore = (raw: RawScore): BucketScore => ({
  score: raw.score,
  roem: raw.roem,
});

const mapTotals = (raw: Record<string, number> | undefined): BoompjeTotals => ({
  ...(raw ?? {}),
});

const mapScores = (
  raw: Record<string, RawScore> | undefined,
): Record<string, BucketScore> => {
  if (!raw) return {};
  const out: Record<string, BucketScore> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = mapBucketScore(value);
  }
  return out;
};

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export const mapProfile = (doc: WithId<ProfileDoc>): Profile => ({
  id: doc._id.toString(),
  clerk_id: doc.clerk_id,
  first_name: doc.first_name,
  last_name: doc.last_name,
  email: doc.email,
  created_at: toIso(doc.created_at),
});

const mapGroupMember = (raw: RawGroupMember): GroupMember => {
  if (raw.kind === 'account') {
    return {
      id: raw.id,
      kind: 'account',
      clerk_id: raw.clerk_id ?? '',
      display_name: raw.display_name,
      role: raw.role,
      status: raw.status,
      joined_at: toIso(raw.joined_at),
    };
  }
  return {
    id: raw.id,
    kind: 'guest',
    display_name: raw.display_name,
    role: raw.role,
    status: 'active',
    joined_at: toIso(raw.joined_at),
  };
};

export const mapGroup = (doc: WithId<GroupDoc>): Group => ({
  id: doc._id.toString(),
  name: doc.name,
  created_by_clerk_id: doc.created_by_clerk_id,
  invite_code: doc.invite_code,
  members: (doc.members ?? []).map(mapGroupMember),
  created_at: toIso(doc.created_at),
});

export const mapBoompje = (doc: WithId<BoompjeDoc>): Boompje => ({
  id: doc._id.toString(),
  group_id: doc.group_id,
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
    scores: mapScores(giffie.scores),
    nat: giffie.nat,
    pit: giffie.pit,
    verzaakt: giffie.verzaakt,
  })),
  created_at: toIso(doc.created_at),
  finished_at: doc.finished_at ? toIso(doc.finished_at) : null,
});
