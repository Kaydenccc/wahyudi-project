import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    // Total athletes
    const totalAthletes = await Athlete.countDocuments();
    const activeAthletes = await Athlete.countDocuments({ status: "Aktif" });

    // Average attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceStats = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          hadir: { $sum: { $cond: [{ $eq: ["$status", "Hadir"] }, 1, 0] } },
        },
      },
    ]);

    const avgAttendance =
      attendanceStats.length > 0 && attendanceStats[0].total > 0
        ? Math.round((attendanceStats[0].hadir / attendanceStats[0].total) * 100 * 10) / 10
        : 0;

    // Top performers (athletes with avg score >= 85)
    const performerAgg = await PerformanceRecord.aggregate([
      { $group: { _id: "$athlete", avgScore: { $avg: "$score" } } },
      { $match: { avgScore: { $gte: 85 } } },
    ]);
    const topPerformersCount = performerAgg.length;

    // Top performers list (for table)
    const topPerformers = await PerformanceRecord.aggregate([
      { $group: { _id: "$athlete", avgScore: { $avg: "$score" }, lastScore: { $last: "$score" } } },
      { $sort: { avgScore: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "athletes",
          localField: "_id",
          foreignField: "_id",
          as: "athlete",
        },
      },
      { $unwind: "$athlete" },
      {
        $project: {
          name: "$athlete.name",
          photo: "$athlete.photo",
          category: "$athlete.category",
          position: "$athlete.position",
          avgScore: { $round: ["$avgScore", 0] },
        },
      },
    ]);

    // Weekly attendance for chart (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const weeklyAttendanceRaw = await Attendance.aggregate([
      { $match: { date: { $gte: fourWeeksAgo } } },
      {
        $group: {
          _id: { $isoWeek: "$date" },
          total: { $sum: 1 },
          hadir: { $sum: { $cond: [{ $eq: ["$status", "Hadir"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyAttendance = weeklyAttendanceRaw.map((w) => ({
      week: `W${w._id}`,
      percentage: w.total > 0 ? Math.round((w.hadir / w.total) * 100) : 0,
    }));

    // Monthly performance trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const performanceTrend = await PerformanceRecord.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const performanceTrendFormatted = performanceTrend.map((p) => {
      const monthIdx = parseInt(p._id.split("-")[1]) - 1;
      return { month: monthNames[monthIdx], score: Math.round(p.avgScore) };
    });

    // Total sessions this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalSessionsThisMonth = await Attendance.distinct("schedule", {
      date: { $gte: monthStart, $lte: monthEnd },
    }).then((ids) => ids.length);

    // Declining performance count — optimized with aggregation (no N+1)
    // Step 1: Get per-athlete attendance % in last 30 days
    const perAthleteAttendance = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$athlete",
          total: { $sum: 1 },
          hadir: { $sum: { $cond: [{ $eq: ["$status", "Hadir"] }, 1, 0] } },
        },
      },
    ]);
    const lowAttendanceIds = new Set(
      perAthleteAttendance
        .filter((a) => a.total > 0 && Math.round((a.hadir / a.total) * 100) < 60)
        .map((a) => a._id.toString())
    );

    // Step 2: Get per-athlete avg score
    const perAthletePerf = await PerformanceRecord.aggregate([
      { $group: { _id: "$athlete", avgScore: { $avg: "$score" } } },
    ]);
    const lowScoreIds = new Set(
      perAthletePerf
        .filter((a) => a.avgScore > 0 && Math.round(a.avgScore) < 60)
        .map((a) => a._id.toString())
    );

    // Combine: athletes with low attendance OR low score
    const decliningSet = new Set([...lowAttendanceIds, ...lowScoreIds]);
    const decliningCount = decliningSet.size;

    return NextResponse.json({
      totalAthletes,
      activeAthletes,
      avgAttendance,
      topPerformersCount,
      decliningCount,
      topPerformers,
      weeklyAttendance,
      performanceTrend: performanceTrendFormatted,
      totalSessionsThisMonth,
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
