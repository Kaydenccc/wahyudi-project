import { z } from "zod";

export const createScheduleSchema = z.object({
  program: z.string().min(1, "Program wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  day: z.string().min(1),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().min(1, "Jam selesai wajib diisi"),
  venue: z.string().min(1, "Tempat wajib diisi"),
  coach: z.string().min(1, "Pelatih wajib diisi"),
  athletes: z.array(z.string()).default([]),
  status: z.enum(["Selesai", "Berlangsung", "Terjadwal"]).default("Terjadwal"),
  notes: z.string().default(""),
});

// Manual partial schema WITHOUT .default() to prevent wiping existing data
export const updateScheduleSchema = z.object({
  program: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  day: z.string().min(1).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  coach: z.string().min(1).optional(),
  athletes: z.array(z.string()).optional(),
  status: z.enum(["Selesai", "Berlangsung", "Terjadwal"]).optional(),
  notes: z.string().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
