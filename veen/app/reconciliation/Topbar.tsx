import { pageTitles } from "./data";
import type { ReconciliationProfile, View } from "./types";

type TopbarProps = {
  active: View;
  profiles: ReconciliationProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onNewRun: () => void;
  onNewProfile: () => void;
};

export function Topbar({ active, profiles, selectedProfileId, onSelectProfile, onNewRun, onNewProfile }: TopbarProps) {
  const profile = profiles.find(item => item.id === selectedProfileId) ?? profiles[0];
  const profilesView = active === "Profiles";
  const importsView = active === "Imports";
  return <header className="ops-topbar focused-topbar"><div><p>Reconciliation · {profilesView ? "Profile management" : profile?.status ?? "Profile"}</p><h1>{pageTitles[active][1]}</h1></div><div className="ops-actions"><label className="topbar-profile-select"><span>Profile</span><select aria-label="Active reconciliation profile" value={selectedProfileId} onChange={event => onSelectProfile(event.target.value)}>{profiles.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>{!importsView && <button className="primary-action" onClick={profilesView ? onNewProfile : onNewRun}>{profilesView ? "Create profile" : "Run reconciliation"}</button>}</div></header>;
}
