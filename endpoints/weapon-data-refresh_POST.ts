import { db } from "../helpers/db";
import { weaponDataRefreshBodySchema, type WeaponDataRefreshResponse } from "./weapon-data-refresh_POST.schema";

const BASE = "https://apex-legends.ttkdb.com";
const VERSION = "Season 31 Cipher · baseline 2026-11-04 · checked 2026-11-22";
const WEAPONS: Record<string,{id:string;name:string;slug:string;category:string;ammo:string}> = {
  "havoc":{id:"havoc",name:"HAVOC Rifle",slug:"havoc",category:"Sturmgewehr",ammo:"Energie"},
  "flatline":{id:"flatline",name:"VK-47 Flatline",slug:"flatline",category:"Sturmgewehr",ammo:"Schwer"},
  "hemlok":{id:"hemlok",name:"Hemlok Burst AR",slug:"hemlok",category:"Sturmgewehr",ammo:"Schwer"},
  "r301":{id:"r301",name:"R-301 Carbine",slug:"r-301",category:"Sturmgewehr",ammo:"Leicht"},
  "nemesis":{id:"nemesis",name:"Nemesis Burst AR",slug:"nemesis",category:"Sturmgewehr",ammo:"Energie"},
  "prowler":{id:"prowler",name:"Prowler Burst PDW",slug:"prowler",category:"Maschinenpistole",ammo:"Schwer"},
  "alternator":{id:"alternator",name:"Alternator SMG",slug:"alternator",category:"Maschinenpistole",ammo:"Leicht"},
  "r99":{id:"r99",name:"R-99 SMG",slug:"r-99",category:"Maschinenpistole",ammo:"Leicht"},
  "volt":{id:"volt",name:"Volt SMG",slug:"volt",category:"Maschinenpistole",ammo:"Energie"},
  "car":{id:"car",name:"C.A.R. SMG",slug:"car",category:"Maschinenpistole",ammo:"Leicht / Schwer"},
  "devotion":{id:"devotion",name:"Devotion LMG",slug:"devotion",category:"Leichtes MG",ammo:"Energie"},
  "lstar":{id:"lstar",name:"L-STAR EMG",slug:"l-star",category:"Leichtes MG",ammo:"Energie"},
  "spitfire":{id:"spitfire",name:"M600 Spitfire",slug:"spitfire",category:"Leichtes MG",ammo:"Leicht"},
  "rampage":{id:"rampage",name:"Rampage LMG",slug:"rampage",category:"Leichtes MG",ammo:"Schwer"},
  "g7":{id:"g7",name:"G7 Scout",slug:"g7-scout",category:"Präzisionsgewehr",ammo:"Leicht"},
  "triple-take":{id:"triple-take",name:"Triple Take",slug:"triple-take",category:"Präzisionsgewehr",ammo:"Energie"},
  "3030":{id:"3030",name:"30-30 Repeater",slug:"30-30-repeater",category:"Präzisionsgewehr",ammo:"Schwer"},
  "longbow":{id:"longbow",name:"Longbow DMR",slug:"longbow-dmr",category:"Scharfschützengewehr",ammo:"Scharfschütze"},
  "charge-rifle":{id:"charge-rifle",name:"Charge Rifle",slug:"charge-rifle",category:"Scharfschützengewehr",ammo:"Scharfschütze"},
  "sentinel":{id:"sentinel",name:"Sentinel",slug:"sentinel",category:"Scharfschützengewehr",ammo:"Scharfschütze"},
  "kraber":{id:"kraber",name:"Kraber .50-Cal",slug:"kraber",category:"Scharfschützengewehr",ammo:"Versorgung"},
  "eva8":{id:"eva8",name:"EVA-8 Auto",slug:"eva-8",category:"Schrotflinte",ammo:"Schrot"},
  "mozambique":{id:"mozambique",name:"Mozambique",slug:"mozambique-akimbo",category:"Schrotflinte",ammo:"Schrot"},
  "peacekeeper":{id:"peacekeeper",name:"Peacekeeper",slug:"peacekeeper",category:"Schrotflinte",ammo:"Schrot"},
  "mastiff":{id:"mastiff",name:"Mastiff",slug:"mastiff",category:"Schrotflinte",ammo:"Schrot"},
  "re45":{id:"re45",name:"RE-45 Auto",slug:"re-45-burst",category:"Pistole",ammo:"Leicht"},
  "p2020":{id:"p2020",name:"P2020",slug:"p2020",category:"Pistole",ammo:"Leicht"},
  "wingman":{id:"wingman",name:"Wingman",slug:"wingman",category:"Pistole",ammo:"Schwer"},
  "bocek":{id:"bocek",name:"Bocek Compound Bow",slug:"bocek-min",category:"Präzisionsgewehr",ammo:"Pfeile"},
};
export async function handle(request:Request):Promise<Response>{
  const token=(process.env as Record<string,string|undefined>).APEX_META_REFRESH_TOKEN;
  if(!token||request.headers.get("x-apex-meta-refresh-token")!==token)return Response.json({ok:false,message:"Not authorized."},{status:401});
  const input=weaponDataRefreshBodySchema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return Response.json({ok:false,message:"Explicit refresh confirmation required."},{status:400});
  const current=await db.selectFrom("weapons").select("id").execute();
  const ids=new Set(current.map(x=>x.id));
  const errors:string[]=[];
  const parsed:Array<{id:string;ammo:string;body:string;head:string;leg:string;rpm:string;magazine:number;sourceUrl:string}>=[];
  const entries=Object.values(WEAPONS);
  for(let offset=0;offset<entries.length;offset+=5){
    const batch=entries.slice(offset,offset+5);
    const results=await Promise.all(batch.map(async weapon=>{
      if(!ids.has(weapon.id))return {name:weapon.name,error:"weapon ID not present"};
      try{
        const sourceUrl=BASE+"/en/weapons/"+weapon.slug;
        const response=await fetch(sourceUrl,{headers:{Accept:"text/html"},signal:AbortSignal.timeout(12000)});
        if(!response.ok)return {name:weapon.name,error:"HTTP "+response.status};
        const html=await response.text();
        const damage=html.match(/<section class="detail-damage-summary"[\s\S]*?<\/section>/i)?.[0]??"";
        const body=damage.match(/aria-label="Body Damage ([0-9.]+)"/i)?.[1]??null;
        const head=damage.match(/aria-label="Head Damage ([0-9.]+)"/i)?.[1]??null;
        const leg=damage.match(/aria-label="Leg Damage ([0-9.]+)"/i)?.[1]??null;
        const stats=html.match(/<article class="card"><h3>RPM<\/h3>[\s\S]*?<\/article>/i)?.[0]??"";
        const rpmText=stats.match(/<strong>([0-9,.]+)<\/strong>/i)?.[1]??null;
        const magazineBlock=html.match(/<article class="card magazine-card">[\s\S]*?<\/article>/i)?.[0]??"";
        const magazineText=magazineBlock.match(/data-rarity="none"[\s\S]*?<strong>([0-9]+) rounds<\/strong>/i)?.[1]??null;
        if(body===null||head===null||leg===null||rpmText===null||magazineText===null)return {name:weapon.name,error:"required source fields missing"};
        return {id:weapon.id,ammo:weapon.ammo,body,head,leg,rpm:String(Number(rpmText.replace(/,/g,""))),magazine:Number(magazineText),sourceUrl};
      }catch(error){return {name:weapon.name,error:String(error).slice(0,140)};}
    }));
    for(const result of results){
      if("error" in result)errors.push(result.name+": "+result.error);
      else parsed.push(result);
    }
  }
  if(parsed.length!==entries.length){
    const result:WeaponDataRefreshResponse={ok:false,updated:0,skipped:entries.length-parsed.length,source:BASE+"/en",dataVersion:VERSION,fetchedAt:new Date().toISOString(),message:"Preflight incomplete; no database rows were changed. "+errors.slice(0,8).join("; ")};
    return Response.json(result,{status:422});
  }
  const existingVersion=await db.selectFrom("weapons").select("id").where("dataVersion","=",VERSION).execute();
  if(existingVersion.length===entries.length)return Response.json({ok:false,message:"This dataset version has already been fully imported."},{status:409});
  const fetchedAt=new Date();
  await db.transaction().execute(async trx=>{
    for(const row of parsed)await trx.updateTable("weapons").set({
      ammoType:row.ammo,bodyDamage:row.body,headDamage:row.head,legDamage:row.leg,
      fireRate:row.rpm,magazineSize:row.magazine,sourceUrl:row.sourceUrl,
      dataVersion:VERSION,verifiedAt:fetchedAt,
    }).where("id","=",row.id).execute();
  });
  const result:WeaponDataRefreshResponse={ok:true,updated:parsed.length,skipped:0,source:BASE+"/en",dataVersion:VERSION,fetchedAt:fetchedAt.toISOString(),message:"All mapped Season 31 Cipher weapon profiles passed preflight and were imported transactionally."};
  return Response.json(result,{headers:{"Cache-Control":"no-store"}});
}