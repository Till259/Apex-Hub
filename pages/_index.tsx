import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Crosshair, Search, Shield, Zap, ChevronRight, X, Activity, Target, Menu, Map, Trophy, UserRoundSearch } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import styles from "./_index.module.css";

type Weapon = { id?: string; name: string; category: string; ammo: string; role: string; bodyDamage?: string | null; headDamage?: string | null; legDamage?: string | null; magazineSize?: number | null; fireRate?: string | null; reloadSeconds?: string | null; recoilNotes?: string | null; currentMetaTier?: string | null; dataVersion?: string | null; sourceUrl?: string | null; verifiedAt?: string | null };
const starterWeapons: Weapon[] = [
  { name: "HAVOC Rifle", category: "Sturmgewehr", ammo: "Energie", role: "Automatik" },
  { name: "VK-47 Flatline", category: "Sturmgewehr", ammo: "Schwer", role: "Automatik" },
  { name: "Hemlok Burst AR", category: "Sturmgewehr", ammo: "Schwer", role: "Burst" },
  { name: "R-301 Carbine", category: "Sturmgewehr", ammo: "Leicht", role: "Automatik" },
  { name: "Nemesis Burst AR", category: "Sturmgewehr", ammo: "Energie", role: "Burst" },
  { name: "Prowler Burst PDW", category: "Maschinenpistole", ammo: "Schwer", role: "Burst" },
  { name: "Alternator SMG", category: "Maschinenpistole", ammo: "Leicht", role: "Automatik" },
  { name: "R-99 SMG", category: "Maschinenpistole", ammo: "Leicht", role: "Automatik" },
  { name: "Volt SMG", category: "Maschinenpistole", ammo: "Energie", role: "Automatik" },
  { name: "C.A.R. SMG", category: "Maschinenpistole", ammo: "Leicht / Schwer", role: "Automatik" },
  { name: "Devotion LMG", category: "Leichtes MG", ammo: "Energie", role: "Automatik" },
  { name: "L-STAR EMG", category: "Leichtes MG", ammo: "Energie", role: "Automatik" },
  { name: "M600 Spitfire", category: "Leichtes MG", ammo: "Leicht", role: "Automatik" },
  { name: "Rampage LMG", category: "Leichtes MG", ammo: "Schwer", role: "Automatik" },
  { name: "G7 Scout", category: "Präzisionsgewehr", ammo: "Leicht", role: "Halbautomatik" },
  { name: "Triple Take", category: "Präzisionsgewehr", ammo: "Energie", role: "Dreifachschuss" },
  { name: "30-30 Repeater", category: "Präzisionsgewehr", ammo: "Schwer", role: "Hebelrepetierer" },
  { name: "Bocek Compound Bow", category: "Präzisionsgewehr", ammo: "Pfeile", role: "Bogen" },
  { name: "Longbow DMR", category: "Scharfschützengewehr", ammo: "Scharfschütze", role: "Halbautomatik" },
  { name: "Charge Rifle", category: "Scharfschützengewehr", ammo: "Scharfschütze", role: "Ladung" },
  { name: "Sentinel", category: "Scharfschützengewehr", ammo: "Scharfschütze", role: "Bolt-Action" },
  { name: "Kraber .50-Cal", category: "Scharfschützengewehr", ammo: "Versorgung", role: "Bolt-Action" },
  { name: "EVA-8 Auto", category: "Schrotflinte", ammo: "Schrot", role: "Automatik" },
  { name: "Mozambique", category: "Schrotflinte", ammo: "Schrot", role: "Dreifach" },
  { name: "Peacekeeper", category: "Schrotflinte", ammo: "Schrot", role: "Pump-Action" },
  { name: "Mastiff", category: "Schrotflinte", ammo: "Schrot", role: "Hebel" },
  { name: "RE-45 Auto", category: "Pistole", ammo: "Leicht", role: "Automatik" },
  { name: "P2020", category: "Pistole", ammo: "Leicht", role: "Halbautomatik" },
  { name: "Wingman", category: "Pistole", ammo: "Scharfschütze", role: "Revolver" },
];
const categories = ["Alle Klassen", "Sturmgewehr", "Maschinenpistole", "Leichtes MG", "Präzisionsgewehr", "Scharfschützengewehr", "Schrotflinte", "Pistole"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Start");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle Klassen");
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [damage, setDamage] = useState("18");
  const [health, setHealth] = useState("200");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [weapons, setWeapons] = useState<Weapon[]>(starterWeapons);
  const [weaponDataStatus, setWeaponDataStatus] = useState("Katalog wird geladen");
  const [legends, setLegends] = useState<Array<{id:string;name:string;class:string|null;tacticalAbility?:string|null;passiveAbility?:string|null;ultimateAbility?:string|null;roleNotes?:string|null;sourceUrl?:string|null;verifiedAt?:string|null}>>([]);
  const [patchNotes, setPatchNotes] = useState<Array<{id:string;season:string|null;patchVersion:string;title:string;summary:string|null;sourceUrl:string;publishedAt:string|null}>>([]);
  const [metaPeriods, setMetaPeriods] = useState<Array<{id:string;weaponId:string;season:string;patchStart:string|null;patchEnd:string|null;mode:string|null;tier:string;evidenceSummary:string|null;sourceUrl:string|null;verifiedAt:string|null}>>([]);
  const [metaEvidence, setMetaEvidence] = useState<Array<{id:string;weaponId:string;season:string;mode:string;sampleSize:number|null;pickRate:string|null;winRate:string|null;evidenceSummary:string|null;sourceUrl:string;collectedAt:string}>>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [attachments, setAttachments] = useState<Array<{id:string;name:string;slot:string;effectSummary:string|null;affectedStat:string|null;effectValue:string|null;sourceUrl:string|null;verifiedAt:string|null}>>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [rank, setRank] = useState("Platinum");
  const [earnedRp, setEarnedRp] = useState("100");
  const [rankedRuleRows, setRankedRuleRows] = useState<Array<{id:string;division:string;entryCost:number|null;sourceUrl:string|null;verifiedAt:string|null}>>([]);
  const [rankedRuleSeason, setRankedRuleSeason] = useState("");
  const [rankedAdjustments,setRankedAdjustments] = useState<{challengerDiscountPercent:number;goliathSurchargePercent:number;sourceUrl:string}|null>(null);
  const [playerName, setPlayerName] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [playerResult, setPlayerResult] = useState<any>(null);
  const [playerError, setPlayerError] = useState("");
  const [playerLoading, setPlayerLoading] = useState(false);
  const [rotation, setRotation] = useState<any>(null);
  const [rotationError, setRotationError] = useState("");
  const [rotationLoading, setRotationLoading] = useState(false);
  const filteredWeapons = useMemo(() => weapons.filter((weapon) => weapon.name.toLowerCase().includes(search.toLowerCase()) && (category === "Alle Klassen" || weapon.category === category)), [search, category]);
  const hitDamage = Math.max(1, Number(damage) || 1);
  const targetHealth = Math.max(1, Number(health) || 1);
  const shots = Math.ceil(targetHealth / hitDamage);
  const entryCosts: Record<string, number> = rankedRuleRows.length ? Object.fromEntries(rankedRuleRows.map(row=>[row.division,row.entryCost ?? 0])) : { Rookie: 0, Bronze: 10, Silver: 20, Gold: 38, Platinum: 48, Diamond: 65, "Master / Predator": 90 };
  const netRp = (Number(earnedRp) || 0) - entryCosts[rank];
  const tabs = ["Start", "Waffen", "Meta", "Legenden", "Ranked", "Tools", "Spielersuche", "Updates"];
  const goTo = (tab: string) => { setActiveTab(tab); setMobileMenu(false); document.getElementById("content")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  useEffect(() => {
    let active = true;
    fetch("/_api/weapons").then(r => r.ok ? r.json() : Promise.reject(new Error("Datenbank nicht erreichbar"))).then(data => {
      if (!active || !Array.isArray(data.weapons) || !data.weapons.length) return;
      setWeapons(data.weapons.map((w: any) => ({id:w.id,name:w.name,category:w.category,ammo:w.ammoType ?? "Nicht hinterlegt",role:w.fireMode ?? "Waffenprofil",bodyDamage:w.bodyDamage,headDamage:w.headDamage,legDamage:w.legDamage,magazineSize:w.magazineSize,fireRate:w.fireRate,reloadSeconds:w.reloadSeconds,recoilNotes:w.recoilNotes,currentMetaTier:w.currentMetaTier,dataVersion:w.dataVersion,sourceUrl:w.sourceUrl,verifiedAt:w.verifiedAt})));
      setWeaponDataStatus(data.dataStatus === "verified" ? "Quellengeprüfte Werte" : "Waffenliste vorhanden · Werte noch nicht vollständig verifiziert");
    }).catch(() => { if (active) setWeaponDataStatus("Lokaler Katalog · Datenbank nicht erreichbar"); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/_api/ranked-rules?season=Cipher%20%2F%20Season%2031").then(r=>r.ok?r.json():Promise.reject(new Error("Ranked-Regeln nicht verfügbar"))).then(data=>{
      if (!active) return;
      if (Array.isArray(data.rules)) setRankedRuleRows(data.rules);
      if (data.season) setRankedRuleSeason(data.season);
      if (data.adjustments) setRankedAdjustments(data.adjustments);
    }).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  useEffect(() => {
    if (activeTab !== "Meta") return;
    let active = true;
    setMetaLoading(true); setMetaError("");
    fetch("/_api/meta").then(r => r.ok ? r.json() : Promise.reject(new Error("Meta-Daten konnten nicht geladen werden."))).then(data => {
      if (!active) return;
      setMetaPeriods(Array.isArray(data.periods) ? data.periods : []);
      setMetaEvidence(Array.isArray(data.evidence) ? data.evidence : []);
    }).catch(e => { if (active) setMetaError(e instanceof Error ? e.message : "Meta-Daten derzeit nicht verfügbar."); })
      .finally(() => { if (active) setMetaLoading(false); });
    return () => { active = false; };
  }, [activeTab]);
  useEffect(() => {
    if (!selectedWeapon?.id) { setAttachments([]); return; }
    let active = true;
    setAttachmentsLoading(true);
    fetch(`/_api/attachments?weaponId=${encodeURIComponent(selectedWeapon.id)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Aufsätze konnten nicht geladen werden.")))
      .then(data => { if (active) setAttachments(Array.isArray(data.attachments) ? data.attachments : []); })
      .catch(() => { if (active) setAttachments([]); })
      .finally(() => { if (active) setAttachmentsLoading(false); });
    return () => { active = false; };
  }, [selectedWeapon]);
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/_api/legends").then(r => r.ok ? r.json() : Promise.reject(new Error("Legenden"))),
      fetch("/_api/patch-notes?limit=20").then(r => r.ok ? r.json() : Promise.reject(new Error("Patch Notes"))),
    ]).then(([legendData, patchData]) => {
      if (!active) return;
      if (Array.isArray(legendData.legends)) setLegends(legendData.legends);
      if (Array.isArray(patchData.items)) setPatchNotes(patchData.items);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function loadRotation() {
    setRotationLoading(true); setRotationError("");
    try { const res = await fetch("/_api/map-rotation"); const data = await res.json(); if (!res.ok) throw new Error(data.message || "Rotation derzeit nicht verfügbar"); setRotation(data.data ?? data); }
    catch (e) { setRotationError(e instanceof Error ? e.message : "Rotation derzeit nicht verfügbar"); }
    finally { setRotationLoading(false); }
  }
  async function lookupPlayer(event: React.FormEvent) {
    event.preventDefault(); setPlayerLoading(true); setPlayerError(""); setPlayerResult(null);
    try { const res = await fetch("/_api/player-stats", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({player:playerName,platform})}); const data=await res.json(); if(!res.ok) throw new Error(data.message || "Spielerdaten nicht verfügbar"); setPlayerResult(data); }
    catch (e) { setPlayerError(e instanceof Error ? e.message : "Spielerdaten nicht verfügbar"); }
    finally { setPlayerLoading(false); }
  }

  return <div className={styles.appShell}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.brand} onClick={() => goTo("Start")} aria-label="APEX HUB Startseite"><span className={styles.brandMark}>A</span><span>APEX<span className={styles.brandAccent}>HUB</span></span></button>
      <nav className={`${styles.nav} ${mobileMenu ? styles.navOpen : ""}`} aria-label="Hauptnavigation">{tabs.map((tab) => <button key={tab} className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ""}`} onClick={() => goTo(tab)}>{tab}</button>)}</nav>
      <button className={styles.menuButton} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menü öffnen">{mobileMenu ? <X size={20}/> : <Menu size={20}/>}</button>
    </div></header>
    <main>
      {activeTab === "Start" && <>
        <section className={styles.hero}><div className={styles.heroGrid}><div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span className={styles.eyebrowLine}/> THE OUTLANDS INTELLIGENCE NETWORK</div>
          <h1>PLAY SMARTER.<br/><span>DROP STRONGER.</span></h1>
          <p>Dein taktischer Hub für Apex Legends. Waffenwissen, Meta-Entscheidungen und Tools – präzise aufbereitet an einem Ort.</p>
          <div className={styles.heroActions}><Button onClick={() => goTo("Waffen")}><Crosshair size={17}/> Waffen entdecken <ArrowUpRight size={16}/></Button><Button variant="outline" onClick={() => goTo("Tools")}>Damage-Rechner</Button></div>
          <div className={styles.heroFoot}><span><span className={styles.liveDot}/> HUB STATUS: IN ENTWICKLUNG</span><span>VERSION 0.1 / ALPHA</span></div>
        </div><div className={styles.heroVisual} aria-hidden="true"><div className={`${styles.orbit} ${styles.orbitOne}`}/><div className={`${styles.orbit} ${styles.orbitTwo}`}/><div className={styles.targetDisc}><div className={styles.targetInner}><Crosshair size={100} strokeWidth={1}/></div></div><div className={styles.visualLabel}><span>FIELD INTEL</span><strong>READY</strong></div><div className={styles.visualCode}>APX / 001<br/>TACTICAL SYSTEMS</div></div></div></section>
        <section className={styles.statStrip}><div><strong>{weapons.length}</strong><span>Waffen im Katalog</span></div><div><strong>{legends.length || 28}</strong><span>Legenden im Kader</span></div><div><strong>08</strong><span>Hub-Bereiche</span></div><div><strong>LIVE</strong><span>API-Daten verfügbar</span></div></section>
      </>}
      <div id="content" className={styles.contentWrap}>
        {activeTab === "Start" && <>
          <section className={styles.sectionBlock}><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>01 / COMMAND CENTER</div><h2>WÄHLE DEINEN <span>VORTEIL.</span></h2></div><p>Alles, was du für den nächsten Drop brauchst.</p></div>
            <div className={styles.featureGrid}>
              <button className={styles.featureCard} onClick={() => goTo("Waffen")}><div className={styles.featureTop}><Crosshair/><span>01</span></div><h3>WEAPON<br/>INTEL</h3><p>Waffenprofile, Klassen und Werte – mit sauberem Quellenstatus.</p><div className={styles.cardLink}>ARSENAL ÖFFNEN <ChevronRight size={16}/></div></button>
              <button className={styles.featureCard} onClick={() => goTo("Meta")}><div className={styles.featureTop}><Activity/><span>02</span></div><h3>META<br/>TRACKER</h3><p>Season-Meta und historische Phasen einer Waffe im Überblick.</p><div className={styles.cardLink}>META ANSEHEN <ChevronRight size={16}/></div></button>
              <button className={styles.featureCard} onClick={() => goTo("Tools")}><div className={styles.featureTop}><Target/><span>03</span></div><h3>COMBAT<br/>TOOLS</h3><p>Damage-Rechner und weitere taktische Hilfsmittel.</p><div className={styles.cardLink}>TOOLS ÖFFNEN <ChevronRight size={16}/></div></button>
            </div>
          </section>
          <section className={styles.sectionBlock}><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>02 / INTEL STATUS</div><h2>AKTUELLE <span>SYSTEMDATEN.</span></h2></div></div><div className={styles.roadmap}><div><Badge variant="success">ONLINE</Badge><strong>Live-Map-Rotation</strong><span>BR, Ranked, Mixtape und Wildcard aus der API</span></div><div><Badge variant="success">ONLINE</Badge><strong>Spielerprofile</strong><span>Öffentliche Profile auf PC, PlayStation und Xbox</span></div><div><Badge variant="warning">DATEN WERDEN ERGÄNZT</Badge><strong>Waffen & Meta</strong><span>Nur belegte Werte und Zeiträume; fehlende Felder bleiben leer</span></div></div></section>
        </>}
        {activeTab === "Waffen" && <section className={styles.sectionBlock}><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>ARSENAL / DATABASE</div><h2>WAFFEN <span>ÜBERSICHT.</span></h2><p>{weaponDataStatus}</p></div><Badge variant="outline">{filteredWeapons.length} EINTRÄGE</Badge></div><div className={styles.filters}><div className={styles.searchBox}><Search size={17}/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Waffe suchen …" aria-label="Waffe suchen"/></div><Select value={category} onValueChange={setCategory}><SelectTrigger className={styles.categorySelect}><SelectValue placeholder="Waffengattung"/></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className={styles.weaponGrid}>{filteredWeapons.map((weapon, index) => <button key={weapon.id ?? weapon.name} className={styles.weaponCard} onClick={() => setSelectedWeapon(weapon)}><div className={styles.weaponIndex}>APX-{String(index + 1).padStart(2,"0")}<span>{weapon.ammo}</span></div><h3>{weapon.name}</h3><div className={styles.weaponMeta}><span>{weapon.category}</span><span>{weapon.role}</span></div><div className={styles.weaponOpen}>PROFIL ANSEHEN <ArrowUpRight size={14}/></div></button>)}</div><p className={styles.dataNote}>Numerische Werte, Attachments und TTK werden nur angezeigt, wenn sie mit Quelle und Patch-Stand hinterlegt sind.</p></section>}
        {activeTab === "Meta" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>COMPETITIVE INTELLIGENCE</div><h2>SEASON META <span>& ARCHIV.</span></h2><div className={styles.callout}><Zap/><div><strong>{metaLoading ? "Meta-Daten werden geladen …" : "Quellenbasierte Meta-Übersicht"}</strong><p>Offizielle EA-Balance-Änderungen und Community-Statistiken werden getrennt geführt. Jede Historie hat einen Patch-Zeitraum und eine Quelle.</p></div></div>{metaError && <p className={styles.dataNote}>{metaError}</p>}{metaPeriods.length > 0 && <><h3>SEASON-/PATCH-HISTORIE</h3><div className={styles.featureGrid}>{metaPeriods.map(item=><article className={styles.infoCard} key={item.id}><span>{item.season} {item.mode ? `· ${item.mode}` : ""}</span><h3>{weapons.find(w=>w.id===item.weaponId)?.name ?? item.weaponId} · {item.tier}</h3><p>{item.patchStart ?? "Start unbekannt"} – {item.patchEnd ?? "laufend / Ende offen"}. {item.evidenceSummary ?? ""}</p>{item.sourceUrl && <a className={styles.cardLink} href={item.sourceUrl} target="_blank" rel="noreferrer">QUELLE ÖFFNEN <ArrowUpRight size={14}/></a>}</article>)}</div></>}{metaEvidence.length > 0 && <><h3>COMMUNITY-/TRACKER-EVIDENZ</h3><div className={styles.featureGrid}>{metaEvidence.map(item=><article className={styles.infoCard} key={item.id}><span>{item.season} · {item.mode}</span><h3>{legends.find(l=>l.id===item.weaponId)?.name ?? weapons.find(w=>w.id===item.weaponId)?.name ?? item.weaponId}</h3><p>{item.pickRate ? `Pick-Rate: ${item.pickRate}% · ` : ""}{item.winRate ? `Win-Rate: ${item.winRate}% · ` : ""}{item.sampleSize ? `Stichprobe: ${item.sampleSize} · ` : ""}{item.evidenceSummary ?? "Keine zusätzliche Zusammenfassung."}</p><a className={styles.cardLink} href={item.sourceUrl} target="_blank" rel="noreferrer">DATENQUELLE <ArrowUpRight size={14}/></a><p>Erfasst: {new Date(item.collectedAt).toLocaleDateString("de-DE")}</p></article>)}</div></>}{metaPeriods.length===0 && metaEvidence.length===0 && !metaLoading && <div className={styles.infoCard}><span>DATENSTATUS</span><h3>Noch keine Community-Stichprobe gespeichert</h3><p>Die bestätigten Season-31-Balanceänderungen stehen im Patch-Archiv und die Waffenphasen werden hier chronologisch geführt. Pick-/Win-Rates erscheinen erst, wenn ein abrufbarer, vollständiger Datensatz vorliegt.</p></div>}<h3>ALL-TIME-META-PRINZIP</h3><p className={styles.dataNote}>Eine Waffe gilt im Archiv nur für den Zeitraum als Meta, in dem Patch-Hinweise oder eine dokumentierte Competitive-/Pickrate-Auswertung sie belegen. Ein Nerf allein ist kein Beweis für eine Tier-Stufe.</p></section>}
        {activeTab === "Legenden" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>ROSTER / TEAM COMPOSITION</div><div className={styles.sectionHeading}><h2>LEGENDEN <span>INTEL.</span></h2><Badge variant="outline">{legends.length || 28} LEGENDEN</Badge></div><p className={styles.dataNote}>Offizieller Kader und Klassen aus dem EA-Charakter-Hub. Fähigkeiten werden erst ergänzt, wenn der aktuelle Stand geprüft ist.</p><div className={styles.filters}><div className={styles.searchBox}><Search size={17}/><Input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Legende suchen …" aria-label="Legende suchen"/></div></div><div className={styles.weaponGrid}>{legends.filter(l=>l.name.toLowerCase().includes(search.toLowerCase())).map((legend,index)=><article className={styles.weaponCard} key={legend.id}><div className={styles.weaponIndex}>LEGEND-{String(index+1).padStart(2,"0")}<span>ROSTER</span></div><h3>{legend.name}</h3><div className={styles.weaponMeta}><span>{legend.class ?? "Klasse offen"}</span></div>{legend.passiveAbility && <p><strong>Passiv:</strong> {legend.passiveAbility}</p>}{legend.tacticalAbility && <p><strong>Taktisch:</strong> {legend.tacticalAbility}</p>}{legend.ultimateAbility && <p><strong>Ultimativ:</strong> {legend.ultimateAbility}</p>}{legend.roleNotes && <p>{legend.roleNotes}</p>}{legend.sourceUrl && <a className={styles.cardLink} href={legend.sourceUrl} target="_blank" rel="noreferrer">QUELLE <ArrowUpRight size={14}/></a>}</article>)}</div><p className={styles.dataNote}>Quelle: <a href="https://www.ea.com/games/apex-legends/apex-legends/characters-hub" target="_blank" rel="noreferrer">Offizieller EA-Charakter-Hub</a>.</p></section>}
        {activeTab === "Ranked" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>RANKED OPERATIONS / CIPHER</div><h2>CLIMB THE <span>LADDER.</span></h2><div className={styles.calculator}><div className={styles.calcIntro}><Trophy size={28}/><h3>RP-Netto-Rechner</h3><p>Trage die im Match angezeigten erhaltenen RP ein. Der Rechner zieht die regulären Eintrittskosten deines Rangs ab. Lobby-Anpassungen können den tatsächlichen Entry Cost verändern.</p></div><div className={styles.calcInputs}><label>Aktueller Rang<Select value={rank} onValueChange={setRank}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.keys(entryCosts).map(r=><SelectItem key={r} value={r}>{r} · {entryCosts[r]} RP Entry</SelectItem>)}</SelectContent></Select></label><label>Erhaltene RP laut Match<Input type="number" min="0" value={earnedRp} onChange={e=>setEarnedRp(e.target.value)}/></label></div><div className={styles.calcResults}><div><span>ENTRY COST</span><strong>{entryCosts[rank]}</strong></div><div><span>NETTO RP</span><strong>{netRp>0?"+":""}{netRp}</strong></div><div><span>BREAK EVEN</span><strong>{entryCosts[rank]} RP</strong></div></div></div><div className={styles.featureGrid}><div className={styles.infoCard}><span>SCORING</span><h3>Placement & Eliminations</h3><p>EA beschreibt Platzierung, Kills, Assists, Participation und Bonus-Regeln. In Season 31 können Entry Costs durch weite Skill-Lobbys angepasst werden.</p></div><div className={styles.infoCard}><span>MAP ROTATION</span><h3>Aktive Karten</h3><p>Live-Rotation mit Kartenwechsel-Timer und Quelle.</p><Button variant="outline" onClick={loadRotation}><Map size={16}/> Rotation abrufen</Button>{rotationLoading&&<p>Live-Rotation wird geladen …</p>}{rotationError&&<p>{rotationError}</p>}{rotation?.battle_royale?.current && <div className={styles.rotationGrid}><article className={styles.rotationCard}>{rotation.battle_royale.current.asset&&<img src={rotation.battle_royale.current.asset} alt="" loading="lazy"/>}<span>BATTLE ROYALE / PUBS</span><strong>{rotation.battle_royale.current.map}</strong><small>Wechsel in {rotation.battle_royale.current.remainingTimer ?? "–"}</small><p>Als Nächstes: {rotation.battle_royale.next?.map ?? "–"}</p></article><article className={styles.rotationCard}>{rotation.ranked?.current?.asset&&<img src={rotation.ranked.current.asset} alt="" loading="lazy"/>}<span>RANKED</span><strong>{rotation.ranked?.current?.map ?? "–"}</strong><small>Wechsel in {rotation.ranked?.current?.remainingTimer ?? "–"}</small><p>Als Nächstes: {rotation.ranked?.next?.map ?? "–"}</p></article></div>}{rotation?.ltm?.current && <article className={styles.rotationCard}><span>MIXTAPE / {rotation.ltm.current.eventName ?? "EVENT"}</span><strong>{rotation.ltm.current.map}</strong><small>Wechsel in {rotation.ltm.current.remainingTimer ?? "–"}</small></article>}{rotation?.wildcard?.current && <article className={styles.rotationCard}><span>WILDCARD / {rotation.wildcard.current.eventName ?? "EVENT"}</span><strong>{rotation.wildcard.current.map}</strong><small>Endet: {rotation.wildcard.current.readableDate_end ?? "–"}</small></article>}<p>Quelle: <a href="https://apexlegendsstatus.com" target="_blank" rel="noreferrer">Apex Legends Status</a></p></div><div className={styles.infoCard}><span>RANKED RULES · {rankedRuleSeason || "CIPHER / SEASON 31"}</span><h3>Reguläre Entry Costs</h3><p>{rankedRuleRows.map(row=>`${row.division}: ${row.entryCost ?? "–"} RP`).join(" · ") || "Entry Costs werden geladen."}</p><p>Die tatsächlichen Kosten können durch Lobby-Anpassungen abweichen.</p>{rankedAdjustments && <div className={styles.dataNote}><strong>Season-31-Lobby-Anpassungen:</strong> Challenger Match: −{rankedAdjustments.challengerDiscountPercent}% Entry Cost · Goliath Lobby: +{rankedAdjustments.goliathSurchargePercent}% Entry Cost. Die Modifikatoren beziehen sich auf die Eintrittskosten, nicht auf die erhaltenen Match-RP. <a href={rankedAdjustments.sourceUrl} target="_blank" rel="noreferrer">EA-Patch-Quelle</a>.</div>}<a className={styles.cardLink} href="https://help.ea.com/en/articles/apex-legends/ranked/" target="_blank" rel="noreferrer">OFFIZIELLE RANKED-REGELN <ArrowUpRight size={14}/></a></div></div></section>}
        {activeTab === "Spielersuche" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>PLAYER INTELLIGENCE / LOOKUP</div><h2>PLAYER <span>TRACKER.</span></h2><div className={styles.calculator}><div className={styles.calcIntro}><UserRoundSearch size={28}/><h3>Spielerstatistiken suchen</h3><p>Suche öffentliche Apex-Profile auf PC, PlayStation oder Xbox. Bei PC bitte den EA-Kontonamen verwenden, auch wenn über Steam gespielt wird.</p></div><form onSubmit={lookupPlayer}><div className={styles.calcInputs}><label>Spielername<Input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="EA-/PSN-/Xbox-Name" required/></label><label>Plattform<Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PC">PC</SelectItem><SelectItem value="PS4">PlayStation</SelectItem><SelectItem value="X1">Xbox</SelectItem></SelectContent></Select></label></div><Button type="submit" disabled={playerLoading||playerName.trim().length<2}>{playerLoading?"Suche läuft …":"Profil suchen"}</Button></form>{playerError&&<div className={styles.callout}><div><strong>Suche nicht möglich</strong><p>{playerError}</p></div></div>}{playerResult&&<div className={styles.playerResult}><Badge variant="success">Profil gefunden</Badge><p>Quelle: Apex Legends Status · {playerResult.player} ({playerResult.platform})</p><div className={styles.profileHeader}>{playerResult.data?.global?.avatar&&<img src={playerResult.data.global.avatar} alt="" loading="lazy"/>}<div><h3>{playerResult.data?.global?.name ?? playerResult.player}</h3><p>Level {playerResult.data?.global?.level ?? "–"} · {playerResult.data?.global?.rank?.rankName ?? "Rang unbekannt"} {playerResult.data?.global?.rank?.rankDiv ? `· Division ${playerResult.data.global.rank.rankDiv}` : ""}</p><strong>{playerResult.data?.global?.rank?.rankScore != null ? `${playerResult.data.global.rank.rankScore} RP` : "RP nicht verfügbar"}</strong></div></div><div className={styles.calcResults}><div><span>LEVEL</span><strong>{playerResult.data?.global?.level ?? "–"}</strong></div><div><span>RANG</span><strong>{playerResult.data?.global?.rank?.rankName ?? "–"}</strong></div><div><span>RANKED RP</span><strong>{playerResult.data?.global?.rank?.rankScore ?? "–"}</strong></div></div>{playerResult.data?.realtime&&<p>Aktuelle Session: {playerResult.data.realtime.isOnline ? "Online" : "Status nicht online"} {playerResult.data.realtime.currentState ?? ""}</p>}<details><summary>Weitere API-Rohdaten anzeigen</summary><pre className={styles.rawData}>{JSON.stringify(playerResult.data,null,2).slice(0,5000)}</pre></details></div>}<p className={styles.dataNote}>Spielerdaten werden nur auf Anfrage geladen. Das Profil muss öffentlich sein. <a href="https://apexlegendsstatus.com" target="_blank" rel="noreferrer">Data provided by Apex Legends Status</a>.</p></div></section>}
        {activeTab === "Updates" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>NEWS / PATCH INTELLIGENCE</div><h2>PATCH <span>ARCHIVE.</span></h2><p className={styles.dataNote}>Offizielle Patch- und Update-Hinweise. Der Link öffnet die Originalquelle; die Zusammenfassungen im Hub sind ausdrücklich als Kurzüberblick gekennzeichnet.</p>{patchNotes.length===0 && <p>Derzeit sind keine Patchnotes gespeichert.</p>}<div className={styles.featureGrid}>{patchNotes.map(note=><article className={styles.infoCard} key={note.id}><span>{note.season ?? "APEX"} · {note.patchVersion}{note.publishedAt ? ` · ${new Date(note.publishedAt).toLocaleDateString("de-DE")}` : ""}</span><h3>{note.title}</h3><p>{note.summary}</p><a className={styles.cardLink} href={note.sourceUrl} target="_blank" rel="noreferrer">ORIGINALQUELLE ÖFFNEN <ArrowUpRight size={14}/></a></article>)}</div><p className={styles.dataNote}>Datenstand: {new Date().toLocaleDateString("de-DE")}. Neue Hinweise werden erst nach Quellenprüfung in den Hub übernommen.</p></section>}
        {activeTab === "Tools" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>COMBAT CALCULATOR</div><h2>DAMAGE <span>SIMULATOR.</span></h2><div className={styles.calculator}><div className={styles.calcIntro}><Target size={28}/><h3>Treffer-Rechner</h3><p>Berechnet benötigte Treffer anhand des angenommenen Schadens pro Treffer. Vereinfachtes Modell ohne Helm, Trefferzone oder Legenden-Passives.</p></div><div className={styles.calcInputs}><label>Schaden pro Treffer<Input type="number" min="1" value={damage} onChange={(event) => setDamage(event.target.value)}/></label><label>Gegner-Leben + Schild<Input type="number" min="1" value={health} onChange={(event) => setHealth(event.target.value)}/></label></div><div className={styles.calcResults}><div><span>TREFFER NÖTIG</span><strong>{shots}</strong></div><div><span>GESAMTSCHADEN</span><strong>{shots * hitDamage}</strong></div><div><span>ÜBERSCHUSS</span><strong>{shots * hitDamage - targetHealth}</strong></div></div></div></section>}
      </div>
    </main>
    <footer className={styles.footer}><div className={styles.footerInner}><div className={styles.brand}><span className={styles.brandMark}>A</span><span>APEX<span className={styles.brandAccent}>HUB</span></span></div><p>INDEPENDENT FAN PROJECT · NOT AFFILIATED WITH EA OR RESPAWN.</p><span>BUILD 0.1.0 / 2026</span></div><p className={styles.disclaimer}>Apex Legends is a trademark of Electronic Arts. APEX HUB is an independent fan project.</p></footer>
    {selectedWeapon && <div className={styles.modalBackdrop} onClick={() => setSelectedWeapon(null)}><div className={styles.weaponModal} onClick={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setSelectedWeapon(null)} aria-label="Schließen"><X/></button><div className={styles.eyebrow}>WEAPON PROFILE / CATALOGUE</div><h2>{selectedWeapon.name}</h2><div className={styles.modalTags}><Badge variant="outline">{selectedWeapon.category}</Badge><Badge variant="secondary">{selectedWeapon.ammo}</Badge><Badge variant="secondary">{selectedWeapon.role}</Badge></div><div className={styles.modalStats}><div><span>BODY DAMAGE</span><strong>{selectedWeapon.bodyDamage ?? "–"}</strong></div><div><span>HEAD DAMAGE</span><strong>{selectedWeapon.headDamage ?? "–"}</strong></div><div><span>LEG DAMAGE</span><strong>{selectedWeapon.legDamage ?? "–"}</strong></div></div><div className={styles.modalStats}><div><span>MAGAZINE</span><strong>{selectedWeapon.magazineSize ?? "–"}</strong></div><div><span>FIRE RATE / RPM</span><strong>{selectedWeapon.fireRate ?? "–"}</strong></div><div><span>RELOAD / SEC</span><strong>{selectedWeapon.reloadSeconds ?? "–"}</strong></div></div>{selectedWeapon.recoilNotes && <p><strong>Recoil:</strong> {selectedWeapon.recoilNotes}</p>}{selectedWeapon.currentMetaTier && <p><strong>Meta:</strong> {selectedWeapon.currentMetaTier}</p>}<p className={styles.dataNote}>Datenstand: {selectedWeapon.dataVersion ?? "Nicht gesetzt"} · {selectedWeapon.verifiedAt ? `Verifiziert: ${new Date(selectedWeapon.verifiedAt).toLocaleDateString("de-DE")}` : "Noch nicht verifiziert"}</p>{selectedWeapon.sourceUrl && <a className={styles.cardLink} href={selectedWeapon.sourceUrl} target="_blank" rel="noreferrer">DATENQUELLE ÖFFNEN <ArrowUpRight size={14}/></a>}<h3>AUFSÄTZE</h3>{attachmentsLoading ? <p>Aufsätze werden geladen …</p> : attachments.length===0 ? <p>Für diese Waffe sind noch keine quellengeprüften Aufsatzdaten hinterlegt.</p> : attachments.map(a=><div key={a.id} className={styles.weaponMeta}><strong>{a.name}</strong><span>{a.slot}</span><span>{a.effectSummary ?? "Effekt nicht hinterlegt"}</span></div>)}<p>Ein Strich bedeutet: Für diesen Wert liegt noch keine ausreichend geprüfte Angabe in der Datenbank vor.</p><Button onClick={() => setSelectedWeapon(null)}>Schließen</Button></div></div>}
  </div>;
}