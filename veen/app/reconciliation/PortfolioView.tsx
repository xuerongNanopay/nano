import type { ReconciliationProfile } from "./types";

function ProfileStatus({ status }: { status: ReconciliationProfile["status"] }) {
  return <i className={`profile-status ${status.toLowerCase()}`}>{status}</i>;
}

export function PortfolioView({ profiles, openProfile, createProfile }: { profiles: ReconciliationProfile[]; openProfile: (id: string) => void; createProfile: () => void }) {
  const active = profiles.filter(profile => profile.status === "Active").length;
  const exceptions = profiles.reduce((total, profile) => total + profile.openExceptions, 0);
  const parseMoney = (value: string) => {
    const amount = Number(value.replace(/[$,MK]/g, "")) || 0;
    return value.includes("M") ? amount * 1_000_000 : value.includes("K") ? amount * 1_000 : amount;
  };
  const unresolved = profiles.reduce((total, profile) => total + parseMoney(profile.unresolvedValue), 0);
  const matchRates = profiles.filter(profile => profile.status === "Active").map(profile => Number(profile.matchRate.replace("%", ""))).filter(Number.isFinite);
  const matchRate = matchRates.length ? `${(matchRates.reduce((total, rate) => total + rate, 0) / matchRates.length).toFixed(2)}%` : "—";
  const readiness = profiles.length ? Math.round((active / profiles.length) * 100) : 0;
  const nextRun = profiles.find(profile => profile.status === "Active")?.nextRun ?? "Not scheduled";
  return <div className="ops-content page-flow">
    <section className="portfolio-hero"><div><p>RECONCILIATION PORTFOLIO</p><h2>One control view across every reconciliation profile</h2><small>Monitor profile health, ownership, schedules, and unresolved positions without mixing their operational data.</small></div><button className="primary-action" onClick={createProfile}>＋ Create profile</button></section>
    <section className="portfolio-kpis"><article><p>Total profiles</p><h2>{profiles.length}</h2><small>{active} active · {profiles.filter(profile => profile.status === "Draft").length} draft</small></article><article><p>Portfolio match rate</p><h2>{matchRate}</h2><small>Average across active profiles</small></article><article><p>Open exceptions</p><h2>{exceptions.toLocaleString()}</h2><small>Across isolated operational queues</small></article><article><p>Unresolved value</p><h2>${(unresolved / 1_000_000).toFixed(2)}M</h2><small>Across all profile positions</small></article></section>
    <section className="portfolio-grid"><div className="profile-portfolio-list"><div className="table-toolbar"><div><p>Operational position</p><h3>Reconciliation profiles</h3></div><button className="secondary-action" onClick={createProfile}>＋ New profile</button></div>{profiles.map(profile => <button className="portfolio-profile-row" onClick={() => openProfile(profile.id)} key={profile.id}><span className="profile-avatar">{profile.name.split(" ").map(word => word[0]).join("").slice(0, 2)}</span><div><strong>{profile.name}</strong><small>{profile.description}</small><span>{profile.currency} · {profile.schedule} · {profile.owner}</span></div><dl><div><dt>Match rate</dt><dd>{profile.matchRate}</dd></div><div><dt>Open breaks</dt><dd>{profile.openExceptions.toLocaleString()}</dd></div><div><dt>Unresolved</dt><dd>{profile.unresolvedValue}</dd></div></dl><ProfileStatus status={profile.status} /><b>›</b></button>)}</div><aside className="portfolio-control"><p>PORTFOLIO CONTROL</p><h3>Configuration readiness</h3><div className="readiness-ring" style={{ background: `conic-gradient(#7ed09b ${readiness}%,#2b4a3b 0)` }}><span>{readiness}%</span><small>Active</small></div><dl><div><dt>Profiles ready</dt><dd>{active} of {profiles.length}</dd></div><div><dt>Needs review</dt><dd>{profiles.filter(profile => profile.status === "Paused").length}</dd></div><div><dt>Configuration draft</dt><dd>{profiles.filter(profile => profile.status === "Draft").length}</dd></div><div><dt>Next scheduled run</dt><dd>{nextRun}</dd></div></dl><small>Profiles retain separate rules, exceptions, runs, and audit history.</small></aside></section>
  </div>;
}

export { ProfileStatus };
