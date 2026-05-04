import { Schema, model, models, type Model } from 'mongoose';
import type {
  BoompjeFormat,
  BoompjeStatus,
  NumPlayers,
  Op16eActie,
} from '@deckscores/shared';

type PlayerDoc = {
  kind: 'account' | 'guest';
  member_id: string;
  clerk_id: string | null;
  display_name: string;
};

type ParticipantDoc = {
  player: PlayerDoc;
  seat: number;
};

type ScoreBucketDoc = {
  id: string;
  label: string;
  seats: number[];
};

type BucketScoreDoc = {
  score: number;
  roem: number;
};

type GiffieDoc = {
  number: number;
  gegaan_seat: number;
  troef: 'klaver' | 'hart' | 'schoppen' | 'ruiten';
  scores: Record<string, BucketScoreDoc>;
  nat: boolean;
  pit: string | null;
  verzaakt: string | null;
};

export type BoompjeDoc = {
  group_id: string;
  owner_clerk_id: string;
  format: BoompjeFormat;
  settings: {
    afronden: boolean;
    deler_aangeven: boolean;
    op_16e_actie: Op16eActie;
    num_players: NumPlayers;
  };
  participants: ParticipantDoc[];
  buckets: ScoreBucketDoc[];
  dealer_seat: number;
  status: BoompjeStatus;
  totals: Record<string, number>;
  giffies: GiffieDoc[];
  created_at: Date;
  finished_at: Date | null;
};

const PlayerSchema = new Schema<PlayerDoc>(
  {
    kind: { type: String, enum: ['account', 'guest'], required: true },
    member_id: { type: String, required: true },
    clerk_id: { type: String, default: null },
    display_name: { type: String, required: true },
  },
  { _id: false },
);

const ParticipantSchema = new Schema<ParticipantDoc>(
  {
    player: { type: PlayerSchema, required: true },
    seat: { type: Number, required: true },
  },
  { _id: false },
);

const ScoreBucketSchema = new Schema<ScoreBucketDoc>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    seats: { type: [Number], required: true },
  },
  { _id: false },
);

const GiffieSchema = new Schema<GiffieDoc>(
  {
    number: { type: Number, required: true },
    gegaan_seat: { type: Number, required: true },
    troef: {
      type: String,
      enum: ['klaver', 'hart', 'schoppen', 'ruiten'],
      required: true,
    },
    scores: { type: Schema.Types.Mixed, default: {} },
    nat: { type: Boolean, default: false },
    pit: { type: String, default: null },
    verzaakt: { type: String, default: null },
  },
  { _id: false },
);

const BoompjeSchema = new Schema<BoompjeDoc>(
  {
    group_id: { type: String, required: true, index: true },
    owner_clerk_id: { type: String, required: true, index: true },
    format: {
      type: String,
      enum: ['16_giffies', '1000_punten', '1500_punten'],
      required: true,
    },
    settings: {
      afronden: { type: Boolean, default: true },
      deler_aangeven: { type: Boolean, default: false },
      op_16e_actie: { type: String, enum: ['maken', 'draaien'], default: 'maken' },
      num_players: { type: Number, enum: [2, 3, 4], default: 4 },
    },
    participants: {
      type: [ParticipantSchema],
      required: true,
      validate: (value: ParticipantDoc[]) => value.length >= 2 && value.length <= 4,
    },
    buckets: {
      type: [ScoreBucketSchema],
      required: true,
      validate: (value: ScoreBucketDoc[]) => value.length >= 2,
    },
    dealer_seat: { type: Number, required: true },
    status: { type: String, enum: ['open', 'finished'], default: 'open', index: true },
    totals: { type: Schema.Types.Mixed, default: {} },
    giffies: { type: [GiffieSchema], default: [] },
    created_at: { type: Date, default: () => new Date() },
    finished_at: { type: Date, default: null },
  },
  { collection: 'boompjes', minimize: false },
);

export const BoompjeModel: Model<BoompjeDoc> =
  (models.Boompje as Model<BoompjeDoc>) ?? model<BoompjeDoc>('Boompje', BoompjeSchema);
