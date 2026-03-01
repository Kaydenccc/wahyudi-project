import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrainingProgram } from "@/models/TrainingProgram";
import { TrainingSchedule } from "@/models/TrainingSchedule";
import { Attendance } from "@/models/Attendance";
import { updateProgramSchema } from "@/lib/validations/program";
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
      return NextResponse.json({ error: "ID program tidak valid" }, { status: 400 });
    }

    const program = await TrainingProgram.findById(id)
      .populate("assignedAthletes", "name category status")
      .lean();

    if (!program) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("GET /api/programs/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data program" }, { status: 500 });
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
      return NextResponse.json({ error: "ID program tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const validated = updateProgramSchema.parse(body);

    const program = await TrainingProgram.findByIdAndUpdate(id, validated, { new: true }).lean();
    if (!program) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("PUT /api/programs/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate program" }, { status: 500 });
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
      return NextResponse.json({ error: "ID program tidak valid" }, { status: 400 });
    }

    const program = await TrainingProgram.findByIdAndDelete(id);
    if (!program) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    // Cascade: delete related schedules and their attendance records
    const schedules = await TrainingSchedule.find({ program: id }).select("_id").lean();
    const scheduleIds = schedules.map((s) => s._id);
    if (scheduleIds.length > 0) {
      await Attendance.deleteMany({ schedule: { $in: scheduleIds } });
      await TrainingSchedule.deleteMany({ program: id });
    }

    return NextResponse.json({ message: "Program berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/programs/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus program" }, { status: 500 });
  }
}
