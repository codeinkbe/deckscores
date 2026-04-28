import {
    requireUser,
    UnauthorizedError,
    unauthorizedResponse,
} from "@/lib/auth";
import { mapProfile } from "@/lib/mappers";
import { ProfileModel } from "@/lib/models/profile.model";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();
    const doc = await ProfileModel.findOne({ clerk_id: user.clerk_id });
    if (!doc) {
      return Response.json({ profile: null }, { status: 200 });
    }
    return Response.json({ profile: mapProfile(doc.toObject()) });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error("GET /api/profiles/me failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    await connectToDatabase();

    const update = {
      first_name: String(body.first_name ?? user.first_name ?? ""),
      last_name: String(body.last_name ?? user.last_name ?? ""),
      member_number: String(body.member_number ?? ""),
      email: String(body.email ?? user.email ?? ""),
    };

    const doc = await ProfileModel.findOneAndUpdate(
      { clerk_id: user.clerk_id },
      {
        $set: update,
        $setOnInsert: { clerk_id: user.clerk_id, created_at: new Date() },
      },
      { upsert: true, new: true },
    );

    return Response.json({ profile: mapProfile(doc.toObject()) });
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error("POST /api/profiles/me failed", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
