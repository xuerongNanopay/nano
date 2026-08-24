import { useState } from "react";
import { backOfficeModules, controlNavigation, dataNavigation, portfolioNavigation, primaryProfileNavigation } from "./data";
import type { BackOfficeModuleId, NavigationItem, ReconciliationProfile, View } from "./types";

type NavItemProps = {
  active: View;
  exceptionCount: number;
  item: NavigationItem;
  setActive: (view: View) => void;
};

function NavItem({ active, exceptionCount, item, setActive }: NavItemProps) {
  return <button className={`simple-nav-item ${active === item.label ? "active" : ""}`} onClick={() => setActive(item.label)}><span>{item.icon}</span>{item.label}{item.label === "Exceptions" && exceptionCount > 0 && <b>{exceptionCount.toLocaleString()}</b>}</button>;
}

type NavGroupProps = Omit<NavItemProps, "item"> & { icon: string; items: NavigationItem[]; label: string };

function NavGroup({ active, exceptionCount, icon, items, label, setActive }: NavGroupProps) {
  const activeInside = items.some(item => item.label === active);
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const [collapsedActive, setCollapsedActive] = useState<View | null>(null);
  const expanded = activeInside ? collapsedActive !== active : manuallyExpanded;
  const toggle = () => activeInside ? setCollapsedActive(expanded ? active : null) : setManuallyExpanded(current => !current);
  return <div className="nav-group"><button className={`nav-group-toggle ${activeInside ? "contains-active" : ""}`} type="button" aria-expanded={expanded} onClick={toggle}><span>{icon}</span><strong>{label}</strong><i>{expanded ? "−" : "+"}</i></button>{expanded && <div className="nav-group-items">{items.map(item => <NavItem active={active} exceptionCount={exceptionCount} item={item} setActive={setActive} key={item.label} />)}</div>}</div>;
}

type SidebarProps = {
  active: View;
  setActive: (view: View) => void;
  exceptionCount: number;
  profiles: ReconciliationProfile[];
  moduleId: BackOfficeModuleId;
  setModuleId: (id: BackOfficeModuleId) => void;
  selectedProfileId: string;
  selectProfile: (id: string) => void;
};

export function Sidebar({ active, setActive, exceptionCount, profiles, moduleId, setModuleId, selectedProfileId, selectProfile }: SidebarProps) {
  const selected = profiles.find(profile => profile.id === selectedProfileId) ?? profiles[0];
  const selectedModule = backOfficeModules.find(module => module.id === moduleId) ?? backOfficeModules[0];
  const initials = selected?.name.split(" ").map(word => word[0]).join("").slice(0, 2);
  return <aside className="ops-sidebar">
    <button className="ops-brand" type="button" onClick={() => { setModuleId("reconciliation"); setActive("Portfolio"); }}><span className="ops-logo">V</span><span><strong>Veen</strong><small>Operations Control</small></span></button>
    <nav aria-label="Back-office navigation">
      <label className="module-switcher"><span>Back-office module</span><div><i>{selectedModule.icon}</i><select aria-label="Back-office module" value={moduleId} onChange={event => setModuleId(event.target.value as BackOfficeModuleId)}>{backOfficeModules.map(module => <option value={module.id} key={module.id}>{module.name}{module.status === "Planned" ? " — Planned" : ""}</option>)}</select></div><small>{selectedModule.description}</small></label>
      {moduleId === "reconciliation" ? <div className="reconciliation-nav-stack">
        <div className="reconciliation-mainmenu" aria-label="Portfolio navigation">{portfolioNavigation.map(item => <NavItem active={active} exceptionCount={exceptionCount} item={item} setActive={setActive} key={item.label} />)}</div>
        <label className="profile-switcher"><span>Profile</span><div><i>{initials}</i><select aria-label="Active reconciliation profile" value={selectedProfileId} onChange={event => selectProfile(event.target.value)}>{profiles.map(profile => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></div><small>{selected?.status} · {selected?.currency}</small></label>
        <p className="sidebar-section-label">Profile workspace</p>
        <div className="simple-core-nav">{primaryProfileNavigation.map(item => <NavItem active={active} exceptionCount={exceptionCount} item={item} setActive={setActive} key={item.label} />)}</div>
        <NavGroup active={active} exceptionCount={exceptionCount} icon="↓" items={dataNavigation} label="Data preparation" setActive={setActive} />
        <NavGroup active={active} exceptionCount={exceptionCount} icon="⌘" items={controlNavigation} label="Controls & reports" setActive={setActive} />
      </div> : <div className="planned-module-nav"><span>{selectedModule.icon}</span><strong>{selectedModule.name}</strong><small>Module navigation will appear here.</small></div>}
    </nav>
    <div className="ops-sidebar-bottom"><div className="environment"><i />Production <span>CA</span></div><button className="operator"><span>NK</span><span><strong>Nadia Khan</strong><small>Reconciliation Lead</small></span></button></div>
  </aside>;
}
