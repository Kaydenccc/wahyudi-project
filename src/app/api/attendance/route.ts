import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { bulkAttendanceSchema } from "@/lib/validations/attendance";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { isValidObjectId } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const scheduleId = searchParams.get("scheduleId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (scheduleId) filter.schedule = scheduleId;

    let query = Attendance.find(filter)
      .populate("athlete", "name category")
      .populate({
        path: "schedule",
        select: "venue coach startTime endTime",
        populate: { path: "program", select: "name" },
      })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      // We need to filter by athlete name after populate
      // For now, fetch all and filter
      const allRecords = await Attendance.find(filter)
        .populate("athlete", "name category")
        .populate({
          path: "schedule",
          select: "venue coach startTime endTime",
          populate: { path: "program", select: "name" },
        })
        .sort({ date: -1 })
        .lean();

      const filtered = allRecords.filter((r) => {
        const athlete = r.athlete as { name?: string } | null;
        return athlete?.name?.toLowerCase().includes(search.toLowerCase());
      });

      const total = filtered.length;
      const paged = filtered.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        records: paged,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }

    const total = await Attendance.countDocuments(filter);
    const records = await query.lean();

    return NextResponse.json({
      records,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json({ error: "Gagal mengambil data absensi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = bulkAttendanceSchema.parse(body);

    if (!isValidObjectId(validated.scheduleId)) {
      return NextResponse.json({ error: "Schedule ID tidak valid" }, { status: 400 });
    }
    for (const record of validated.records) {
      if (!isValidObjectId(record.athleteId)) {
        return NextResponse.json({ error: `Athlete ID tidak valid: ${record.athleteId}` }, { status: 400 });
      }
    }

    const operations = validated.records.map((record) => ({
      updateOne: {
        filter: { schedule: validated.scheduleId, athlete: record.athleteId },
        update: {
          $set: {
            date: new Date(validated.date),
            schedule: validated.scheduleId,
            athlete: record.athleteId,
            status: record.status,
            markedBy: validated.markedBy,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return NextResponse.json({ message: "Absensi berhasil disimpan" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: "Gagal menyimpan absensi" }, { status: 500 });
  }
}
