import { Schema, model, models, type Model } from 'mongoose';

export type ProfileDoc = {
  clerk_id: string;
  first_name: string;
  last_name: string;
  member_number: string;
  email: string;
  created_at: Date;
};

const ProfileSchema = new Schema<ProfileDoc>(
  {
    clerk_id: { type: String, required: true, unique: true, index: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    member_number: { type: String, default: '' },
    email: { type: String, required: true },
    created_at: { type: Date, default: () => new Date() },
  },
  { collection: 'profiles' },
);

ProfileSchema.index({ first_name: 'text', last_name: 'text', member_number: 'text' });

export const ProfileModel: Model<ProfileDoc> =
  (models.Profile as Model<ProfileDoc>) ?? model<ProfileDoc>('Profile', ProfileSchema);
