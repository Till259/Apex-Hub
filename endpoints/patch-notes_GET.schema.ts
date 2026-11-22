import { z } from "zod";
export const patchNotesQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });
export type PatchNotesQuery = z.infer<typeof patchNotesQuerySchema>;
export type PatchNotesResponse = { items: Array<{ id:string; season:string|null; patchVersion:string; publishedAt:string|null; title:string; summary:string|null; sourceUrl:string; retrievedAt:string }> };