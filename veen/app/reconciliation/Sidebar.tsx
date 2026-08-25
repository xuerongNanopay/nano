import { backOfficeModules } from "./data";
import type { BackOfficeModuleId, NavigationItem, View } from "./types";

type NavItemProps = {
  active: View;
  exceptionCount: number;
  item: NavigationItem;
  setActive: (view: View) => void;
};

function NavItem({ active, exceptionCount, item, setActive }: NavItemProps) {
  const label = item.label === "Imports" ? "Data import" : item.label === "Match runs" ? "Run history" : item.label === "Audit log" ? "Audit trail" : item.label;
  return <button className={`simple-nav-item ${active === item.label ? "active" : ""}`} onClick={() => setActive(item.label)}><span>{item.icon}</span>{label}{item.label === "Exceptions" && exceptionCount > 0 && <b>{exceptionCount.toLocaleString()}</b>}</button>;
}

const essentialNavigation: NavigationItem[] = [
  { label: "Overview", icon: "◉" },
  { label: "Profiles", icon: "▦" },
  { label: "Imports", icon: "↓" },
  { label: "Exceptions", icon: "!" },
  { label: "Match runs", icon: "↻" },
  { label: "Audit log", icon: "☷" },
];

type SidebarProps = {
  active: View;
  setActive: (view: View) => void;
  exceptionCount: number;
  moduleId: BackOfficeModuleId;
  setModuleId: (id: BackOfficeModuleId) => void;
};

export function Sidebar({ active, setActive, exceptionCount, moduleId, setModuleId }: SidebarProps) {
  const selectedModule = backOfficeModules.find(module => module.id === moduleId) ?? backOfficeModules[0];
  return <aside className="ops-sidebar">
    <button className="ops-brand" type="button" onClick={() => { setModuleId("reconciliation"); setActive("Overview"); }}><span className="ops-logo">V</span><span><strong>Veen</strong><small>Operations Control</small></span></button>
    <nav aria-label="Back-office navigation">
      <label className="module-switcher"><span>Module</span><div><i>{selectedModule.icon}</i><select aria-label="Back-office module" value={moduleId} onChange={event => setModuleId(event.target.value as BackOfficeModuleId)}>{backOfficeModules.map(module => <option value={module.id} key={module.id}>{module.name}{module.status === "Planned" ? " — Planned" : ""}</option>)}</select></div></label>
      {moduleId === "reconciliation" ? <div className="reconciliation-nav-stack">
        <p className="sidebar-section-label">Reconciliation</p>
        <div className="simple-core-nav">{essentialNavigation.map(item => <NavItem active={active} exceptionCount={exceptionCount} item={item} setActive={setActive} key={item.label} />)}</div>
      </div> : <div className="planned-module-nav"><span>{selectedModule.icon}</span><strong>{selectedModule.name}</strong><small>Module navigation will appear here.</small></div>}
    </nav>
    <div className="ops-sidebar-bottom"><div className="environment"><i />Production <span>CA</span></div><button className="operator"><span>NK</span><span><strong>Nadia Khan</strong><small>Reconciliation Lead</small></span></button></div>
  </aside>;
}
