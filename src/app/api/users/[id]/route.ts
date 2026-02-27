import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";
import { Attendance } from "@/models/Attendance";
import { PerformanceRecord } from "@/models/PerformanceRecord";
import { CoachNote } from "@/models/CoachNote";
import { updateUserSchema } from "@/lib/validations/user";
import { requireRole } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(_request, ["Admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    // Check email uniqueness if email is being changed
    if (validated.email) {
      const existing = await User.findOne({
        email: validated.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
      }
    }

    // Hash password if provided
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.password) {
      updateData.password = await hashPassword(validated.password);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(_request, ["Admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id) as any;
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Cascade: if Atlet with linked Athlete, clean up dependent records
    if (user.role === "Atlet" && user.athleteId) {
      await Attendance.deleteMany({ athlete: user.athleteId });
      await PerformanceRecord.deleteMany({ athlete: user.athleteId });
      await CoachNote.deleteMany({ athlete: user.athleteId });
      await Athlete.findByIdAndDelete(user.athleteId);
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
