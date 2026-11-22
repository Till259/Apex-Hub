import { db } from "../helpers/db";
export async function handle(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const season = params.get("season");
  const mode = params.get("mode");
  let periodsQuery = db.selectFrom("weaponMetaPeriods").selectAll();
  let evidenceQuery = db.selectFrom("weaponMetaEvidence").selectAll();
  if (season) {
    periodsQuery = periodsQuery.where("season", "=", season);
    evidenceQuery = evidenceQuery.where("season", "=", season);
  }
  if (mode) evidenceQuery = evidenceQuery.where("mode", "=", mode);
  const [periods, evidence] = await Promise.all([periodsQuery.orderBy("season", "desc").execute(), evidenceQuery.orderBy("collectedAt", "desc").execute()]);
  return Response.json({
    periods: periods.map(x=>({...x,verifiedAt:x.verifiedAt?.toISOString() ?? null})),
    evidence: evidence.map(x=>({...x,collectedAt:x.collectedAt.toISOString()})),
    sourcePolicy: { official:"EA/Respawn patch notes", community:"Third-party tracker samples, clearly identified", noGuesses:true },
  });
}