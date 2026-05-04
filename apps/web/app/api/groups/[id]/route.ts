import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { mapGroup } from '@/lib/mappers';
import { findActiveMember, isOwner } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await connectToDatabase();

    const doc = await GroupModel.findById(id);
    if (!doc || !findActiveMember(doc, user.clerk_id)) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json({
      group: mapGroup(doc.toObject({ flattenMaps: true })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/groups/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { name?: string };

    await connectToDatabase();

    const doc = await GroupModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!isOwner(doc, user.clerk_id)) {
      return Response.json({ error: 'Alleen owner mag wijzigen' }, { status: 403 });
    }

    if (body.name !== undefined) {
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return Response.json({ error: 'Naam mag niet leeg zijn' }, { status: 400 });
      }
      doc.name = trimmed;
    }

    await doc.save();

    return Response.json({
      group: mapGroup(doc.toObject({ flattenMaps: true })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('PATCH /api/groups/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await connectToDatabase();

    const doc = await GroupModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!isOwner(doc, user.clerk_id)) {
      return Response.json({ error: 'Alleen owner mag verwijderen' }, { status: 403 });
    }

    await doc.deleteOne();
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('DELETE /api/groups/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
