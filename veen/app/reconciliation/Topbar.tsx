import { pageTitles } from "./data";
import type { ReconciliationProfile, View } from "./types";

type TopbarProps = {
  active: View;
  profile?: ReconciliationProfile;
  notifications: boolean;
  setNotifications: (open: boolean) => void;
  onExport: () => void;
  onNewRun: () => void;
  onNewProfile: () => void;
  onProfiles: () => void;
};

export function Topbar({ active, profile, notifications, setNotifications, onExport, onNewRun, onNewProfile, onProfiles }: TopbarProps) {
  const globalView = active === "Portfolio" || active === "Profiles";
  const breadcrumb = globalView ? `Reconciliation / ${pageTitles[active][0]}` : `Reconciliation / ${profile?.name ?? "Profile"} / ${pageTitles[active][0]}`;
  return <header className="ops-topbar"><div><p>{breadcrumb}</p><h1>{pageTitles[active][1]}</h1></div><div className="ops-actions">{!globalView && profile && <button className="topbar-profile" onClick={onProfiles}><span>{profile.name.split(" ").map(word => word[0]).join("").slice(0, 2)}</span><b>{profile.name}</b></button>}<button className="icon-action" aria-label="Search">⌕</button><div className="notify-wrap"><button className="icon-action" aria-label="Notifications" onClick={() => setNotifications(!notifications)}>●<i /></button>{notifications && <div className="ops-notifications"><strong>{profile ? `${profile.name} alerts` : "Portfolio alerts"}</strong>{profile ? <><article><i className="warn" />{profile.openExceptions.toLocaleString()} exceptions remain open<small>Profile operational queue</small></article><article><i className={profile.status === "Active" ? "good" : "warn"} />Profile status is {profile.status.toLowerCase()}<small>{profile.schedule}</small></article></> : <article><i className="warn" />Review profiles outside close readiness<small>Portfolio control</small></article>}</div>}</div>{!globalView && <button className="secondary-action" onClick={onExport}>↓ Export snapshot</button>}<button className="primary-action" onClick={globalView ? onNewProfile : onNewRun}>{globalView ? "＋ Create profile" : "＋ New reconciliation"}</button></div></header>;
}
