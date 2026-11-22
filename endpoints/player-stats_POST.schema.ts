import { z } from "zod";
export const playerStatsBodySchema = z.object({
  player: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N}_ .#-]+$/u),
  platform: z.enum(["PC","PS4","X1"]),
});
export type PlayerStatsBody = z.infer<typeof playerStatsBodySchema>;
export type PlayerStatsResponse = { available: boolean; source: string; platform?: string; player?: string; data?: unknown; message?: string };