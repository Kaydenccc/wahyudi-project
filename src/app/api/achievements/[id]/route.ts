import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Achievement } from "@/models/Achievement";
import { User } from "@/models/User";
import { updateAchievementSchema } from "@/lib/validations/achievement";
import { requireAuth } from "@/lib/api-auth";
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
      return NextResponse.json({ error: "ID prestasi tidak valid" }, { status: 400 });
    }

    const achievement = await Achievement.findById(id)
      .populate("athlete", "name photo category")
      .populate("createdBy", "name")
      .lean() as any;

    if (!achievement) {
      return NextResponse.json({ error: "Prestasi tidak ditemukan" }, { status: 404 });
    }

    // Atlet can only view their own achievements
    if (auth.user.role === "Atlet") {
      const currentUser = await User.findById(auth.user.id).select("athleteId").lean() as any;
      if (currentUser?.athleteId && achievement.athlete?._id?.toString() !== currentUser.athleteId.toString()) {
        return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
      }
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error("GET /api/achievements/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data prestasi" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID prestasi tidak valid" }, { status: 400 });
    }

    const existing = await Achievement.findById(id).lean() as any;
    if (!existing) {
      return NextResponse.json({ error: "Prestasi tidak ditemukan" }, { status: 404 });
    }

    // Permission: only creator, Admin, or Pelatih can edit
    const isCreator = existing.createdBy?.toString() === auth.user.id;
    const isAdminOrCoach = auth.user.role === "Admin" || auth.user.role === "Pelatih";
    if (!isCreator && !isAdminOrCoach) {
      return NextResponse.json({ error: "Tidak memiliki akses untuk mengedit" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateAchievementSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.date) updateData.date = new Date(validated.date);

    const achievement = await Achievement.findByIdAndUpdate(id, updateData, { new: true })
      .populate("athlete", "name photo category")
      .lean();

    return NextResponse.json(achievement);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("PUT /api/achievements/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate prestasi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(_request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID prestasi tidak valid" }, { status: 400 });
    }

    const existing = await Achievement.findById(id).lean() as any;
    if (!existing) {
      return NextResponse.json({ error: "Prestasi tidak ditemukan" }, { status: 404 });
    }

    // Permission: only creator, Admin, or Pelatih can delete
    const isCreator = existing.createdBy?.toString() === auth.user.id;
    const isAdminOrCoach = auth.user.role === "Admin" || auth.user.role === "Pelatih";
    if (!isCreator && !isAdminOrCoach) {
      return NextResponse.json({ error: "Tidak memiliki akses untuk menghapus" }, { status: 403 });
    }

    await Achievement.findByIdAndDelete(id);

    return NextResponse.json({ message: "Prestasi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/achievements/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus prestasi" }, { status: 500 });
  }
}
