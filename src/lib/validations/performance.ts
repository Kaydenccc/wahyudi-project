import { z } from "zod";

export const createPerformanceSchema = z.object({
  athlete: z.string().min(1, "Atlet wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  score: z.number().min(0).max(100),
  type: z.enum(["Training", "Post-Match"]),
  stats: z.object({
    smashSpeed: z.number().optional(),
    footworkRating: z.number().optional(),
    winProbability: z.number().optional(),
    netAccuracy: z.number().optional(),
  }).default({}),
  recovery: z.object({
    overall: z.number().optional(),
    sleepScore: z.number().optional(),
    hrvStatus: z.string().optional(),
  }).default({}),
  trend: z.enum(["up", "down", "neutral"]).default("neutral"),
  change: z.string().default("0%"),
});

export type CreatePerformanceInput = z.infer<typeof createPerformanceSchema>;
