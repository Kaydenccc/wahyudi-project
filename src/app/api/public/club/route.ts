import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClubSettings } from "@/models/ClubSettings";
import { Athlete } from "@/models/Athlete";
import { TrainingProgram } from "@/models/TrainingProgram";
import { Achievement } from "@/models/Achievement";

export async function GET() {
  try {
    await connectDB();

    const settings = await ClubSettings.findOne().lean() as any;

    const [totalAthletes, totalPrograms, totalAchievements] = await Promise.all([
      Athlete.countDocuments({ status: "Aktif" }),
      TrainingProgram.countDocuments(),
      Achievement.countDocuments(),
    ]);

    // Featured athletes: active athletes sorted by newest, with achievement counts (single aggregation)
    const featuredAthletes = await Athlete.find({ status: "Aktif" })
      .select("customId name category position photo dateOfBirth")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const athleteIds = featuredAthletes.map((a: any) => a._id);
    const achievementCounts = await Achievement.aggregate([
      { $match: { athlete: { $in: athleteIds } } },
      { $group: { _id: "$athlete", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(achievementCounts.map((c: any) => [c._id.toString(), c.count]));

    const featuredWithAchievements = featuredAthletes.map((athlete: any) => ({
      _id: athlete._id,
      customId: athlete.customId,
      name: athlete.name,
      category: athlete.category,
      position: athlete.position,
      photo: athlete.photo,
      achievementCount: countMap.get(athlete._id.toString()) || 0,
    }));

    // Recent achievements across all athletes
    const recentAchievements = await Achievement.find()
      .populate("athlete", "name photo")
      .sort({ date: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      club: {
        clubName: settings?.clubName || "PB. TIGA BERLIAN",
        logo: settings?.logo || "",
        website: settings?.website || "",
      },
      stats: {
        totalAthletes,
        totalPrograms,
        totalAchievements,
      },
      featuredAthletes: featuredWithAchievements,
      recentAchievements,
    });
  } catch (error) {
    console.error("GET /api/public/club error:", error);
    return NextResponse.json({ error: "Gagal mengambil data klub" }, { status: 500 });
  }
}
