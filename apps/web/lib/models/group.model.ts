import { Schema, model, models, type Model } from 'mongoose';
import type {
  GroupMemberRole,
  GroupMemberStatus,
} from '@deckscores/shared';

type GroupMemberDoc = {
  id: string;
  kind: 'account' | 'guest';
  clerk_id: string | null;
  display_name: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joined_at: Date;
};

export type GroupDoc = {
  name: string;
  created_by_clerk_id: string;
  invite_code: string;
  members: GroupMemberDoc[];
  created_at: Date;
};

const GroupMemberSchema = new Schema<GroupMemberDoc>(
  {
    id: { type: String, required: true },
    kind: { type: String, enum: ['account', 'guest'], required: true },
    clerk_id: { type: String, default: null },
    display_name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    status: {
      type: String,
      enum: ['invited', 'active', 'left'],
      default: 'active',
    },
    joined_at: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const GroupSchema = new Schema<GroupDoc>(
  {
    name: { type: String, required: true },
    created_by_clerk_id: { type: String, required: true, index: true },
    invite_code: { type: String, required: true, unique: true, index: true },
    members: { type: [GroupMemberSchema], default: [] },
    created_at: { type: Date, default: () => new Date() },
  },
  { collection: 'groups' },
);

GroupSchema.index({ 'members.clerk_id': 1 });

export const GroupModel: Model<GroupDoc> =
  (models.Group as Model<GroupDoc>) ?? model<GroupDoc>('Group', GroupSchema);
