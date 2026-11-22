import { z } from "zod";
export const legendDataRefreshBodySchema = z.object({ confirmation: z.literal("REFRESH_LEGEND_DATA") });
export type LegendDataRefreshResponse = {
  ok: boolean;
  updated: number;
  skipped: number;
  source: string;
  fetchedAt: string;
  message: string;
};