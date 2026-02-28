import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CoachNote } from "@/models/CoachNote";
import { requireRole } from "@/lib/api-auth";
import { isValidObjectId } from "mongoose";

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
      return NextResponse.json({ error: "ID catatan tidak valid" }, { status: 400 });
    }

    const note = await CoachNote.findByIdAndDelete(id);
    if (!note) {
      return NextResponse.json({ error: "Catatan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/coach-notes/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus catatan" }, { status: 500 });
  }
}
