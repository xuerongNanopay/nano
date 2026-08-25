import { useState } from "react";
import { Modal } from "./Shared";
import type { CreateProfileInput, DataSource } from "./types";

export function NewProfileModal({ sources, close, submit }: { sources: DataSource[]; close: () => void; submit: (input: CreateProfileInput) => void }) {
  const [name, setName] = useState("New reconciliation profile");
  const [description, setDescription] = useState("Daily payment reconciliation control.");
  const [currency, setCurrency] = useState("CAD");
  const [schedule, setSchedule] = useState("Daily · 08:00");
  const [sourceIds, setSourceIds] = useState<string[]>(sources.slice(0, 3).map(source => source.id));
  const toggleSource = (sourceId: string) => setSourceIds(current => current.includes(sourceId) ? current.filter(id => id !== sourceId) : [...current, sourceId]);
  const finish = () => submit({ name, description, status: "Draft", owner: "Nadia Khan", currency, timezone: "America/Toronto", schedule, sourceIds });

  return <Modal title="Create profile" eyebrow="Reconciliation profile" close={close}><div className="form-stack simple-profile-form">
    <label>Profile name<input value={name} onChange={event => setName(event.target.value)} /></label>
    <label>Description<textarea value={description} onChange={event => setDescription(event.target.value)} /></label>
    <div className="field-pair"><label>Currency<select value={currency} onChange={event => setCurrency(event.target.value)}><option>CAD</option><option>USD</option><option>EUR</option><option>GBP</option></select></label><label>Schedule<select value={schedule} onChange={event => setSchedule(event.target.value)}><option>Daily · 08:00</option><option>Daily · 18:00</option><option>Every 2 hours</option><option>Manual only</option></select></label></div>
    <div className="source-select compact-source-select"><p>Connected sources</p>{sources.map(source => <label key={source.id}><input type="checkbox" checked={sourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} /><span>{source.name}</span><small>{source.transport}</small></label>)}</div>
    <div className="modal-actions"><button className="secondary-action" onClick={close}>Cancel</button><button className="primary-action" disabled={!name.trim() || sourceIds.length < 2} onClick={finish}>Create profile</button></div>
  </div></Modal>;
}
