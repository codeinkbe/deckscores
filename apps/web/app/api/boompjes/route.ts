import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BoompjeModel } from '@/lib/models/boompje.model';
import { GroupModel } from '@/lib/models/group.model';
import { mapBoompje } from '@/lib/mappers';
import { findActiveMember } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import type { CreateBoompjeInput } from '@deckscores/shared';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const groupId = request.nextUrl.searchParams.get('group_id');
    const status = request.nextUrl.searchParams.get('status');

    if (!groupId) {
      return Response.json({ error: 'group_id is verplicht' }, { status: 400 });
    }

    await connectToDatabase();

    const group = await GroupModel.findById(groupId);
    if (!group || !findActiveMember(group, user.clerk_id)) {
      return Response.json({ error: 'Geen lid van de groep' }, { status: 403 });
    }

    const query: Record<string, unknown> = { group_id: groupId };
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

    if (!body.group_id) {
      return Response.json({ error: 'group_id is verplicht' }, { status: 400 });
    }

    await connectToDatabase();

    const group = await GroupModel.findById(body.group_id);
    if (!group || !findActiveMember(group, user.clerk_id)) {
      return Response.json({ error: 'Geen lid van de groep' }, { status: 403 });
    }

    const doc = await BoompjeModel.create({
      group_id: body.group_id,
      owner_clerk_id: user.clerk_id,
      format: body.format,
      settings: body.settings,
      participants: body.participants,
      buckets: body.buckets,
      dealer_seat: body.dealer_seat,
      status: 'open',
      totals: Object.fromEntries(body.buckets.map((b) => [b.id, 0])),
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
