import type { ReactNode } from "react";
import type { ReconciliationRun } from "./types";

export function Kpi({ label, value, badge, tone, detail, suffix, negative }: { label: string; value: string; badge: string; tone: string; detail: string; suffix: string; negative?: boolean }) {
  return <article><div><p>{label}</p><span className={`${tone}-badge`}>{badge}</span></div><h2>{value}</h2><small><b className={negative ? "down" : "up"}>{detail}</b>{suffix}</small></article>;
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="card-title"><div><p>{eyebrow}</p><h3>{title}</h3></div>{action && <button onClick={onAction}>{action}</button>}</div>;
}

export function Stage({ icon, tone, value, label }: { icon: string; tone: string; value: string; label: string }) {
  return <div><span className={`stage-icon ${tone}`}>{icon}</span><p><strong>{value}</strong><small>{label}</small></p></div>;
}

export function RunsTable({ runs, compact }: { runs: ReconciliationRun[]; compact?: boolean }) {
  return <section className={`runs-card ${compact ? "" : "full"}`}><div className="card-title"><div><p>Active work</p><h3>Recent reconciliation runs</h3></div><div className="run-filters"><button className="selected">All runs</button><button>Needs review</button><button>Completed</button></div></div><RunRows items={compact ? runs.slice(0, 4) : runs} /></section>;
}

export function RunRows({ items }: { items: ReconciliationRun[] }) {
  return items.length ? <div className="runs-table"><div className="run-head"><span>Reconciliation</span><span>Records</span><span>Match rate</span><span>Breaks</span><span>Unresolved value</span><span>Status</span></div>{items.map(run => <button className="run-row" key={run.id}><div><strong>{run.name}</strong><small>{run.id} · {run.sources}</small></div><span>{run.volume}</span><span><b className={Number(run.matched.slice(0, -1)) < 98 ? "low-rate" : ""}>{run.matched}</b></span><span>{run.breaks}</span><span>{run.value}</span><span><i className={`run-status ${run.status.toLowerCase()}`}>{run.status}</i><b>›</b></span></button>)}</div> : <div className="empty-workspace"><span>↻</span><h3>No reconciliation runs yet</h3><p>Create the first run for this profile when its sources and rules are ready.</p></div>;
}

export function ReportCard({ title, detail, cadence }: { title: string; detail: string; cadence: string }) {
  return <article><span className="report-icon">▥</span><div><h3>{title}</h3><p>{detail}</p><small>{cadence}</small></div><button>View report →</button></article>;
}

export function Modal({ title, eyebrow, close, children }: { title: string; eyebrow: string; close: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><section className="ops-modal"><header><div><p>{eyebrow}</p><h2>{title}</h2></div><button onClick={close}>×</button></header><div className="modal-content">{children}</div></section></div>;
}
