import { z } from "zod";

export const createScheduleSchema = z.object({
  program: z.string().min(1, "Program wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  day: z.string().min(1),
  startTime: z.string().min(1, "Jam mulai wajib diisi").regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid (HH:mm)"),
  endTime: z.string().min(1, "Jam selesai wajib diisi").regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid (HH:mm)"),
  venue: z.string().min(1, "Tempat wajib diisi").max(200),
  coach: z.string().min(1, "Pelatih wajib diisi").max(100),
  athletes: z.array(z.string()).default([]),
  status: z.enum(["Selesai", "Berlangsung", "Terjadwal"]).default("Terjadwal"),
  notes: z.string().max(2000).default(""),
});

// Manual partial schema WITHOUT .default() to prevent wiping existing data
export const updateScheduleSchema = z.object({
  program: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  day: z.string().min(1).optional(),
  startTime: z.string().min(1).regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid (HH:mm)").optional(),
  endTime: z.string().min(1).regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid (HH:mm)").optional(),
  venue: z.string().min(1).max(200).optional(),
  coach: z.string().min(1).max(100).optional(),
  athletes: z.array(z.string()).optional(),
  status: z.enum(["Selesai", "Berlangsung", "Terjadwal"]).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
