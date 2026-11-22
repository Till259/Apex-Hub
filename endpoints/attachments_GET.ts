import { db } from "../helpers/db";
export async function handle(request: Request): Promise<Response> {
  const weaponId = new URL(request.url).searchParams.get("weaponId")?.trim();
  if (!weaponId || weaponId.length > 80) return Response.json({attachments:[],error:"weaponId is required"},{status:400});
  const attachments = await db.selectFrom("weaponAttachments")
    .innerJoin("attachments","attachments.id","weaponAttachments.attachmentId")
    .select(["attachments.id","attachments.name","attachments.slot","attachments.effectSummary","attachments.affectedStat","attachments.effectValue","attachments.sourceUrl","attachments.verifiedAt"])
    .where("weaponAttachments.weaponId","=",weaponId).orderBy("attachments.slot").orderBy("attachments.name").execute();
  return Response.json({attachments:attachments.map(x=>({...x,verifiedAt:x.verifiedAt?.toISOString() ?? null}))});
}