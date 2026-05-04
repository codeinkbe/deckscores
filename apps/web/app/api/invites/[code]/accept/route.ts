import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { mapGroup } from '@/lib/mappers';
import { generateMemberId } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ code: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { code } = await params;
    await connectToDatabase();

    const doc = await GroupModel.findOne({ invite_code: code });
    if (!doc) return Response.json({ error: 'Niet gevonden' }, { status: 404 });

    const displayName = `${user.first_name} ${user.last_name}`.trim() || user.email;
    const existing = doc.members.find(
      (m) => m.kind === 'account' && m.clerk_id === user.clerk_id,
    );

    if (existing) {
      existing.status = 'active';
      existing.display_name = existing.display_name || displayName;
    } else {
      doc.members.push({
        id: generateMemberId(),
        kind: 'account',
        clerk_id: user.clerk_id,
        display_name: displayName,
        role: 'member',
        status: 'active',
        joined_at: new Date(),
      });
    }

    await doc.save();
    return Response.json({
      group: mapGroup(doc.toObject({ flattenMaps: true })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('POST /api/invites/[code]/accept failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
