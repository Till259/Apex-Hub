export async function handle(request: Request): Promise<Response> {
  const key = (process.env as Record<string, string | undefined>).APEX_LEGENDS_STATUS_API_KEY;
  if (!key) {
    return Response.json({available:false, source:"Apex Legends Status", fetchedAt:new Date().toISOString(), message:"API-Zugang noch nicht verbunden."}, {status:503});
  }
  const url = new URL("https://api.apexlegendsstatus.com/maprotation");
  url.searchParams.set("version", "2");
  const upstream = await fetch(url, {
    headers: { Authorization: key, Accept: "*/*" },
    signal: AbortSignal.timeout(10000),
  });
  if (!upstream.ok) {
    return Response.json({available:false,source:"Apex Legends Status",fetchedAt:new Date().toISOString(),message:upstream.status===429?"API-Limit erreicht. Bitte später erneut versuchen.":upstream.status===401||upstream.status===403?"API-Key wurde vom Anbieter abgelehnt.":`Anbieter antwortet mit HTTP ${upstream.status}.`},{status:upstream.status===429?429:upstream.status===401||upstream.status===403?503:502});
  }
  const data = await upstream.json();
  return Response.json({available:true,source:"Apex Legends Status",fetchedAt:new Date().toISOString(),data},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=120"}});
}