import { useState } from "react";
import { Modal } from "./Shared";
import type { CreateProfileInput, DataSource } from "./types";

export function NewProfileModal({ sources, close, submit }: { sources: DataSource[]; close: () => void; submit: (input: CreateProfileInput) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("New reconciliation profile");
  const [description, setDescription] = useState("Daily control across payment source, ledger, and settlement records.");
  const [currency, setCurrency] = useState("CAD");
  const [timezone, setTimezone] = useState("America/Toronto");
  const [schedule, setSchedule] = useState("Daily · 08:00");
  const [sourceIds, setSourceIds] = useState<string[]>(sources.slice(0, 3).map(source => source.id));
  const toggleSource = (sourceId: string) => setSourceIds(current => current.includes(sourceId) ? current.filter(id => id !== sourceId) : [...current, sourceId]);
  const finish = () => submit({ name, description, status: "Draft", owner: "Nadia Khan", currency, timezone, schedule, sourceIds });
  return <Modal title={step === 1 ? "Create reconciliation profile" : "Choose shared connections"} eyebrow={`Profile setup · Step ${step} of 2`} close={close}>{step === 1 ? <div className="form-stack"><label>Profile name<input value={name} onChange={event => setName(event.target.value)} /></label><label>Description<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><div className="field-pair"><label>Base currency<select value={currency} onChange={event => setCurrency(event.target.value)}><option>CAD</option><option>USD</option><option>EUR</option><option>GBP</option></select></label><label>Timezone<select value={timezone} onChange={event => setTimezone(event.target.value)}><option>America/Toronto</option><option>America/New_York</option><option>Europe/London</option></select></label></div><label>Run schedule<select value={schedule} onChange={event => setSchedule(event.target.value)}><option>Daily · 08:00</option><option>Daily · 18:00</option><option>Every 2 hours</option><option>Manual only</option></select></label><button className="primary-action modal-primary" disabled={!name.trim()} onClick={() => setStep(2)}>Continue to connections →</button></div> : <div className="form-stack"><div className="profile-boundary-note"><strong>Connections are organization-level</strong><p>This profile references shared connections. Its mappings, matching rules, runs, exceptions, and reports remain isolated.</p></div><div className="source-select"><p>Select connections</p>{sources.map(source => <label key={source.id}><input type="checkbox" checked={sourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} /><span>{source.name}</span><small>{source.transport}</small></label>)}</div><div className="modal-actions"><button className="secondary-action" onClick={() => setStep(1)}>← Back</button><button className="primary-action" disabled={sourceIds.length < 2} onClick={finish}>Create draft profile</button></div></div>}</Modal>;
}
