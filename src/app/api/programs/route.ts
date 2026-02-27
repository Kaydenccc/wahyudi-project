import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrainingProgram } from "@/models/TrainingProgram";
import { createProgramSchema } from "@/lib/validations/program";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    const filter: Record<string, unknown> = {};
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escapedSearch, $options: "i" };
    }
    if (type) filter.type = type;

    const programs = await TrainingProgram.find(filter)
      .populate("assignedAthletes", "name category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("GET /api/programs error:", error);
    return NextResponse.json({ error: "Gagal mengambil data program" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createProgramSchema.parse(body);

    const program = await TrainingProgram.create(validated);
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/programs error:", error);
    return NextResponse.json({ error: "Gagal membuat program" }, { status: 500 });
  }
}
