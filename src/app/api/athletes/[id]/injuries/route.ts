import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { requireRole } from "@/lib/api-auth";
import { isValidObjectId } from "mongoose";

// POST: Add a new injury
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { type, date, severity, recoveryWeeks } = body;

    if (!type || !date) {
      return NextResponse.json(
        { error: "Jenis cedera dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    const athlete = await Athlete.findById(id);
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    athlete.injuries.push({
      type,
      date: new Date(date),
      status: "Dalam Pemulihan",
      severity: severity || "Ringan",
      recoveryWeeks: recoveryWeeks || 4,
    });

    await athlete.save();

    return NextResponse.json({ message: "Cedera berhasil ditambahkan", injuries: athlete.injuries }, { status: 201 });
  } catch (error) {
    console.error("POST /api/athletes/[id]/injuries error:", error);
    return NextResponse.json({ error: "Gagal menambahkan cedera" }, { status: 500 });
  }
}

// PUT: Update injury status (e.g., mark as recovered)
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
      return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { injuryId, status } = body;

    if (!injuryId || !status) {
      return NextResponse.json(
        { error: "ID cedera dan status baru wajib diisi" },
        { status: 400 }
      );
    }

    const athlete = await Athlete.findById(id);
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    const injury = athlete.injuries.id(injuryId);
    if (!injury) {
      return NextResponse.json({ error: "Data cedera tidak ditemukan" }, { status: 404 });
    }

    injury.status = status;
    await athlete.save();

    return NextResponse.json({ message: "Status cedera berhasil diperbarui", injuries: athlete.injuries });
  } catch (error) {
    console.error("PUT /api/athletes/[id]/injuries error:", error);
    return NextResponse.json({ error: "Gagal memperbarui cedera" }, { status: 500 });
  }
}

// DELETE: Remove an injury
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID atlet tidak valid" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const injuryId = searchParams.get("injuryId");

    if (!injuryId) {
      return NextResponse.json({ error: "ID cedera wajib diisi" }, { status: 400 });
    }

    const athlete = await Athlete.findById(id);
    if (!athlete) {
      return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });
    }

    athlete.injuries.pull(injuryId);
    await athlete.save();

    return NextResponse.json({ message: "Data cedera berhasil dihapus", injuries: athlete.injuries });
  } catch (error) {
    console.error("DELETE /api/athletes/[id]/injuries error:", error);
    return NextResponse.json({ error: "Gagal menghapus cedera" }, { status: 500 });
  }
}
