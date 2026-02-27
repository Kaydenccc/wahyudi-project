import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { requireRole } from "@/lib/api-auth";

/**
 * One-time migration to fix legacy category values in the Athlete collection.
 * Maps old values ("Senior", "Junior") to the correct enum values ("Dewasa", "Remaja").
 * Only accessible by Admin.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const categoryMap: Record<string, string> = {
      Senior: "Dewasa",
      Junior: "Remaja",
    };

    const results: string[] = [];

    for (const [oldVal, newVal] of Object.entries(categoryMap)) {
      const res = await Athlete.updateMany(
        { category: oldVal },
        { $set: { category: newVal } }
      );
      if (res.modifiedCount > 0) {
        results.push(`${oldVal} → ${newVal}: ${res.modifiedCount} atlet diupdate`);
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ message: "Tidak ada data yang perlu dimigrasikan." });
    }

    return NextResponse.json({
      message: "Migrasi kategori berhasil!",
      details: results,
    });
  } catch (error) {
    console.error("POST /api/migrate error:", error);
    return NextResponse.json({ error: "Migrasi gagal" }, { status: 500 });
  }
}
