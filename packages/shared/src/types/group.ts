export type GroupMemberRole = 'owner' | 'member';
export type GroupMemberStatus = 'invited' | 'active' | 'left';

export type AccountMember = {
  id: string;
  kind: 'account';
  clerk_id: string;
  display_name: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joined_at: string;
};

export type GuestMember = {
  id: string;
  kind: 'guest';
  display_name: string;
  role: GroupMemberRole;
  status: 'active';
  joined_at: string;
};

export type GroupMember = AccountMember | GuestMember;

export type Group = {
  id: string;
  name: string;
  created_by_clerk_id: string;
  invite_code: string;
  members: GroupMember[];
  created_at: string;
};

export type GroupSummary = Pick<Group, 'id' | 'name' | 'invite_code' | 'created_at'> & {
  member_count: number;
  pending_invites: number;
  is_owner: boolean;
};

export type CreateGroupInput = {
  name: string;
};

export type AddGuestMemberInput = {
  kind: 'guest';
  display_name: string;
};

export type AddAccountMemberInput = {
  kind: 'account';
  clerk_id: string;
  display_name: string;
};

export type AddGroupMemberInput = AddGuestMemberInput | AddAccountMemberInput;

export type InvitePreview = {
  group_id: string;
  group_name: string;
  invite_code: string;
  member_count: number;
  invited_by: string;
  already_member: boolean;
};

export const isAccountMember = (member: GroupMember): member is AccountMember =>
  member.kind === 'account';

export const isGuestMember = (member: GroupMember): member is GuestMember =>
  member.kind === 'guest';

export const memberDisplayName = (member: GroupMember) => member.display_name;
