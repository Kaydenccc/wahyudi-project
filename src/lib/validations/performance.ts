import { z } from "zod";

export const createPerformanceSchema = z.object({
  athlete: z.string().min(1, "Atlet wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  score: z.number().min(0).max(100),
  type: z.enum(["Training", "Post-Match"]),
  stats: z.object({
    smashSpeed: z.number().min(0).max(500).optional(),
    footworkRating: z.number().min(0).max(10).optional(),
    winProbability: z.number().min(0).max(100).optional(),
    netAccuracy: z.number().min(0).max(100).optional(),
  }).default({}),
  recovery: z.object({
    overall: z.number().min(0).max(100).optional(),
    sleepScore: z.number().min(0).max(100).optional(),
    hrvStatus: z.enum(["Baik", "Normal", "Rendah"]).optional(),
  }).default({}),
  trend: z.enum(["up", "down", "neutral"]).default("neutral"),
  change: z.string().max(20).default("0%"),
});

export type CreatePerformanceInput = z.infer<typeof createPerformanceSchema>;
