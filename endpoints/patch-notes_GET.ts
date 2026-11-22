import { db } from "../helpers/db";
export async function handle(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get("limit");
  const limit = Math.max(1, Math.min(50, Number(raw) || 20));
  const items = await db.selectFrom("patchNotes").selectAll().orderBy("publishedAt", "desc").limit(limit).execute();
  return Response.json({items: items.map(item => ({...item, publishedAt:item.publishedAt?.toISOString() ?? null, retrievedAt:item.retrievedAt.toISOString()}))}, {headers:{"Cache-Control":"public, max-age=120, stale-while-revalidate=600"}});
}