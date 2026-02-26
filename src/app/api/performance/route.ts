import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { createPerformanceSchema } from "@/lib/validations/performance";
import { requireAuth, requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Get all athletes with their latest performance
    const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const athletes = await Athlete.find(
      escapedSearch ? { name: { $regex: escapedSearch, $options: "i" } } : {}
    ).lean();

    const result = await Promise.all(
      athletes.map(async (athlete) => {
        const latestPerf = await PerformanceRecord.findOne({ athlete: athlete._id })
          .sort({ date: -1 })
          .lean();

        const avgScoreAgg = await PerformanceRecord.aggregate([
          { $match: { athlete: athlete._id } },
          { $group: { _id: null, avgScore: { $avg: "$score" } } },
        ]);

        const avgScore = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avgScore) : 0;
        const trend = latestPerf?.trend || "neutral";
        const change = latestPerf?.change || "0%";

        // Compute attendance for this athlete (last 30 days)
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
        const attendancePercent = attendanceAgg.length > 0 && attendanceAgg[0].total > 0
          ? Math.round((attendanceAgg[0].hadir / attendanceAgg[0].total) * 100)
          : 0;

        // Check score improvement (compare last 2 records)
        const lastTwo = await PerformanceRecord.find({ athlete: athlete._id })
          .sort({ date: -1 })
          .limit(2)
          .lean();
        const scoreImproved = lastTwo.length === 2 && lastTwo[1].score > 0
          ? ((lastTwo[0].score - lastTwo[1].score) / lastTwo[1].score) * 100 >= 10
          : false;

        // Assessment: kehadiran < 60% → Perlu Evaluasi, skor naik > 10% → Progres Baik
        let perfStatus = "Stabil";
        if (scoreImproved && attendancePercent >= 60) perfStatus = "Progres Baik";
        else if (attendancePercent < 60 || avgScore < 60) perfStatus = "Perlu Evaluasi";

        return {
          _id: athlete._id,
          name: athlete.name,
          category: athlete.category,
          position: athlete.position,
          avgScore,
          trend,
          change,
          attendance: attendancePercent,
          status: perfStatus,
        };
      })
    );

    const filtered = status ? result.filter((r) => r.status === status) : result;

    return NextResponse.json({ athletes: filtered });
  } catch (error) {
    console.error("GET /api/performance error:", error);
    return NextResponse.json({ error: "Gagal mengambil data performa" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createPerformanceSchema.parse(body);

    // Auto-compute trend and change based on previous record
    const prevRecord = await PerformanceRecord.findOne({ athlete: validated.athlete })
      .sort({ date: -1 })
      .lean();

    let trend = "neutral";
    let change = "0%";
    if (prevRecord) {
      const diff = validated.score - prevRecord.score;
      if (diff > 0) trend = "up";
      else if (diff < 0) trend = "down";
      const pct = prevRecord.score > 0 ? Math.round((diff / prevRecord.score) * 100) : 0;
      change = `${pct > 0 ? "+" : ""}${pct}%`;
    }

    const record = await PerformanceRecord.create({
      ...validated,
      date: new Date(validated.date),
      trend,
      change,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/performance error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data performa" }, { status: 500 });
  }
}
