import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CoachNote } from "@/models/CoachNote";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { createCoachNoteSchema } from "@/lib/validations/coach-note";
import { isValidObjectId } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId") || "";

    const filter: Record<string, unknown> = {};
    if (athleteId) filter.athlete = athleteId;

    const notes = await CoachNote.find(filter)
      .populate("athlete", "name")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("GET /api/coach-notes error:", error);
    return NextResponse.json({ error: "Gagal mengambil catatan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createCoachNoteSchema.parse(body);

    if (!isValidObjectId(validated.athlete)) {
      return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
    }

    const note = await CoachNote.create({
      ...validated,
      date: new Date(validated.date),
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/coach-notes error:", error);
    return NextResponse.json({ error: "Gagal membuat catatan" }, { status: 500 });
  }
}
