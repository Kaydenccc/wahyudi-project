import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Achievement } from "@/models/Achievement";
import { User } from "@/models/User";
import "@/models/Athlete";
import { createAchievementSchema } from "@/lib/validations/achievement";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const filter: Record<string, unknown> = {};
    if (athleteId) filter.athlete = athleteId;
    if (category) filter.category = category;
    if (level) filter.level = level;

    // Atlet can only see their own achievements
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (currentUser?.athleteId) {
        filter.athlete = currentUser.athleteId;
      } else {
        return NextResponse.json({ achievements: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
    }

    const total = await Achievement.countDocuments(filter);
    const achievements = await Achievement.find(filter)
      .populate("athlete", "name photo category")
      .populate("createdBy", "_id name")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      achievements,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/achievements error:", error);
    return NextResponse.json({ error: "Gagal mengambil data prestasi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createAchievementSchema.parse(body);

    // Validate athlete exists
    const { Athlete } = await import("@/models/Athlete");
    const athleteExists = await Athlete.findById(validated.athlete).lean();
    if (!athleteExists) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    // Atlet can only create for themselves
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (!currentUser?.athleteId || currentUser.athleteId.toString() !== validated.athlete) {
        return NextResponse.json({ error: "Anda hanya bisa menambah prestasi untuk diri sendiri" }, { status: 403 });
      }
    } else if (auth.user.role === "Ketua Klub") {
      return NextResponse.json({ error: "Ketua Klub tidak dapat menambah prestasi" }, { status: 403 });
    }

    const achievement = await Achievement.create({
      ...validated,
      date: new Date(validated.date),
      createdBy: auth.user.id,
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/achievements error:", error);
    return NextResponse.json({ error: "Gagal menyimpan prestasi" }, { status: 500 });
  }
}
