import { useState } from "react";
import { Modal } from "./Shared";
import type { DataSource, ExceptionItem } from "./types";

export function ExceptionDrawer({ item, close, assign, comment, resolve }: { item: ExceptionItem; close: () => void; assign: (owner: string) => void; comment: (body: string) => void; resolve: (reason: string) => void }) {
  const [owner, setOwner] = useState(item.owner);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("Approved adjustment");
  const resolved = item.status === "Resolved";

  return <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><aside className="exception-drawer focused-drawer">
    <header><div><p>{item.id}</p><h2>{item.type}</h2></div><button aria-label="Close exception" onClick={close}>×</button></header>
    <div className="drawer-meta"><span className={`severity-pill ${item.severity.toLowerCase()}`}>{item.severity}</span><span className={`state-pill ${resolved ? "resolved" : item.status.toLowerCase()}`}>{item.status}</span><b>{item.age} old</b></div>
    <section className="break-amount"><p>Unmatched amount</p><h3>{item.amount}</h3><small>{item.source} · {item.reference}</small><p className="break-reason">{item.reason}</p></section>
    <div className="drawer-body focused-investigation">
      <label>Owner<select value={owner} onChange={event => { setOwner(event.target.value); assign(event.target.value); }}><option>Unassigned</option><option>Nadia Khan</option><option>Marcus Reed</option><option>Priya Shah</option><option>Elena Park</option></select></label>
      <div className="comparison"><div><p>Source record</p><strong>{item.sourceAmount}</strong></div><b>≠</b><div><p>Ledger candidate</p><strong>{item.candidateAmount}</strong></div></div>
      <label>Investigation note<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Add evidence or a next step" /></label>
      <button className="secondary-action drawer-note" disabled={!note.trim()} onClick={() => { comment(note); setNote(""); }}>Add note</button>
      <label>Resolution reason<select value={reason} onChange={event => setReason(event.target.value)}><option>Approved adjustment</option><option>Timing difference accepted</option><option>Duplicate quarantined</option><option>Source corrected</option><option>False positive</option></select></label>
      {item.comments.slice(-2).map(entry => <div className="comment-card" key={entry.id}><strong>{entry.author}</strong><span>{entry.createdAt}</span><p>{entry.body}</p></div>)}
    </div>
    <footer><button className="secondary-action" onClick={close}>Close</button><button className="primary-action" onClick={() => resolve(reason)} disabled={resolved}>{resolved ? "Resolved" : "Resolve exception"}</button></footer>
  </aside></div>;
}

export function NewRunModal({ sources, close, submit }: { sources: DataSource[]; close: () => void; submit: (input: { name: string; sourceIds: string[]; ruleSet: string }) => void }) {
  const [name, setName] = useState("Daily reconciliation");
  const [ruleSet, setRuleSet] = useState("Profile default rule set");
  const sourceIds = sources.map(source => source.id);

  return <Modal title="Run reconciliation" eyebrow="Current profile" close={close}><div className="form-stack simple-run-form">
    <label>Run name<input value={name} onChange={event => setName(event.target.value)} /></label>
    <div className="source-summary"><p>Sources</p><div>{sources.map(source => <span key={source.id}><i className={`source-dot ${source.status === "Healthy" ? "good" : "warn"}`} />{source.name}</span>)}</div></div>
    <label>Matching rules<select value={ruleSet} onChange={event => setRuleSet(event.target.value)}><option>Profile default rule set</option><option>Exact reference & amount</option><option>Settlement date tolerance</option></select></label>
    <div className="modal-actions"><button className="secondary-action" onClick={close}>Cancel</button><button className="primary-action" disabled={!name.trim() || sourceIds.length < 2} onClick={() => submit({ name, sourceIds, ruleSet })}>Start reconciliation</button></div>
  </div></Modal>;
}
