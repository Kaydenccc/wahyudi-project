import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { Athlete } from "@/models/Athlete";
import { CoachNote } from "@/models/CoachNote";
import { requireAuth } from "@/lib/api-auth";
import { User } from "@/models/User";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  try {
    const auth = await requireAuth(_request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { athleteId } = await params;

    // Role-based access: Atlet can only view their own performance
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (!currentUser?.athleteId || currentUser.athleteId.toString() !== athleteId) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }
    }

    const athlete = await Athlete.findById(athleteId).lean();
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    const performances = await PerformanceRecord.find({ athlete: athleteId })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const coachNotes = await CoachNote.find({ athlete: athleteId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const latest = performances[0] as any;
    const prev = performances[1] as any;

    // Compute change between latest and previous record
    const calcChange = (curr: number, previous: number) => {
      if (previous === 0) return "+0%";
      const pct = Math.round(((curr - previous) / previous) * 100);
      return `${pct > 0 ? "+" : ""}${pct}%`;
    };

    // Build structured stats with value, unit, change
    const stats = {
      smashSpeed: {
        value: latest?.stats?.smashSpeed || 0,
        unit: "km/h",
        change: prev?.stats?.smashSpeed
          ? calcChange(latest?.stats?.smashSpeed || 0, prev.stats.smashSpeed)
          : "+0%",
      },
      footworkRating: {
        value: latest?.stats?.footworkRating || 0,
        unit: "/10",
        change: prev?.stats?.footworkRating
          ? calcChange(latest?.stats?.footworkRating || 0, prev.stats.footworkRating)
          : "+0%",
      },
      winProbability: {
        value: latest?.stats?.winProbability || 0,
        unit: "%",
        change: prev?.stats?.winProbability
          ? calcChange(latest?.stats?.winProbability || 0, prev.stats.winProbability)
          : "+0%",
      },
      netAccuracy: {
        value: latest?.stats?.netAccuracy || 0,
        unit: "%",
        change: prev?.stats?.netAccuracy
          ? calcChange(latest?.stats?.netAccuracy || 0, prev.stats.netAccuracy)
          : "+0%",
      },
    };

    const recovery = latest?.recovery || { overall: 0, sleepScore: 0, hrvStatus: "N/A" };

    return NextResponse.json({
      athlete: {
        _id: athlete._id,
        name: athlete.name,
        photo: athlete.photo,
        category: athlete.category,
        position: athlete.position,
        injuries: athlete.injuries,
      },
      performances,
      coachNotes,
      stats,
      recovery,
    });
  } catch (error) {
    console.error("GET /api/performance/[athleteId] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data performa atlet" }, { status: 500 });
  }
}
