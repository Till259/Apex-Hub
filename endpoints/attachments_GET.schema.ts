import { z } from "zod";
export const attachmentsQuerySchema = z.object({ weaponId: z.string().min(1).max(80) });
export type AttachmentsResponse = { attachments: Array<{id:string;name:string;slot:string;effectSummary:string|null;affectedStat:string|null;effectValue:string|null;sourceUrl:string|null;verifiedAt:string|null}> };