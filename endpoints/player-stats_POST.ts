import { playerStatsBodySchema } from "./player-stats_POST.schema";

export async function handle(request: Request): Promise<Response> {
  const key = (process.env as Record<string, string | undefined>).APEX_LEGENDS_STATUS_API_KEY;
  if (!key) return Response.json({available:false,source:"Apex Legends Status",message:"Spielersuche ist noch nicht verbunden."},{status:503});
  const parsed = playerStatsBodySchema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return Response.json({available:false,source:"Apex Legends Status",message:"Bitte einen gültigen Spielernamen und eine Plattform auswählen."},{status:400});
  const {player,platform}=parsed.data;
  const url = new URL("https://api.apexlegendsstatus.com/bridge");
  url.searchParams.set("player",player);
  url.searchParams.set("platform",platform);
  url.searchParams.set("version","5");
  const upstream = await fetch(url, {headers:{Authorization:key,Accept:"*/*"},signal:AbortSignal.timeout(12000)});
  if (upstream.status===404) return Response.json({available:false,source:"Apex Legends Status",message:"Spieler nicht gefunden. Bei PC bitte den EA-Kontonamen verwenden."},{status:404});
  if (upstream.status===429) return Response.json({available:false,source:"Apex Legends Status",message:"API-Limit erreicht. Bitte später erneut versuchen."},{status:429});
  if (!upstream.ok) return Response.json({available:false,source:"Apex Legends Status",message:upstream.status===401||upstream.status===403?"API-Key nicht akzeptiert. Bitte Verbindung prüfen.":`Spielerdaten-Anbieter antwortet mit HTTP ${upstream.status}.`},{status:502});
  const data = await upstream.json();
  return Response.json({available:true,source:"Apex Legends Status",player,platform,data},{headers:{"Cache-Control":"no-store"}});
}