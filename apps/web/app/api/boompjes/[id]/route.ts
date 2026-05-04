import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BoompjeModel } from '@/lib/models/boompje.model';
import { GroupModel } from '@/lib/models/group.model';
import { mapBoompje } from '@/lib/mappers';
import { findActiveMember } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

const userIsGroupMember = async (groupId: string, clerkId: string) => {
  const group = await GroupModel.findById(groupId);
  return Boolean(group && findActiveMember(group, clerkId));
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await connectToDatabase();

    const doc = await BoompjeModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });

    if (!(await userIsGroupMember(doc.group_id, user.clerk_id))) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json({
      boompje: mapBoompje(doc.toObject({ flattenMaps: true })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/boompjes/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await connectToDatabase();

    const doc = await BoompjeModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (doc.owner_clerk_id !== user.clerk_id) {
      return Response.json({ error: 'Alleen owner mag verwijderen' }, { status: 403 });
    }

    await doc.deleteOne();
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('DELETE /api/boompjes/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
