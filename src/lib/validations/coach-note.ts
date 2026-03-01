import { z } from "zod";

export const createCoachNoteSchema = z.object({
  athlete: z.string().min(1, "Atlet wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  type: z.enum(["POST-MATCH", "TRAINING"]),
  content: z.string().min(1, "Konten wajib diisi").max(5000, "Konten maksimal 5000 karakter"),
  coach: z.string().min(1, "Pelatih wajib diisi").max(100),
});

export type CreateCoachNoteInput = z.infer<typeof createCoachNoteSchema>;
