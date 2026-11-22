import { db } from "../helpers/db";
import type { RankedRulesResponse } from "./ranked-rules_GET.schema";

export async function handle(request: Request): Promise<Response> {
  const season = new URL(request.url).searchParams.get("season");
  let query = db.selectFrom("rankedRules").select(["id","division","entryCost","season","sourceUrl","verifiedAt"]);
  if (season) query = query.where("season","=",season);
  const rows = await query.orderBy("entryCost").execute();
  const body: RankedRulesResponse = {
    season: rows[0]?.season ?? null,
    rules: rows.map(row => ({...row,verifiedAt:row.verifiedAt?.toISOString() ?? null})),
    adjustments: rows.length ? {
      challengerDiscountPercent:30,
      goliathSurchargePercent:50,
      sourceUrl:"https://www.ea.com/games/apex-legends/apex-legends/news/cipher-patch-notes",
    } : null,
  };
  return Response.json(body,{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=900"}});
}