import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Achievement } from "@/models/Achievement";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));

    const filter: Record<string, unknown> = { status: "Aktif" };
    if (category) filter.category = category;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escaped, $options: "i" };
    }

    const total = await Athlete.countDocuments(filter);
    const athletes = await Athlete.find(filter)
      .select("customId name dateOfBirth gender category position photo")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Enrich with achievement counts (single aggregation instead of N+1)
    const athleteIds = athletes.map((a: any) => a._id);
    const achievementCounts = await Achievement.aggregate([
      { $match: { athlete: { $in: athleteIds } } },
      { $group: { _id: "$athlete", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(achievementCounts.map((c: any) => [c._id.toString(), c.count]));

    const enriched = athletes.map((athlete: any) => ({
      _id: athlete._id,
      customId: athlete.customId,
      name: athlete.name,
      category: athlete.category,
      position: athlete.position,
      gender: athlete.gender,
      photo: athlete.photo,
      age: athlete.dateOfBirth
        ? Math.floor((Date.now() - new Date(athlete.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      achievementCount: countMap.get(athlete._id.toString()) || 0,
    }));

    return NextResponse.json({
      athletes: enriched,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/public/athletes error:", error);
    return NextResponse.json({ error: "Gagal mengambil data atlet" }, { status: 500 });
  }
}
