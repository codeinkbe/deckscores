import { NextRequest } from 'next/server';
import type { CreateGroupInput } from '@deckscores/shared';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { mapGroup } from '@/lib/mappers';
import { generateInviteCode, generateMemberId } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const docs = await GroupModel.find({
      members: {
        $elemMatch: { clerk_id: user.clerk_id, status: 'active' },
      },
    }).sort({ created_at: -1 });

    return Response.json({
      groups: docs.map((doc) => mapGroup(doc.toObject({ flattenMaps: true }))),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/groups failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as CreateGroupInput;
    if (!body.name || body.name.trim().length === 0) {
      return Response.json({ error: 'Naam is verplicht' }, { status: 400 });
    }

    await connectToDatabase();

    const ownerDisplayName = `${user.first_name} ${user.last_name}`.trim() || user.email;
    const doc = await GroupModel.create({
      name: body.name.trim(),
      created_by_clerk_id: user.clerk_id,
      invite_code: generateInviteCode(),
      members: [
        {
          id: generateMemberId(),
          kind: 'account',
          clerk_id: user.clerk_id,
          display_name: ownerDisplayName,
          role: 'owner',
          status: 'active',
          joined_at: new Date(),
        },
      ],
    });

    return Response.json(
      { group: mapGroup(doc.toObject({ flattenMaps: true })) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('POST /api/groups failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
