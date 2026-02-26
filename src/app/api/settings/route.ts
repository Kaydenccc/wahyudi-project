import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClubSettings } from "@/models/ClubSettings";
import { requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Ketua Klub"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    let settings = await ClubSettings.findOne().lean();
    if (!settings) {
      settings = await ClubSettings.create({ clubName: "PB. TIGA BERLIAN" });
      settings = settings.toObject();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Ketua Klub"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ["clubName", "phone", "address", "email", "website", "logo", "favicon"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) sanitized[key] = body[key];
    }

    let settings = await ClubSettings.findOne();
    if (!settings) {
      settings = await ClubSettings.create(sanitized);
    } else {
      Object.assign(settings, sanitized);
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Gagal mengupdate pengaturan" }, { status: 500 });
  }
}
