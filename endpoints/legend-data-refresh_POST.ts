import { db } from "../helpers/db";
import { legendDataRefreshBodySchema, type LegendDataRefreshResponse } from "./legend-data-refresh_POST.schema";

const BASE = "https://apex.source.gs";
const LEGENDS: Record<string,{id:string;slug:string}> = {
  alter:{id:"alter",slug:"alter"}, ash:{id:"ash",slug:"ash"}, axle:{id:"axle",slug:"axle"},
  ballistic:{id:"ballistic",slug:"ballistic"}, bangalore:{id:"bangalore",slug:"bangalore"},
  bloodhound:{id:"bloodhound",slug:"bloodhound"}, catalyst:{id:"catalyst",slug:"catalyst"},
  caustic:{id:"caustic",slug:"caustic"}, conduit:{id:"conduit",slug:"conduit"},
  crypto:{id:"crypto",slug:"crypto"}, fuse:{id:"fuse",slug:"fuse"},
  gibraltar:{id:"gibraltar",slug:"gibraltar"}, horizon:{id:"horizon",slug:"horizon"},
  lifeline:{id:"lifeline",slug:"lifeline"}, loba:{id:"loba",slug:"loba"},
  "mad-maggie":{id:"mad-maggie",slug:"mad-maggie"}, mirage:{id:"mirage",slug:"mirage"},
  newcastle:{id:"newcastle",slug:"newcastle"}, octane:{id:"octane",slug:"octane"},
  pathfinder:{id:"pathfinder",slug:"pathfinder"}, rampart:{id:"rampart",slug:"rampart"},
  revenant:{id:"revenant",slug:"revenant"}, seer:{id:"seer",slug:"seer"},
  sparrow:{id:"sparrow",slug:"sparrow"}, valkyrie:{id:"valkyrie",slug:"valkyrie"},
  vantage:{id:"vantage",slug:"vantage"}, wattson:{id:"wattson",slug:"wattson"},
  wraith:{id:"wraith",slug:"wraith"},
};

function decode(value:string):string {
  return value.replace(/&amp;/g,"&").replace(/&#x27;/g,"'").replace(/&quot;/g,'"')
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/%%/g,"%").trim();
}
function clean(value:string):string {
  return decode(value.replace(/<[^>]*>/g," ").replace(/\s+/g," "));
}
function parseAbilities(html:string) {
  const expression=/<h3[^>]*>([\s\S]*?)<\/h3><span class="tag[^>]*>(Passive|Tactical|Ultimate)<\/span><\/div><p class="mt-2[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  const found=[...html.matchAll(expression)].map(match=>({
    name:clean(match[1]),type:match[2],description:clean(match[3]),
  }));
  const first=(type:string)=>found.find(item=>item.type===type);
  const passive=first("Passive"), tactical=first("Tactical"), ultimate=first("Ultimate");
  if(!passive||!tactical||!ultimate||[passive,tactical,ultimate].some(item=>!item.name||!item.description)) return null;
  return {passive:passive.name+" — "+passive.description,tactical:tactical.name+" — "+tactical.description,ultimate:ultimate.name+" — "+ultimate.description};
}

export async function handle(request:Request):Promise<Response>{
  const token=(process.env as Record<string,string|undefined>).APEX_META_REFRESH_TOKEN;
  if(!token||request.headers.get("x-apex-meta-refresh-token")!==token) return Response.json({ok:false,message:"Not authorized."},{status:401});
  const input=legendDataRefreshBodySchema.safeParse(await request.json().catch(()=>null));
  if(!input.success) return Response.json({ok:false,message:"Explicit refresh confirmation required."},{status:400});
  const version="Apex source game-file extraction · checked 2026-11-22";
  const current=await db.selectFrom("legends").select(["id","name"]).execute();
  const ids=new Set(current.map(row=>row.id));
  const parsed:Array<{id:string;passive:string;tactical:string;ultimate:string;sourceUrl:string}>=[];
  const errors:string[]=[];
  const entries=Object.values(LEGENDS);
  for(let offset=0;offset<entries.length;offset+=5){
    const batch=entries.slice(offset,offset+5);
    const results=await Promise.all(batch.map(async legend=>{
      if(!ids.has(legend.id)) return {id:legend.id,error:"Legend ID not present"};
      const url=BASE+"/legends/"+legend.slug+"/";
      try{
        const response=await fetch(url,{headers:{Accept:"text/html"},signal:AbortSignal.timeout(12000)});
        if(!response.ok) return {id:legend.id,error:"HTTP "+response.status};
        const html=await response.text();
        const abilities=parseAbilities(html);
        if(!abilities) return {id:legend.id,error:"Ability fields incomplete"};
        return {id:legend.id,...abilities,sourceUrl:url};
      }catch(error){return {id:legend.id,error:String(error).slice(0,120)};}
    }));
    for(const result of results){
      if("error" in result) errors.push(result.id+": "+result.error);
      else parsed.push(result);
    }
  }
  if(parsed.length!==entries.length) {
    const result:LegendDataRefreshResponse={ok:false,updated:0,skipped:entries.length-parsed.length,source:BASE+"/legends/",fetchedAt:new Date().toISOString(),message:"Preflight incomplete; no database rows were changed. "+errors.slice(0,8).join("; ")};
    return Response.json(result,{status:422});
  }
  const verifiedAt=new Date();
  await db.transaction().execute(async trx=>{
    for(const row of parsed) await trx.updateTable("legends").set({
      passiveAbility:row.passive,tacticalAbility:row.tactical,ultimateAbility:row.ultimate,
      sourceUrl:row.sourceUrl,verifiedAt,
    }).where("id","=",row.id).execute();
  });
  const result:LegendDataRefreshResponse={ok:true,updated:parsed.length,skipped:0,source:BASE+"/legends/",fetchedAt:verifiedAt.toISOString(),message:"All 28 legend profiles imported from game-file extracted ability pages. Version: "+version};
  return Response.json(result,{headers:{"Cache-Control":"no-store"}});
}