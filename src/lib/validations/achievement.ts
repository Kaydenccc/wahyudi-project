import { z } from "zod";

export const createAchievementSchema = z.object({
  athlete: z.string().min(1, "Atlet wajib dipilih"),
  title: z.string().min(1, "Judul prestasi wajib diisi").max(200),
  description: z.string().max(2000).default(""),
  date: z.string().min(1, "Tanggal wajib diisi"),
  category: z.enum(["Turnamen", "Kejuaraan", "Peringkat", "Lainnya"]),
  level: z.enum(["Daerah", "Nasional", "Internasional"]),
  result: z.enum(["Juara 1", "Juara 2", "Juara 3", "Partisipasi", "Lainnya"]),
  photo: z.string().optional(),
});

export const updateAchievementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  date: z.string().min(1).optional(),
  category: z.enum(["Turnamen", "Kejuaraan", "Peringkat", "Lainnya"]).optional(),
  level: z.enum(["Daerah", "Nasional", "Internasional"]).optional(),
  result: z.enum(["Juara 1", "Juara 2", "Juara 3", "Partisipasi", "Lainnya"]).optional(),
  photo: z.string().optional(),
});

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
