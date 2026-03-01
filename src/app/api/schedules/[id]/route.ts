import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrainingSchedule } from "@/models/TrainingSchedule";
import { Attendance } from "@/models/Attendance";
import "@/models/TrainingProgram";
import "@/models/Athlete";
import { updateScheduleSchema } from "@/lib/validations/schedule";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { ZodError } from "zod";
import { isValidObjectId } from "mongoose";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(_request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID jadwal tidak valid" }, { status: 400 });
    }

    const schedule = await TrainingSchedule.findById(id)
      .populate("program", "name type duration")
      .populate("athletes", "name category status")
      .lean();

    if (!schedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("GET /api/schedules/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
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

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID jadwal tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const validated = updateScheduleSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.date) updateData.date = new Date(validated.date);

    const schedule = await TrainingSchedule.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!schedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("PUT /api/schedules/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate jadwal" }, { status: 500 });
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

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID jadwal tidak valid" }, { status: 400 });
    }

    const schedule = await TrainingSchedule.findByIdAndDelete(id);
    if (!schedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Cascade: delete related attendance records
    await Attendance.deleteMany({ schedule: id });

    return NextResponse.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/schedules/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}
