import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { mapGroup } from '@/lib/mappers';
import { findActiveMember, isOwner } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ id: string; memberId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id, memberId } = await params;
    await connectToDatabase();

    const doc = await GroupModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!findActiveMember(doc, user.clerk_id)) {
      return Response.json({ error: 'Geen lid' }, { status: 403 });
    }

    const target = doc.members.find((m) => m.id === memberId);
    if (!target) return Response.json({ error: 'Lid niet gevonden' }, { status: 404 });

    const isSelf = target.kind === 'account' && target.clerk_id === user.clerk_id;
    if (!isSelf && !isOwner(doc, user.clerk_id)) {
      return Response.json({ error: 'Alleen owner mag verwijderen' }, { status: 403 });
    }
    if (target.role === 'owner') {
      return Response.json({ error: 'Owner kan niet verwijderd worden' }, { status: 400 });
    }

    target.status = 'left';
    await doc.save();

    return Response.json({
      group: mapGroup(doc.toObject({ flattenMaps: true })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('DELETE /api/groups/[id]/members/[memberId] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
