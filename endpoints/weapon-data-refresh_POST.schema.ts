import { z } from "zod";
export const weaponDataRefreshBodySchema = z.object({ confirmation: z.literal("REFRESH_WEAPON_DATA") });
export type WeaponDataRefreshResponse = { ok: boolean; updated: number; skipped: number; source: string; dataVersion: string; fetchedAt: string; message?: string };