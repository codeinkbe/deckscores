import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BoompjeModel } from '@/lib/models/boompje.model';
import { mapBoompje } from '@/lib/mappers';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import {
  calculateGiffie,
  isBoompjeFinished,
  sumGiffies,
  type AddGiffieInput,
} from '@cardapp/shared';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as AddGiffieInput;
    await connectToDatabase();

    const doc = await BoompjeModel.findOne({
      _id: id,
      $or: [
        { owner_clerk_id: user.clerk_id },
        { 'participants.player.clerk_id': user.clerk_id },
      ],
    });
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (doc.status === 'finished')
      return Response.json({ error: 'Boompje is afgesloten' }, { status: 400 });

    const buckets = doc.buckets.map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      seats: [...bucket.seats],
    }));

    const { warnings, ...calculated } = calculateGiffie(body, buckets, {
      afronden: doc.settings.afronden,
    });
    if (warnings.length > 0) {
      console.warn('calculateGiffie warnings', { boompjeId: id, warnings });
    }

    const nextNumber = doc.giffies.length + 1;
    doc.giffies.push({ ...calculated, number: nextNumber });
    doc.totals = sumGiffies(doc.giffies, buckets);

    if (isBoompjeFinished(doc.format, doc.giffies, buckets)) {
      doc.status = 'finished';
      doc.finished_at = new Date();
    }

    await doc.save();
    return Response.json(
      { boompje: mapBoompje(doc.toObject({ flattenMaps: true })) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('POST /api/boompjes/[id]/giffies failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
