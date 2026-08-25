import { useMemo, useState } from "react";
import { ProfileStatus } from "./PortfolioView";
import type { ReconciliationProfile } from "./types";

export function ProfilesView({ profiles, selectedProfileId, openProfile, createProfile }: { profiles: ReconciliationProfile[]; selectedProfileId: string; openProfile: (id: string) => void; createProfile: () => void }) {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => profiles.filter(profile => `${profile.name} ${profile.owner} ${profile.currency}`.toLowerCase().includes(search.toLowerCase())), [profiles, search]);
  const active = profiles.filter(profile => profile.status === "Active").length;
  const attention = profiles.filter(profile => profile.status !== "Active").length;

  return <div className="ops-content page-flow focused-profiles">
    <section className="essential-metrics compact"><article><p>Total profiles</p><h2>{profiles.length}</h2></article><article><p>Active</p><h2>{active}</h2></article><article><p>Needs setup</p><h2>{attention}</h2></article></section>
    <section className="profiles-card simple-profiles-card">
      <div className="table-toolbar"><div><p>Profile directory</p><h3>Reconciliation profiles</h3></div><div className="toolbar-actions"><label className="ops-search">⌕<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search profiles" /></label><button className="primary-action" onClick={createProfile}>Create profile</button></div></div>
      {visible.length ? <div className="simple-profile-list"><div className="simple-profile-head"><span>Profile</span><span>Match rate</span><span>Open exceptions</span><span>Next run</span><span>Status</span></div>{visible.map(profile => <button className={`simple-profile-row ${profile.id === selectedProfileId ? "selected" : ""}`} onClick={() => openProfile(profile.id)} key={profile.id}><span className="profile-avatar">{profile.name.split(" ").map(word => word[0]).join("").slice(0, 2)}</span><div><strong>{profile.name}</strong><small>{profile.currency} · {profile.owner}</small></div><b>{profile.matchRate}</b><span>{profile.openExceptions.toLocaleString()}</span><span>{profile.nextRun}</span><span><ProfileStatus status={profile.status} /><b>›</b></span></button>)}</div> : <div className="empty-workspace"><span>⌕</span><h3>No profiles found</h3><p>Try a different search.</p></div>}
    </section>
  </div>;
}
