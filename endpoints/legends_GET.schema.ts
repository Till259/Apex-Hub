import { z } from "zod";
export const legendsQuerySchema = z.object({ search: z.string().optional(), class: z.string().optional() });
export type LegendsResponse = { legends: Array<{id:string;name:string;class:string|null;tacticalAbility:string|null;passiveAbility:string|null;ultimateAbility:string|null;roleNotes:string|null;sourceUrl:string|null;verifiedAt:string|null}> };