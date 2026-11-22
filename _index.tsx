import React, { useMemo, useState } from "react";
import { ArrowUpRight, Crosshair, Search, Shield, Zap, ChevronRight, X, Activity, Target, Menu } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import styles from "./_index.module.css";

type Weapon = { name: string; category: string; ammo: string; role: string };
const weapons: Weapon[] = [
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
const categories = ["Alle Klassen", ...Array.from(new Set(weapons.map((weapon) => weapon.category)))];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Start");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle Klassen");
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [damage, setDamage] = useState("18");
  const [health, setHealth] = useState("200");
  const [mobileMenu, setMobileMenu] = useState(false);
  const filteredWeapons = useMemo(() => weapons.filter((weapon) => weapon.name.toLowerCase().includes(search.toLowerCase()) && (category === "Alle Klassen" || weapon.category === category)), [search, category]);
  const hitDamage = Math.max(1, Number(damage) || 1);
  const targetHealth = Math.max(1, Number(health) || 1);
  const shots = Math.ceil(targetHealth / hitDamage);
  const tabs = ["Start", "Waffen", "Meta", "Legenden", "Ranked", "Tools"];
  const goTo = (tab: string) => { setActiveTab(tab); setMobileMenu(false); document.getElementById("content")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

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
        <section className={styles.statStrip}><div><strong>29</strong><span>Waffen im Katalog</span></div><div><strong>06</strong><span>Bereiche geplant</span></div><div><strong>01</strong><span>Plattform</span></div><div><strong>LIVE</strong><span>Lokale Vorschau</span></div></section>
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
          <section className={styles.sectionBlock}><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>02 / PROJECT STATUS</div><h2>WAS ALS NÄCHSTES <span>KOMMT.</span></h2></div></div><div className={styles.roadmap}><div><Badge variant="success">BASIS</Badge><strong>Website-Grundgerüst</strong><span>Navigation, Mobile-Layout und Waffenübersicht</span></div><div><Badge variant="warning">IN ARBEIT</Badge><strong>Verifizierte Spieldaten</strong><span>Damage, Fire Rate, Magazine und Patch-Historie</span></div><div><Badge variant="outline">GEPLANT</Badge><strong>GEPLANT</strong><span>All-Time-Meta, Ranked, Rotation und Statsuche</span></div></div></section>
        </>}
        {activeTab === "Waffen" && <section className={styles.sectionBlock}><div className={styles.sectionHeading}><div><div className={styles.eyebrow}>ARSENAL / DATABASE</div><h2>WAFFEN <span>ÜBERSICHT.</span></h2></div><Badge variant="outline">{filteredWeapons.length} EINTRÄGE</Badge></div><div className={styles.filters}><div className={styles.searchBox}><Search size={17}/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Waffe suchen …" aria-label="Waffe suchen"/></div><Select value={category} onValueChange={setCategory}><SelectTrigger className={styles.categorySelect}><SelectValue placeholder="Waffengattung"/></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className={styles.weaponGrid}>{filteredWeapons.map((weapon, index) => <button key={weapon.name} className={styles.weaponCard} onClick={() => setSelectedWeapon(weapon)}><div className={styles.weaponIndex}>APX-{String(index + 1).padStart(2,"0")}<span>{weapon.ammo}</span></div><h3>{weapon.name}</h3><div className={styles.weaponMeta}><span>{weapon.category}</span><span>{weapon.role}</span></div><div className={styles.weaponOpen}>PROFIL ANSEHEN <ArrowUpRight size={14}/></div></button>)}</div><p className={styles.dataNote}>Hinweis: Diese erste Liste enthält Waffenbezeichnungen und Kategorien. Numerische Balance-Werte werden erst nach Prüfung der aktuellen Spielversion ergänzt.</p></section>}
        {activeTab === "Meta" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>COMPETITIVE INTELLIGENCE</div><h2>SEASON META <span>& ARCHIV.</span></h2><div className={styles.callout}><Zap/><div><strong>Meta-Daten werden verifiziert aufgebaut.</strong><p>Keine erfundenen Tier-Listen: Jede Einstufung erhält einen Season-/Patch-Zeitraum und nachvollziehbare Datenquellen.</p></div></div><div className={styles.featureGrid}><div className={styles.infoCard}><span>01 / LIVE META</span><h3>Aktuelle Season</h3><p>Waffen- und Legenden-Picks, getrennt nach Ranked und Competitive.</p></div><div className={styles.infoCard}><span>02 / HISTORY</span><h3>All-Time-Meta</h3><p>Zeigt, wann eine Waffe Meta war und wann sie durch Balance-Änderungen abgelöst wurde.</p></div><div className={styles.infoCard}><span>03 / PATCH LOG</span><h3>Patch-Verlauf</h3><p>Buffs, Nerfs und Anpassungen mit Datum und Versionsbezug.</p></div></div></section>}
        {activeTab === "Legenden" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>ROSTER / TEAM COMPOSITION</div><h2>LEGENDEN <span>INTEL.</span></h2><div className={styles.callout}><Shield/><div><strong>Legenden-Datenbank ist als nächster Ausbau vorgesehen.</strong><p>Profile, Fähigkeiten, Rollen, Synergien und Meta-Einstufungen werden nach aktuellem Balance-Stand ergänzt.</p></div></div></section>}
        {activeTab === "Ranked" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>RANKED OPERATIONS</div><h2>CLIMB THE <span>LADDER.</span></h2><div className={styles.featureGrid}><div className={styles.infoCard}><span>RP CALCULATOR</span><h3>Ranked Punkte</h3><p>Platzierung, Kills/Assists und Entry Cost je Rang berechnen.</p></div><div className={styles.infoCard}><span>MAP ROTATION</span><h3>Aktive Karten</h3><p>Rotationen mit Zeitstempel und Quelle anzeigen, sobald Live-Daten angebunden sind.</p></div><div className={styles.infoCard}><span>RANKED GUIDES</span><h3>Strategie</h3><p>Teamrollen, Loadouts und Entscheidungshilfen für den Ranked-Grind.</p></div></div></section>}
        {activeTab === "Tools" && <section className={styles.sectionBlock}><div className={styles.eyebrow}>COMBAT CALCULATOR</div><h2>DAMAGE <span>SIMULATOR.</span></h2><div className={styles.calculator}><div className={styles.calcIntro}><Target size={28}/><h3>Treffer-Rechner</h3><p>Berechnet benötigte Treffer anhand des angenommenen Schadens pro Treffer. Vereinfachtes Modell ohne Helm, Trefferzone oder Legenden-Passives.</p></div><div className={styles.calcInputs}><label>Schaden pro Treffer<Input type="number" min="1" value={damage} onChange={(event) => setDamage(event.target.value)}/></label><label>Gegner-Leben + Schild<Input type="number" min="1" value={health} onChange={(event) => setHealth(event.target.value)}/></label></div><div className={styles.calcResults}><div><span>TREFFER NÖTIG</span><strong>{shots}</strong></div><div><span>GESAMTSCHADEN</span><strong>{shots * hitDamage}</strong></div><div><span>ÜBERSCHUSS</span><strong>{shots * hitDamage - targetHealth}</strong></div></div></div></section>}
      </div>
    </main>
    <footer className={styles.footer}><div className={styles.footerInner}><div className={styles.brand}><span className={styles.brandMark}>A</span><span>APEX<span className={styles.brandAccent}>HUB</span></span></div><p>INDEPENDENT FAN PROJECT · NOT AFFILIATED WITH EA OR RESPAWN.</p><span>BUILD 0.1.0 / 2026</span></div><p className={styles.disclaimer}>Apex Legends is a trademark of Electronic Arts. APEX HUB is an independent fan project.</p></footer>
    {selectedWeapon && <div className={styles.modalBackdrop} onClick={() => setSelectedWeapon(null)}><div className={styles.weaponModal} onClick={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setSelectedWeapon(null)} aria-label="Schließen"><X/></button><div className={styles.eyebrow}>WEAPON PROFILE / CATALOGUE</div><h2>{selectedWeapon.name}</h2><div className={styles.modalTags}><Badge variant="outline">{selectedWeapon.category}</Badge><Badge variant="secondary">{selectedWeapon.ammo}</Badge><Badge variant="secondary">{selectedWeapon.role}</Badge></div><div className={styles.modalStats}><div><span>BODY DAMAGE</span><strong>–</strong></div><div><span>HEAD DAMAGE</span><strong>–</strong></div><div><span>LEG DAMAGE</span><strong>–</strong></div></div><p>Die aktuellen Schadens- und Handling-Werte werden nach Quellenprüfung ergänzt. Es werden bewusst keine unbestätigten Werte angezeigt.</p><Button onClick={() => setSelectedWeapon(null)}>Schließen</Button></div></div>}
  </div>;
}