import { randomUUID } from 'node:crypto';
import { GroupModel, type GroupDoc } from './models/group.model';

const INVITE_CODE_LENGTH = 8;
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateInviteCode = (): string => {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    code += INVITE_CODE_ALPHABET[index];
  }
  return code;
};

export const generateMemberId = (): string => randomUUID();

export type GroupDocWithId = GroupDoc & { _id: { toString(): string } };

export const findActiveMember = (
  doc: GroupDoc,
  clerkId: string,
) => doc.members.find((m) => m.clerk_id === clerkId && m.status === 'active');

export const isOwner = (doc: GroupDoc, clerkId: string) =>
  Boolean(findActiveMember(doc, clerkId)?.role === 'owner');

export const requireGroupForUser = async (
  groupId: string,
  clerkId: string,
): Promise<GroupDocWithId | null> => {
  const doc = await GroupModel.findById(groupId);
  if (!doc) return null;
  if (!findActiveMember(doc, clerkId)) return null;
  return doc as unknown as GroupDocWithId;
};
