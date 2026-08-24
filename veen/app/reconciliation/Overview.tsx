import { Kpi, RunsTable, SectionTitle, Stage } from "./Shared";
import type { DashboardMetrics, DataSource, ReconciliationRun, View } from "./types";

export function Overview({ metrics, runs, sources, navigate }: { metrics: DashboardMetrics; runs: ReconciliationRun[]; sources: DataSource[]; navigate: (view: View) => void }) {
  const readiness = Math.round(Number(metrics.matchRate.replace("%", ""))) || 0;
  const healthy = sources.filter(source => source.status === "Healthy").length;
  const delayed = sources.filter(source => source.status === "Delayed").length;
  const failed = sources.filter(source => source.status === "Failed").length;
  const recent = Math.round(metrics.openExceptions * .55);
  const dayTwo = Math.round(metrics.openExceptions * .25);
  const aged = Math.round(metrics.openExceptions * .14);
  const critical = Math.max(0, metrics.openExceptions - recent - dayTwo - aged);
  return <div className="ops-content">
    <div className="status-line"><div><span className="live-dot" />Live position <b>Aug 24, 2026</b><small>Mock backend refreshed just now</small></div><div><span>Close readiness</span><strong>{readiness}%</strong><i><b style={{ width: `${readiness}%` }} /></i></div></div>
    <section className="kpi-grid"><Kpi label="Total records processed" value={metrics.processed} badge="Today" tone="neutral" detail={`${runs.length} runs`} suffix="in this profile" /><Kpi label="Auto-match rate" value={metrics.matchRate} badge={readiness >= 98 ? "Healthy" : "Review"} tone={readiness >= 98 ? "good" : "warn"} detail={`${sources.length} sources`} suffix="in profile scope" /><Kpi label="Open exceptions" value={metrics.openExceptions.toLocaleString()} badge="Attention" tone="warn" detail={`${(aged + critical).toLocaleString()} aged`} suffix="beyond 48 hours" negative /><Kpi label="Unresolved value" value={metrics.unresolvedValue} badge="Control risk" tone="risk" detail="Profile-scoped" suffix="unresolved position" negative /></section>
    <section className="position-grid">
      <article className="pipeline-card">
        <SectionTitle eyebrow="Today’s processing position" title="Reconciliation pipeline" action="View match runs →" onAction={() => navigate("Match runs")} />
        <div className="pipeline pipeline-clickable">
          <button className="pipeline-stage" aria-label={`View ${metrics.pipeline.ingested} ingested records`} onClick={() => navigate("Imports")}><Stage icon="↓" tone="blue-stage" value={metrics.pipeline.ingested} label="Ingested" /></button>
          <i className="pipeline-connector" aria-hidden="true">›</i>
          <button className="pipeline-stage" aria-label={`View ${metrics.pipeline.normalized} normalized records`} onClick={() => navigate("Normalization")}><Stage icon="≡" tone="blue-stage" value={metrics.pipeline.normalized} label="Normalized" /></button>
          <i className="pipeline-connector" aria-hidden="true">›</i>
          <button className="pipeline-stage" aria-label={`View ${metrics.pipeline.matched} matched records`} onClick={() => navigate("Match runs")}><Stage icon="✓" tone="green-stage" value={metrics.pipeline.matched} label="Matched" /></button>
          <i className="pipeline-connector" aria-hidden="true">›</i>
          <button className="pipeline-stage" aria-label={`View ${metrics.pipeline.exceptions} exceptions`} onClick={() => navigate("Exceptions")}><Stage icon="!" tone="amber-stage" value={metrics.pipeline.exceptions} label="Exceptions" /></button>
        </div>
        <div className="pipeline-foot"><span><i className="source-dot good" />{healthy} sources healthy</span><span><i className="source-dot warn" />{delayed} delayed</span><span><i className="source-dot bad" />{failed} failed</span><b>{sources.length} profile connections</b></div>
      </article>
      <aside className="ageing-card"><SectionTitle eyebrow="Exception risk" title="Break ageing" action="Details" onAction={() => navigate("Exceptions")} /><div className="ageing-chart"><span style={{ height: "76%" }}><b>{recent.toLocaleString()}</b><i>0–24h</i></span><span style={{ height: "52%" }}><b>{dayTwo.toLocaleString()}</b><i>24–48h</i></span><span className="aged" style={{ height: "34%" }}><b>{aged.toLocaleString()}</b><i>2–5d</i></span><span className="critical" style={{ height: "21%" }}><b>{critical.toLocaleString()}</b><i>5d+</i></span></div></aside>
    </section>
    <RunsTable runs={runs} compact />
  </div>;
}
