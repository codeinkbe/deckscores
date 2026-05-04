import { NextRequest } from 'next/server';
import type { InvitePreview } from '@deckscores/shared';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { code } = await params;
    await connectToDatabase();

    const doc = await GroupModel.findOne({ invite_code: code });
    if (!doc) return Response.json({ error: 'Niet gevonden' }, { status: 404 });

    const myMembership = doc.members.find((m) => m.clerk_id === user.clerk_id);
    const owner = doc.members.find((m) => m.role === 'owner');

    const preview: InvitePreview = {
      group_id: doc._id.toString(),
      group_name: doc.name,
      invite_code: doc.invite_code,
      member_count: doc.members.filter((m) => m.status === 'active').length,
      invited_by: owner?.display_name ?? '',
      already_member: Boolean(myMembership && myMembership.status === 'active'),
    };

    return Response.json({ invite: preview });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/invites/[code] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
