import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CoachNote } from "@/models/CoachNote";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { createCoachNoteSchema } from "@/lib/validations/coach-note";
import { User } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const filter: Record<string, unknown> = {};
    if (athleteId) {
      if (!isValidObjectId(athleteId)) {
        return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
      }
      filter.athlete = athleteId;
    }

    // Role-based access: Atlet can only see notes about themselves
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (currentUser?.athleteId) {
        filter.athlete = currentUser.athleteId;
      } else {
        return NextResponse.json({ notes: [] });
      }
    }

    const total = await CoachNote.countDocuments(filter);
    const notes = await CoachNote.find(filter)
      .populate("athlete", "name")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ notes, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
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

    const parsedDate = new Date(validated.date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    }

    const note = await CoachNote.create({
      ...validated,
      date: parsedDate,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/coach-notes error:", error);
    return NextResponse.json({ error: "Gagal membuat catatan" }, { status: 500 });
  }
}
