import type { AuditEvent } from "./types";

export function AuditLogView({ events }: { events: AuditEvent[] }) {
  return <div className="ops-content page-flow"><section className="audit-card focused-audit"><div className="table-toolbar"><div><p>Control history</p><h3>Audit trail</h3></div></div>{events.length ? <div className="audit-timeline">{events.map(event => <article key={event.id}><time><b>Aug 24</b><span>{event.time}</span></time><i className={event.actor === "System" ? "system" : "human"}>{event.actor === "System" ? "S" : event.actor.split(" ").map(part => part[0]).join("")}</i><div><strong>{event.action} <button>{event.target}</button></strong><small>{event.detail}</small></div><span>{event.actor}</span></article>)}</div> : <div className="empty-workspace"><span>◷</span><h3>No control activity yet</h3><p>Reconciliation decisions will appear here.</p></div>}</section></div>;
}
