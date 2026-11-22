import { db } from "../helpers/db";
export async function handle(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  let query = db.selectFrom("legends").selectAll();
  const search = (params.get("search") ?? "").trim().slice(0,80);
  const legendClass = params.get("class");
  if (search) query = query.where("name", "ilike", `%${search.replace(/[%_]/g, "")}%`);
  if (legendClass) query = query.where("class", "=", legendClass);
  const legends = await query.orderBy("name").execute();
  return Response.json({legends: legends.map(x=>({...x,verifiedAt:x.verifiedAt?.toISOString() ?? null}))});
}