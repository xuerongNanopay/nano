import { useState } from "react";
import type { ReconciliationRun } from "./types";

export function RunsView({ runs, onNew }: { runs: ReconciliationRun[]; onNew: () => void }) {
  const [filter, setFilter] = useState("All");
  const visible = runs.filter(run => filter === "All" || run.status === filter);
  return <div className="ops-content page-flow focused-runs">
    <section className="essential-metrics compact"><article><p>Running</p><h2>{runs.filter(run => run.status === "Running").length}</h2></article><article><p>Needs review</p><h2>{runs.filter(run => run.status === "Review").length}</h2></article><article><p>Completed</p><h2>{runs.filter(run => run.status === "Complete").length}</h2></article></section>
    <section className="runs-card full simple-runs-card"><div className="table-toolbar"><div><p>Processing history</p><h3>Reconciliation runs</h3></div><div className="toolbar-actions"><div className="segmented">{["All", "Review", "Complete"].map(item => <button className={filter === item ? "selected" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><button className="primary-action" onClick={onNew}>Run reconciliation</button></div></div>{visible.length ? <div className="simple-runs-list"><div className="simple-runs-head"><span>Reconciliation</span><span>Match rate</span><span>Exceptions</span><span>Status</span></div>{visible.map(run => <article className="simple-run-row" key={run.id}><div><strong>{run.name}</strong><small>{run.period} · {run.id}</small></div><b>{run.matched}</b><span>{run.breaks}</span><i className={`run-status ${run.status.toLowerCase()}`}>{run.status}</i></article>)}</div> : <div className="empty-workspace"><span>↻</span><h3>No runs in this view</h3><p>Choose another status or start a reconciliation.</p></div>}</section>
  </div>;
}
