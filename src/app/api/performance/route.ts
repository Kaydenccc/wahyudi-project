import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { createPerformanceSchema } from "@/lib/validations/performance";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { User } from "@/models/User";
import { ZodError } from "zod";
import { isValidObjectId } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Role-based access: Atlet can only see their own performance
    const athleteFilter: Record<string, unknown> = {};
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (currentUser?.athleteId) {
        athleteFilter._id = currentUser.athleteId;
      } else {
        return NextResponse.json({ athletes: [] });
      }
    }

    // Get all athletes
    const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    if (escapedSearch) athleteFilter.name = { $regex: escapedSearch, $options: "i" };
    const athletes = await Athlete.find(athleteFilter).lean();

    const athleteIds = athletes.map((a) => a._id);

    // Batch aggregations to avoid N+1 queries
    const [avgScoresAgg, latestPerfAgg, last2Agg, attendanceAggResult] = await Promise.all([
      // Batch: avg scores per athlete
      PerformanceRecord.aggregate([
        { $match: { athlete: { $in: athleteIds } } },
        { $group: { _id: "$athlete", avgScore: { $avg: "$score" } } },
      ]),
      // Batch: latest performance per athlete (trend + change)
      PerformanceRecord.aggregate([
        { $match: { athlete: { $in: athleteIds } } },
        { $sort: { date: -1 } },
        { $group: { _id: "$athlete", trend: { $first: "$trend" }, change: { $first: "$change" } } },
      ]),
      // Batch: last 2 scores per athlete for improvement check
      PerformanceRecord.aggregate([
        { $match: { athlete: { $in: athleteIds } } },
        { $sort: { date: -1 } },
        { $group: { _id: "$athlete", scores: { $push: "$score" } } },
        { $project: { _id: 1, first: { $arrayElemAt: ["$scores", 0] }, second: { $arrayElemAt: ["$scores", 1] }, count: { $size: "$scores" } } },
      ]),
      // Batch: attendance last 30 days
      (() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return Attendance.aggregate([
          { $match: { athlete: { $in: athleteIds }, date: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: "$athlete",
              total: { $sum: 1 },
              hadir: { $sum: { $cond: [{ $eq: ["$status", "Hadir"] }, 1, 0] } },
            },
          },
        ]);
      })(),
    ]);

    const avgScoreMap = new Map(avgScoresAgg.map((a: any) => [a._id.toString(), Math.round(a.avgScore)]));
    const latestPerfMap = new Map(latestPerfAgg.map((p: any) => [p._id.toString(), p]));
    const last2Map = new Map(last2Agg.map((l: any) => [l._id.toString(), l]));
    const attendanceMap = new Map(attendanceAggResult.map((a: any) => [a._id.toString(), a]));

    const result = athletes.map((athlete) => {
      const id = athlete._id.toString();
      const avgScore = avgScoreMap.get(id) || 0;
      const perf = latestPerfMap.get(id);
      const trend = perf?.trend || "neutral";
      const change = perf?.change || "0%";

      const att = attendanceMap.get(id);
      const attendancePercent = att && att.total > 0
        ? Math.round((att.hadir / att.total) * 100)
        : 0;

      const last2 = last2Map.get(id);
      const scoreImproved = last2 && last2.count >= 2 && last2.second > 0
        ? ((last2.first - last2.second) / last2.second) * 100 >= 10
        : false;

      let perfStatus = "Stabil";
      if (scoreImproved && attendancePercent >= 60) perfStatus = "Progres Baik";
      else if (attendancePercent < 60 || avgScore < 60) perfStatus = "Perlu Evaluasi";

      return {
        _id: athlete._id,
        name: athlete.name,
        photo: (athlete as any).photo || "",
        category: athlete.category,
        position: athlete.position,
        avgScore,
        trend,
        change,
        attendance: attendancePercent,
        status: perfStatus,
      };
    });

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

    // Validate athlete exists
    if (!isValidObjectId(validated.athlete)) {
      return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
    }
    const athleteExists = await Athlete.findById(validated.athlete).select("_id").lean();
    if (!athleteExists) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    const parsedDate = new Date(validated.date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    }

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
      date: parsedDate,
      trend,
      change,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/performance error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data performa" }, { status: 500 });
  }
}
