import { db } from "../helpers/db";
import type { WeaponsResponse } from "./weapons_GET.schema";

export async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = (url.searchParams.get("search") ?? "").trim().slice(0, 80);
  let query = db.selectFrom("weapons").select([
    "id", "name", "category", "ammoType", "fireMode", "bodyDamage",
    "headDamage", "legDamage", "fireRate", "magazineSize",
    "reloadSeconds", "recoilNotes", "currentMetaTier", "dataVersion", "sourceUrl", "verifiedAt",
  ]);
  if (category) query = query.where("category", "=", category);
  if (search) query = query.where("name", "ilike", `%${search.replace(/[%_]/g, "")}%`);
  const weapons = await query.orderBy("category").orderBy("name").execute();
  const fullyVerified = weapons.length > 0 && weapons.every(w =>
    w.verifiedAt && w.sourceUrl && w.bodyDamage !== null && w.headDamage !== null && w.legDamage !== null
  );
  const sourced = weapons.filter(w => w.sourceUrl && w.verifiedAt).length;
  const populated = weapons.filter(w => w.bodyDamage !== null || w.headDamage !== null || w.legDamage !== null).length;
  const body: WeaponsResponse = {
    weapons: weapons.map(w => ({...w, verifiedAt: w.verifiedAt?.toISOString() ?? null})),
    dataStatus: fullyVerified ? "verified" : sourced ? "partial" : weapons.length ? "catalog-only" : "empty",
    quality: { total: weapons.length, sourced, withDamageValues: populated, fullyVerified: fullyVerified ? weapons.length : 0 },
  };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}