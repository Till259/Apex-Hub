import { z } from "zod";
export const metaRefreshBodySchema = z.object({
  confirmation: z.literal("REFRESH_PUBLIC_META"),
});
export type MetaRefreshBody = z.infer<typeof metaRefreshBodySchema>;