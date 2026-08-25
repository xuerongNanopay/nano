import type { DashboardMetrics, DataSource, ExceptionItem, ReconciliationProfile, ReconciliationRun, View } from "./types";

const severityOrder: Record<ExceptionItem["severity"], number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function Overview({ profile, metrics, runs, sources, exceptions, navigate, selectException }: { profile: ReconciliationProfile; metrics: DashboardMetrics; runs: ReconciliationRun[]; sources: DataSource[]; exceptions: ExceptionItem[]; navigate: (view: View) => void; selectException: (item: ExceptionItem) => void }) {
  const priorityItems = exceptions.filter(item => item.status !== "Resolved").sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.priority - b.priority).slice(0, 3);
  const critical = exceptions.filter(item => item.status !== "Resolved" && item.severity === "Critical").length;
  const healthySources = sources.filter(source => source.status === "Healthy").length;
  const sourceIssues = sources.length - healthySources;
  const latestRun = runs[0];
  const actionNeeded = critical > 0 || sources.some(source => source.status === "Failed");

  return <div className="ops-content focused-overview">
    <section className={`control-status ${actionNeeded ? "attention" : "healthy"}`}>
      <div><span className="control-state"><i />{actionNeeded ? "Action needed" : "On track"}</span><h2>{actionNeeded ? "Review the priority exceptions" : "Reconciliation is under control"}</h2><p>{metrics.openExceptions.toLocaleString()} exceptions remain open{critical ? `, including ${critical} critical item${critical === 1 ? "" : "s"}` : ""}.</p></div>
      <dl><div><dt>Last run</dt><dd>{profile.lastRun}</dd></div><div><dt>Next run</dt><dd>{profile.nextRun}</dd></div><div><dt>Owner</dt><dd>{profile.owner}</dd></div></dl>
      <button className="secondary-action" onClick={() => navigate("Exceptions")}>Review exceptions</button>
    </section>

    <section className="essential-metrics" aria-label="Key reconciliation status">
      <article><p>Match rate</p><h2>{metrics.matchRate}</h2><small>{latestRun?.status === "Review" ? "Latest run needs review" : "Latest run completed"}</small></article>
      <article><p>Open exceptions</p><h2>{metrics.openExceptions.toLocaleString()}</h2><small>{critical ? `${critical} critical in the priority queue` : "No critical items"}</small></article>
      <article><p>Unresolved value</p><h2>{metrics.unresolvedValue}</h2><small>Current financial exposure</small></article>
    </section>

    <section className="focused-grid">
      <article className="processing-card">
        <header><div><p>Latest processing status</p><h3>{latestRun?.name ?? "No reconciliation run"}</h3></div>{latestRun && <i className={`run-status ${latestRun.status.toLowerCase()}`}>{latestRun.status}</i>}</header>
        <div className="simple-pipeline">
          <div><span>1</span><p><strong>{metrics.processed}</strong><small>Records checked</small></p></div>
          <i aria-hidden="true">→</i>
          <div><span>2</span><p><strong>{metrics.pipeline.matched}</strong><small>Matched</small></p></div>
          <i aria-hidden="true">→</i>
          <div className="needs-review"><span>3</span><p><strong>{metrics.pipeline.exceptions}</strong><small>Needs review</small></p></div>
        </div>
        <footer><span><i className="source-dot good" />{healthySources} of {sources.length} sources healthy</span>{sourceIssues > 0 && <span><i className="source-dot warn" />{sourceIssues} source{sourceIssues === 1 ? "" : "s"} need attention</span>}<button onClick={() => navigate("Match runs")}>View run history</button></footer>
      </article>

      <article className="priority-card">
        <header><div><p>Priority queue</p><h3>Exceptions to review</h3></div><button onClick={() => navigate("Exceptions")}>View all</button></header>
        <div className="priority-list">{priorityItems.length ? priorityItems.map(item => <button onClick={() => selectException(item)} key={item.id}><div><strong>{item.type}</strong><small>{item.id} · {item.age} old</small></div><span>{item.amount}</span><i className={`severity-pill ${item.severity.toLowerCase()}`}>{item.severity}</i><b>›</b></button>) : <div className="priority-empty"><span>✓</span><p>No priority exceptions</p></div>}</div>
      </article>
    </section>
  </div>;
}
