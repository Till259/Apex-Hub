import { metaRefreshBodySchema } from "./meta-refresh_POST.schema";
import { db } from "../helpers/db";

const SOURCE = "https://apexdb.gg/meta/";

const legendNames = [
  "Octane","Pathfinder","Wraith","Lifeline","Loba","Bangalore","Seer","Revenant",
  "Alter","Mad Maggie","Conduit","Vantage","Crypto","Valkyrie","Catalyst","Horizon",
  "Ash","Axle","Gibraltar","Bloodhound","Fuse","Wattson","Mirage","Caustic",
  "Rampart","Sparrow","Newcastle","Ballistic",
];

function safePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function handle(request: Request): Promise<Response> {
  const key = (process.env as Record<string,string|undefined>).APEX_META_REFRESH_TOKEN;
  const supplied = request.headers.get("x-apex-meta-refresh-token");
  if (!key || !supplied || supplied !== key) return Response.json({ok:false,message:"Nicht autorisiert."},{status:401});
  const recent = await db.selectFrom("weaponMetaEvidence").select("collectedAt").where("mode","=","Legend pick-rate cohort").orderBy("collectedAt","desc").limit(1).executeTakeFirst();
  if (recent && Date.now() - recent.collectedAt.getTime() < 60 * 60 * 1000) return Response.json({ok:false,message:"Meta wurde innerhalb der letzten Stunde bereits aktualisiert."},{status:429});
  const input = metaRefreshBodySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ok:false,message:"Bestätigung fehlt."},{status:400});

  const response = await fetch(SOURCE,{headers:{Accept:"text/html"},signal:AbortSignal.timeout(12000)});
  if (!response.ok) return Response.json({ok:false,message:"Meta-Quelle antwortet mit HTTP "+response.status},{status:502});
  const html = await response.text();
  const parsed: Array<{name:string;pickRate:number;band:string}> = [];
  for (const name of legendNames) {
    const re = new RegExp(safePattern(name)+"[\\s\\S]{0,100}?([0-9]+(?:\\.[0-9]+)?% picked)\\s*\\(([0-9.]+%\\s*[–-]\\s*[0-9.]+%)\\)","i");
    const match = html.match(re);
    if (!match) continue;
    const value = Number(match[1].match(/[0-9.]+/)?.[0]);
    if (Number.isFinite(value)) parsed.push({name,pickRate:value,band:match[2]});
  }
  if (parsed.length !== 28) return Response.json({ok:false,message:"Parser hat nur "+parsed.length+" von 28 Legenden erkannt; es wurden keine Daten gespeichert."},{status:422});

  const rows = await db.selectFrom("legends").select(["id","name"]).execute();
  const map = new Map(rows.map(row=>[row.name.toLowerCase(),row.id]));
  if (parsed.some(row=>!map.has(row.name.toLowerCase()))) return Response.json({ok:false,message:"Quell-Legenden passen nicht zum gespeicherten Kader."},{status:422});

  const timestamp = new Date();
  for (const row of parsed) {
    const legendId = map.get(row.name.toLowerCase())!;
    const id = "community-meta-s31-"+row.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const description = "Season 31 community meta tracker. 2,270 lookups, 23 Oct–19 Nov 2026; 95% confidence band "+row.band+". Third-party data, not an official EA ranking. Refreshed "+timestamp.toISOString();
    await db.insertInto("weaponMetaEvidence").values({
      id,weaponId:legendId,season:"Cipher / Season 31",mode:"Legend pick-rate cohort",
      sampleSize:2270,pickRate:String(row.pickRate),winRate:null,
      evidenceSummary:description,sourceUrl:SOURCE,collectedAt:timestamp,
    }).onConflict(oc=>oc.column("id").doUpdateSet({
      sampleSize:2270,pickRate:String(row.pickRate),evidenceSummary:description,
      sourceUrl:SOURCE,collectedAt:timestamp,
    })).execute();
  }
  return Response.json({ok:true,updated:parsed.length,season:"Cipher / Season 31",source:SOURCE,refreshedAt:timestamp.toISOString()});
}