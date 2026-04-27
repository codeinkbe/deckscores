import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProfileModel } from '@/lib/models/profile.model';
import { requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import type { ProfileSearchResult } from '@deckscores/shared';

export async function GET(request: NextRequest) {
  try {
    const me = await requireUser();
    const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) return Response.json({ results: [] });

    await connectToDatabase();

    const regex = new RegExp(escapeRegex(q), 'i');
    const docs = await ProfileModel.find({
      clerk_id: { $ne: me.clerk_id },
      $or: [{ first_name: regex }, { last_name: regex }, { member_number: regex }],
    })
      .limit(10)
      .lean();

    const results: ProfileSearchResult[] = docs.map((d) => ({
      clerk_id: d.clerk_id,
      first_name: d.first_name,
      last_name: d.last_name,
      member_number: d.member_number,
    }));

    return Response.json({ results });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error('GET /api/profiles/search failed', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

const escapeRegex = (text: string) => text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
