import { useRef, useState } from "react";
import type { DataSource, ImportBatch, IngestFileInput } from "./types";

export function ImportsView({ imports, sources, onIngest, onValidate, onNormalize, busy }: { imports: ImportBatch[]; sources: DataSource[]; onIngest: (input: Omit<IngestFileInput, "profileId">) => void; onValidate: (id: string) => void; onNormalize: (id: string) => void; busy: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [error, setError] = useState("");

  const upload = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setError("Choose a CSV file."); return; }
    if (!sourceId) { setError("Choose a data source first."); return; }
    setError("");
    onIngest({ fileName: file.name, sourceId, size: file.size });
    if (fileRef.current) fileRef.current.value = "";
  };

  return <div className="ops-content page-flow focused-imports">
    <section className="csv-import-card">
      <header><div><p>External data</p><h2>Upload a CSV file</h2><small>Add transaction or settlement records to the active reconciliation profile.</small></div><label>Data source<select value={sourceId} onChange={event => setSourceId(event.target.value)}>{sources.map(source => <option value={source.id} key={source.id}>{source.name}</option>)}</select></label></header>
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={event => upload(event.target.files?.[0])} hidden />
      <button className="csv-drop-zone" type="button" disabled={Boolean(busy) || !sources.length} onClick={() => fileRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); upload(event.dataTransfer.files?.[0]); }}><span>↓</span><strong>Choose a CSV file</strong><small>or drag and drop it here</small></button>
      {error && <p className="csv-error">{error}</p>}
    </section>

    <section className="imports-card simple-imports-card"><div className="table-toolbar"><div><p>Import history</p><h3>CSV batches</h3></div><span className="backend-chip"><i />Mock data storage</span></div>{imports.length ? <div className="simple-import-list"><div className="simple-import-head"><span>File</span><span>Records</span><span>Issues</span><span>Status</span><span>Next step</span></div>{imports.map(batch => {
      const complete = batch.status === "Normalized";
      const failed = batch.status === "Failed";
      const action = batch.status === "Validating" ? "Validate" : batch.status === "Validated" ? "Prepare for matching" : complete ? "Ready" : "Fix file";
      return <article className="simple-import-row" key={batch.id}><div><strong>{batch.fileName}</strong><small>{batch.sourceName} · {batch.receivedAt}</small></div><span>{batch.records.toLocaleString()}</span><span>{batch.issues.length || "—"}</span><i className={`run-status ${failed ? "review" : complete ? "complete" : "running"}`}>{batch.status}</i><button onClick={() => batch.status === "Validating" ? onValidate(batch.id) : onNormalize(batch.id)} disabled={failed || complete || Boolean(busy)}>{action}</button></article>;
    })}</div> : <div className="empty-workspace"><span>↓</span><h3>No CSV files imported</h3><p>Choose a file above to create the first batch.</p></div>}</section>
  </div>;
}
