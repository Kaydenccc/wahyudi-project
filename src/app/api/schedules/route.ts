import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrainingSchedule } from "@/models/TrainingSchedule";
import "@/models/TrainingProgram";
import "@/models/Athlete";
import { createScheduleSchema } from "@/lib/validations/schedule";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const date = searchParams.get("date") || "";

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: dateObj, $lt: nextDay };
    }

    // Auto-update statuses based on current time using batch operations
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Mark past schedules as "Selesai"
    await TrainingSchedule.updateMany(
      {
        status: { $in: ["Terjadwal", "Berlangsung"] },
        date: { $lt: todayStart },
      },
      { $set: { status: "Selesai" } }
    );

    // For today's schedules, check time-based status transitions
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todaySchedules = await TrainingSchedule.find({
      status: { $in: ["Terjadwal", "Berlangsung"] },
      date: { $gte: todayStart, $lt: todayEnd },
    }).lean();

    const timeRegex = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
    const selesaiIds: string[] = [];
    const berlangsungIds: string[] = [];

    for (const s of todaySchedules) {
      if (!timeRegex.test(s.startTime) || !timeRegex.test(s.endTime)) continue;
      const [endH, endM] = s.endTime.split(":").map(Number);
      const [startH, startM] = s.startTime.split(":").map(Number);

      if (currentMinutes >= endH * 60 + endM) {
        selesaiIds.push(s._id.toString());
      } else if (currentMinutes >= startH * 60 + startM && s.status === "Terjadwal") {
        berlangsungIds.push(s._id.toString());
      }
    }

    if (selesaiIds.length > 0) {
      await TrainingSchedule.updateMany({ _id: { $in: selesaiIds } }, { $set: { status: "Selesai" } });
    }
    if (berlangsungIds.length > 0) {
      await TrainingSchedule.updateMany({ _id: { $in: berlangsungIds } }, { $set: { status: "Berlangsung" } });
    }

    const schedules = await TrainingSchedule.find(filter)
      .populate("program", "name type")
      .populate("athletes", "name category")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("GET /api/schedules error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Pelatih"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createScheduleSchema.parse(body);

    const schedule = await TrainingSchedule.create({
      ...validated,
      date: new Date(validated.date),
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/schedules error:", error);
    return NextResponse.json({ error: "Gagal membuat jadwal" }, { status: 500 });
  }
}
