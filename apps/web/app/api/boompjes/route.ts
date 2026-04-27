import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BoompjeModel } from '@/lib/models/boompje.model';
import { mapBoompje } from '@/lib/mappers';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { emptyTotals, type CreateBoompjeInput } from '@deckscores/shared';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const status = request.nextUrl.searchParams.get('status');
    await connectToDatabase();

    const query: Record<string, unknown> = {
      $or: [
        { owner_clerk_id: user.clerk_id },
        { 'participants.player.clerk_id': user.clerk_id },
      ],
    };
    if (status === 'open' || status === 'finished') query.status = status;

    const docs = await BoompjeModel.find(query)
      .sort({ created_at: -1 })
      .limit(100);

    return Response.json({
      boompjes: docs.map((doc) => mapBoompje(doc.toObject({ flattenMaps: true }))),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/boompjes failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as CreateBoompjeInput;
    await connectToDatabase();

    const doc = await BoompjeModel.create({
      owner_clerk_id: user.clerk_id,
      format: body.format,
      settings: body.settings,
      participants: body.participants,
      buckets: body.buckets,
      dealer_seat: body.dealer_seat,
      status: 'open',
      totals: emptyTotals(body.buckets),
      giffies: [],
    });

    return Response.json(
      { boompje: mapBoompje(doc.toObject({ flattenMaps: true })) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('POST /api/boompjes failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
