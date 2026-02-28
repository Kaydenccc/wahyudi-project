import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { TrainingSchedule } from "@/models/TrainingSchedule";
import "@/models/TrainingProgram";
import { requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih", "Ketua Klub"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "monthly";
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const category = searchParams.get("category") || "";

    // Date range for the selected month
    const monthNum = month ? parseInt(month, 10) - 1 : new Date().getMonth();
    const yearNum = parseInt(year, 10);
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);
    const prevStartDate = new Date(yearNum, monthNum - 1, 1);
    const prevEndDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    if (type === "monthly") {
      // Get athletes, optionally filtered by category
      const athleteFilter: Record<string, unknown> = {};
      if (category && category !== "all") athleteFilter.category = category;

      const athletes = await Athlete.find(athleteFilter).lean();

      const report = await Promise.all(
        athletes.map(async (athlete) => {
          // Attendance in the period
          const attendanceRecords = await Attendance.find({
            athlete: athlete._id,
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          const totalSessions = attendanceRecords.length;
          const hadirCount = attendanceRecords.filter((r) => r.status === "Hadir").length;
          const attendancePercent = totalSessions > 0 ? Math.round((hadirCount / totalSessions) * 100) : 0;

          // Performance in the period
          const perfRecords = await PerformanceRecord.find({
            athlete: athlete._id,
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          const avgScore = perfRecords.length > 0
            ? Math.round(perfRecords.reduce((sum, p) => sum + p.score, 0) / perfRecords.length)
            : 0;

          // Get previous month data for score improvement check
          const prevPerfRecords = await PerformanceRecord.find({
            athlete: athlete._id,
            date: { $gte: prevStartDate, $lte: prevEndDate },
          }).lean();
          const prevAvgScore = prevPerfRecords.length > 0
            ? Math.round(prevPerfRecords.reduce((sum, p) => sum + p.score, 0) / prevPerfRecords.length)
            : 0;

          // Assessment: kehadiran < 60% → Perlu Evaluasi, skor naik > 10% → Progres Baik
          const scoreImproved = prevAvgScore > 0 && avgScore > 0
            ? ((avgScore - prevAvgScore) / prevAvgScore) * 100 >= 10
            : false;

          let assessment = "Stabil";
          if (scoreImproved && attendancePercent >= 60) assessment = "Progres Baik";
          else if (attendancePercent < 60 || avgScore < 60) assessment = "Perlu Evaluasi";

          return {
            name: athlete.name,
            photo: athlete.photo || "",
            category: athlete.category,
            attendance: attendancePercent,
            avgScore,
            sessions: totalSessions,
            assessment,
          };
        })
      );

      // Count total unique schedule sessions in this period
      const totalScheduleSessions = await TrainingSchedule.countDocuments({
        date: { $gte: startDate, $lte: endDate },
      });

      return NextResponse.json({ report, period: { month: monthNum + 1, year: yearNum }, totalSessions: totalScheduleSessions });
    }

    if (type === "attendance" || type === "athlete") {
      // Both report types use per-athlete data, same as monthly
      const athleteFilter: Record<string, unknown> = {};
      if (category && category !== "all") athleteFilter.category = category;

      const athletes = await Athlete.find(athleteFilter).lean();

      const report = await Promise.all(
        athletes.map(async (athlete) => {
          const attendanceRecords = await Attendance.find({
            athlete: athlete._id,
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          const totalSessionsAthlete = attendanceRecords.length;
          const hadirCount = attendanceRecords.filter((r) => r.status === "Hadir").length;
          const attendancePercent = totalSessionsAthlete > 0 ? Math.round((hadirCount / totalSessionsAthlete) * 100) : 0;

          const perfRecords = await PerformanceRecord.find({
            athlete: athlete._id,
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          const avgScore = perfRecords.length > 0
            ? Math.round(perfRecords.reduce((sum, p) => sum + p.score, 0) / perfRecords.length)
            : 0;

          // Get previous month data for score improvement check
          const prevPerfRecords = await PerformanceRecord.find({
            athlete: athlete._id,
            date: { $gte: prevStartDate, $lte: prevEndDate },
          }).lean();
          const prevAvgScore = prevPerfRecords.length > 0
            ? Math.round(prevPerfRecords.reduce((sum, p) => sum + p.score, 0) / prevPerfRecords.length)
            : 0;

          // Assessment: kehadiran < 60% → Perlu Evaluasi, skor naik > 10% → Progres Baik
          const scoreImproved = prevAvgScore > 0 && avgScore > 0
            ? ((avgScore - prevAvgScore) / prevAvgScore) * 100 >= 10
            : false;

          let assessment = "Stabil";
          if (scoreImproved && attendancePercent >= 60) assessment = "Progres Baik";
          else if (attendancePercent < 60 || avgScore < 60) assessment = "Perlu Evaluasi";

          return {
            name: athlete.name,
            category: athlete.category,
            attendance: attendancePercent,
            avgScore,
            sessions: totalSessionsAthlete,
            assessment,
          };
        })
      );

      // Sort by attendance for attendance report, by score for athlete report
      if (type === "attendance") {
        report.sort((a, b) => b.attendance - a.attendance);
      } else {
        report.sort((a, b) => b.avgScore - a.avgScore);
      }

      const totalScheduleSessions = await TrainingSchedule.countDocuments({
        date: { $gte: startDate, $lte: endDate },
      });

      return NextResponse.json({ report, period: { month: monthNum + 1, year: yearNum }, totalSessions: totalScheduleSessions });
    }

    return NextResponse.json({ report: [] });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Gagal membuat laporan" }, { status: 500 });
  }
}
