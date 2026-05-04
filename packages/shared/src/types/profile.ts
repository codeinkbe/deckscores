export type Profile = {
  id: string;
  clerk_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
};

export type ProfileSearchResult = Pick<
  Profile,
  'clerk_id' | 'first_name' | 'last_name'
>;
