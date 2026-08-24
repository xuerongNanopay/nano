import type { BackOfficeModule } from "./types";

export function BackOfficeModuleView({ module }: { module: BackOfficeModule }) {
  return <><header className="ops-topbar module-topbar"><div><p>Back office / {module.name}</p><h1>{module.name}</h1></div><span className="module-status">{module.status}</span></header><div className="ops-content"><section className="module-workspace-placeholder"><span>{module.icon}</span><p>BACK-OFFICE MODULE</p><h2>{module.name}</h2><small>{module.description}. This module now has its own navigation boundary and can be developed without changing the global sidebar structure.</small><div><i /><strong>Module shell ready</strong><small>Workflows and permissions can be added next</small></div></section></div></>;
}
