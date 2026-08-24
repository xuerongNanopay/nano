import { useState } from "react";
import { RunRows } from "./Shared";
import type { ReconciliationRun } from "./types";

export function RunsView({ runs, onNew }: { runs: ReconciliationRun[]; onNew: () => void }) {
  const [filter, setFilter] = useState("All");
  const visible = runs.filter(run => filter === "All" || (filter === "Review" && run.status === "Review") || (filter === "Complete" && run.status === "Complete"));
  return <div className="ops-content page-flow"><section className="rec-summary"><article><span className="stage-icon blue-stage">↻</span><div><small>Running now</small><strong>{runs.filter(run => run.status === "Running").length}</strong></div></article><article><span className="stage-icon amber-stage">!</span><div><small>Needs review</small><strong>{runs.filter(run => run.status === "Review").length}</strong></div></article><article><span className="stage-icon green-stage">✓</span><div><small>Completed</small><strong>{runs.filter(run => run.status === "Complete").length}</strong></div></article><div><p>Profile schedule</p><strong>Next configured cycle</strong><small>Controlled by this profile</small></div></section><section className="runs-card full"><div className="table-toolbar"><div><p>Profile processing history</p><h3>Reconciliation runs</h3></div><div className="toolbar-actions"><div className="segmented">{["All", "Review", "Complete"].map(item => <button className={filter === item ? "selected" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><button className="primary-action" onClick={onNew}>＋ New run</button></div></div><RunRows items={visible} /></section></div>;
}
