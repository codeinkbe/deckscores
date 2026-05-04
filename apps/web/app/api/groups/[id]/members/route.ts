import { NextRequest } from 'next/server';
import type { AddGroupMemberInput } from '@deckscores/shared';
import { connectToDatabase } from '@/lib/mongodb';
import { GroupModel } from '@/lib/models/group.model';
import { mapGroup } from '@/lib/mappers';
import { findActiveMember, generateMemberId, isOwner } from '@/lib/group-access';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as AddGroupMemberInput;

    await connectToDatabase();

    const doc = await GroupModel.findById(id);
    if (!doc) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!findActiveMember(doc, user.clerk_id)) {
      return Response.json({ error: 'Geen lid' }, { status: 403 });
    }

    const displayName = body.display_name?.trim();
    if (!displayName) {
      return Response.json({ error: 'Naam is verplicht' }, { status: 400 });
    }

    if (body.kind === 'guest') {
      doc.members.push({
        id: generateMemberId(),
        kind: 'guest',
        clerk_id: null,
        display_name: displayName,
        role: 'member',
        status: 'active',
        joined_at: new Date(),
      });
    } else {
      const existing = doc.members.find((m) => m.clerk_id === body.clerk_id);
      if (existing && existing.status !== 'left') {
        return Response.json({ error: 'Al lid' }, { status: 400 });
      }
      if (!isOwner(doc, user.clerk_id)) {
        return Response.json(
          { error: 'Alleen owner mag accounts toevoegen' },
          { status: 403 },
        );
      }
      if (existing) {
        existing.status = 'invited';
        existing.display_name = displayName;
      } else {
        doc.members.push({
          id: generateMemberId(),
          kind: 'account',
          clerk_id: body.clerk_id,
          display_name: displayName,
          role: 'member',
          status: 'invited',
          joined_at: new Date(),
        });
      }
    }

    await doc.save();
    return Response.json(
      { group: mapGroup(doc.toObject({ flattenMaps: true })) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('POST /api/groups/[id]/members failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
