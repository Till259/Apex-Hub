import { z } from "zod";
export const mapRotationQuerySchema = z.object({ version: z.coerce.number().int().min(1).max(2).default(2) });
export type MapRotationResponse = { available: boolean; source: string; fetchedAt: string; data?: unknown; message?: string };