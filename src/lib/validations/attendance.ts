import { z } from "zod";

export const bulkAttendanceSchema = z.object({
  scheduleId: z.string().min(1, "Schedule wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  markedBy: z.string().min(1, "Pelatih wajib diisi"),
  records: z.array(z.object({
    athleteId: z.string().min(1),
    status: z.enum(["Hadir", "Izin", "Tidak Hadir"]),
  })).min(1, "Minimal 1 record absensi"),
});

export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
