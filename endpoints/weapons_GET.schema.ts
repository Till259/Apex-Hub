import { z } from "zod";
export const weaponsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});
export type WeaponsQuery = z.infer<typeof weaponsQuerySchema>;
export type WeaponsResponse = {
  weapons: Array<{
    id: string;
    name: string;
    category: string;
    ammoType: string | null;
    fireMode: string | null;
    bodyDamage: string | null;
    headDamage: string | null;
    legDamage: string | null;
    fireRate: string | null;
    magazineSize: number | null;
    reloadSeconds: string | null;
    recoilNotes: string | null;
    currentMetaTier: string | null;
    dataVersion: string | null;
    sourceUrl: string | null;
    verifiedAt: string | null;
  }>;
  dataStatus: "verified" | "partial" | "empty";
};