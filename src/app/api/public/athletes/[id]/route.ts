import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Achievement } from "@/models/Achievement";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { Attendance } from "@/models/Attendance";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Exclude sensitive fields: phone, address
    const athlete = await Athlete.findById(id)
      .select("customId name dateOfBirth gender category position status height weight photo joinDate")
      .lean() as any;

    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    // Calculate age
    const age = athlete.dateOfBirth
      ? Math.floor((Date.now() - new Date(athlete.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Achievements
    const achievements = await Achievement.find({ athlete: id })
      .select("title description date category level result photo")
      .sort({ date: -1 })
      .lean();

    // Performance summary
    const perfAgg = await PerformanceRecord.aggregate([
      { $match: { athlete: athlete._id } },
      { $group: { _id: null, avgScore: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);
    const avgScore = perfAgg.length > 0 ? Math.round(perfAgg[0].avgScore) : 0;
    const totalSessions = perfAgg.length > 0 ? perfAgg[0].count : 0;

    // Recent performance (last 5)
    const recentPerf = await PerformanceRecord.find({ athlete: athlete._id })
      .select("date score type trend change")
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Attendance percentage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attendanceAgg = await Attendance.aggregate([
      { $match: { athlete: athlete._id, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          hadir: { $sum: { $cond: [{ $eq: ["$status", "Hadir"] }, 1, 0] } },
        },
      },
    ]);
    const attendance = attendanceAgg.length > 0 && attendanceAgg[0].total > 0
      ? Math.round((attendanceAgg[0].hadir / attendanceAgg[0].total) * 100)
      : 0;

    return NextResponse.json({
      athlete: {
        _id: athlete._id,
        customId: athlete.customId,
        name: athlete.name,
        age,
        gender: athlete.gender,
        category: athlete.category,
        position: athlete.position,
        status: athlete.status,
        height: athlete.height,
        weight: athlete.weight,
        photo: athlete.photo,
        joinDate: athlete.joinDate,
      },
      achievements,
      performance: {
        avgScore,
        attendance,
        totalSessions,
        recent: recentPerf,
      },
    });
  } catch (error) {
    console.error("GET /api/public/athletes/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data atlet" }, { status: 500 });
  }
}
