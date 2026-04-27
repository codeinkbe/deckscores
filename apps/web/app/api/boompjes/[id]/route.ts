import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BoompjeModel } from '@/lib/models/boompje.model';
import { mapBoompje } from '@/lib/mappers';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await connectToDatabase();

    const doc = await BoompjeModel.findOne({
      _id: id,
      $or: [
        { owner_clerk_id: user.clerk_id },
        { 'participants.player.clerk_id': user.clerk_id },
      ],
    });
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });

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

    const result = await BoompjeModel.deleteOne({ _id: id, owner_clerk_id: user.clerk_id });
    if (result.deletedCount === 0) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('DELETE /api/boompjes/[id] failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
