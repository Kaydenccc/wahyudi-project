import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { updateAthleteSchema } from "@/lib/validations/athlete";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { unlink } from "fs/promises";
import path from "path";

async function deletePhotoFile(photoUrl: string | undefined) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", photoUrl);
    await unlink(filePath);
  } catch {
    // File may not exist, ignore
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(_request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const athlete = await Athlete.findById(id).lean();
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    // Compute attendance percentage (last 30 days)
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

    // Compute avg performance score
    const perfAgg = await PerformanceRecord.aggregate([
      { $match: { athlete: athlete._id } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    const avgScore = perfAgg.length > 0 ? Math.round(perfAgg[0].avgScore) : 0;

    // Get recent performance records
    const recentPerf = await PerformanceRecord.find({ athlete: athlete._id })
      .sort({ date: -1 })
      .limit(5)
      .select("date score type")
      .lean();

    return NextResponse.json({ ...athlete, attendance, avgScore, recentPerformance: recentPerf });
  } catch (error) {
    console.error("GET /api/athletes/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data atlet" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validated = updateAthleteSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.dateOfBirth) updateData.dateOfBirth = new Date(validated.dateOfBirth);
    if (validated.joinDate) updateData.joinDate = new Date(validated.joinDate);

    // Delete old photo if a new one is being uploaded
    if (validated.photo) {
      const existing = await Athlete.findById(id).select("photo").lean();
      if (existing?.photo && existing.photo !== validated.photo) {
        await deletePhotoFile(existing.photo);
      }
    }

    const athlete = await Athlete.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(athlete);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("PUT /api/athletes/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate data atlet" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(_request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const athlete = await Athlete.findByIdAndDelete(id);
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    // Delete photo file from disk
    await deletePhotoFile(athlete.photo);

    return NextResponse.json({ message: "Atlet berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/athletes/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus atlet" }, { status: 500 });
  }
}
