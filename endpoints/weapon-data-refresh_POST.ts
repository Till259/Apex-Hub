import { db } from "../helpers/db";
import { weaponDataRefreshBodySchema, type WeaponDataRefreshResponse } from "./weapon-data-refresh_POST.schema";

const SOURCE = "https://apexlens.gg/weapons/";
const DATA_VERSION = "Marked Midseason · effective 2026-09-15 · verified 2026-09-28";
const EXPECTED: Record<string,string> = {
  "R-301 Carbine":"r301","VK-47 Flatline":"flatline","Havoc Rifle":"havoc",
  "Nemesis Burst AR":"nemesis","M600 Spitfire":"spitfire",
  "Devotion LMG":"devotion","Rampage LMG":"rampage","G7 Scout":"g7",
  "30-30 Repeater":"3030","Bocek Compound Bow":"bocek","Triple Take":"triple-take",
  "P2020":"p2020","RE-45":"re45","EVA-8 Auto":"eva8",
  "Mozambique Shotgun":"mozambique","Peacekeeper":"peacekeeper","Mastiff Shotgun":"mastiff",
  "Alternator SMG":"alternator","C.A.R. SMG":"car","R-99 SMG":"r99",
  "Volt SMG":"volt","Charge Rifle":"charge-rifle","Longbow DMR":"longbow","Sentinel":"sentinel",
  "Kraber .50-Cal Sniper":"kraber",
};

function cells(row: string): string[] {
  return [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(match =>
    match[1].replace(/<[^>]*>/g," ").replace(/&times;/g,"×").replace(/&amp;/g,"&")
      .replace(/&#x27;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim()
  );
}
function numberAt(value: string | undefined): number | null {
  if (!value || /measuring|not published|not modelled|not applicable/i.test(value)) return null;
  const match = value.replace(/,/g,"").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export async function handle(request: Request): Promise<Response> {
  const token = (process.env as Record<string,string|undefined>).APEX_META_REFRESH_TOKEN;
  const supplied = request.headers.get("x-apex-meta-refresh-token");
  if (!token || !supplied || supplied !== token) return Response.json({ok:false,message:"Not authorized."},{status:401});
  const input = weaponDataRefreshBodySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ok:false,message:"Explicit refresh confirmation required."},{status:400});
  const recent = await db.selectFrom("weapons").select("updatedAt").orderBy("updatedAt","desc").limit(1).executeTakeFirst();
  if (recent && Date.now() - recent.updatedAt.getTime() < 60 * 60 * 1000) {
    return Response.json({ok:false,message:"Weapon dataset was checked within the last hour."},{status:429});
  }

  const response = await fetch(SOURCE,{headers:{Accept:"text/html"},signal:AbortSignal.timeout(15000)});
  if (!response.ok) return Response.json({ok:false,message:"Data provider returned HTTP "+response.status},{status:502});
  const html = await response.text();
  const start = html.indexOf("<tbody");
  const end = html.indexOf("</tbody>",start);
  if (start < 0 || end < 0) return Response.json({ok:false,message:"Weapon table not found. No values written."},{status:422});
  const body = html.slice(start,end);
  const parsed = [...body.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(match=>cells(match[0])).filter(row=>row.length>=10);
  if (parsed.length !== 29) return Response.json({ok:false,message:"Expected 29 weapon rows, found "+parsed.length+". No values written."},{status:422});

  const current = await db.selectFrom("weapons").select(["id","name"]).execute();
  const localIds = new Set(current.map(row=>row.id));
  const updates: Array<{id:string;name:string;body:number|null;head:number|null;mag:number|null;rpm:number|null}> = [];
  const providerNames = [
    "R-301 Carbine","VK-47 Flatline","Havoc Rifle","Hemlok Breach AR","Nemesis Burst AR",
    "M600 Spitfire","Devotion LMG","L-STAR EMG","Rampage LMG","G7 Scout","30-30 Repeater",
    "Bocek Compound Bow","Triple Take","P2020","RE-45","Wingman","EVA-8 Auto",
    "Mozambique Shotgun","Peacekeeper","Mastiff Shotgun","Alternator SMG","C.A.R. SMG",
    "Prowler PDW","R-99 SMG","Volt SMG","Charge Rifle","Longbow DMR","Sentinel",
    "Kraber .50-Cal Sniper",
  ];
  const aliases: Record<string,string> = {"Havoc Rifle":"HAVOC Rifle","RE-45":"RE-45 Auto","Kraber .50-Cal Sniper":"Kraber .50-Cal"};
  for (let index=0;index<parsed.length;index++) {
    const row=parsed[index];
    if (row.length < 7) return Response.json({ok:false,message:"Unexpected weapon row width at index "+index+". No values written."},{status:422});
    const name=providerNames[index];
    // This September baseline predates Season 31 changes to Hemlok, Wingman,
    // L-STAR and Prowler. Never stamp those values as verified/current.
    if (["Hemlok Breach AR","L-STAR EMG","Wingman","Prowler PDW"].includes(name)) {
      updates.push({id:"",name,body:null,head:null,mag:null,rpm:null});
      continue;
    }
    const localName=aliases[name] ?? name;
    const id=EXPECTED[localName] ?? EXPECTED[name];
    if (!id || !localIds.has(id)) return Response.json({ok:false,message:"Unmapped provider entry: "+name+". No values written."},{status:422});
    const rpmText=(row[6] ?? "").match(/(\d+(?:\.\d+)?)\s*rpm/i)?.[1];
    updates.push({id,name,body:numberAt(row[2]),head:numberAt(row[3]),mag:numberAt(row[5]),rpm:numberAt(rpmText)});
  }
  const fetchedAt = new Date();
  let updated = 0;
  let skipped = 0;
  for (const row of updates) {
    // Update only fields the source explicitly supplies. Older patch values
    // remain unverified and visibly carry their own source date.
    if (!row.id || (row.body === null && row.head === null && row.mag === null && row.rpm === null)) { skipped++; continue; }
    await db.updateTable("weapons").set({
      bodyDamage:row.body===null?undefined:String(row.body),
      headDamage:row.head===null?undefined:String(row.head),
      magazineSize:row.mag===null?undefined:row.mag,
      fireRate:row.rpm===null?undefined:String(row.rpm),
      sourceUrl:SOURCE,
      dataVersion:DATA_VERSION,
      verifiedAt:fetchedAt,
    }).where("id","=",row.id).execute();
    updated++;
  }
  const result: WeaponDataRefreshResponse = {
    ok:true,updated,skipped,source:SOURCE,dataVersion:DATA_VERSION,fetchedAt:fetchedAt.toISOString(),
    message:"This source is behind Season 31. Values are dated to its September 2026 baseline and must not be treated as current Cipher balance.",
  };
  return Response.json(result);
}