import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClubSettings } from "@/models/ClubSettings";

// Public endpoint — no auth required (for sidebar logo + favicon)
export async function GET() {
  try {
    await connectDB();

    const settings = await ClubSettings.findOne()
      .select("clubName logo favicon")
      .lean();

    return NextResponse.json({
      clubName: settings?.clubName || "PB. TIGA BERLIAN",
      logo: settings?.logo || "",
      favicon: settings?.favicon || "",
    });
  } catch (error) {
    console.error("GET /api/settings/branding error:", error);
    return NextResponse.json({
      clubName: "PB. TIGA BERLIAN",
      logo: "",
      favicon: "",
    });
  }
}
