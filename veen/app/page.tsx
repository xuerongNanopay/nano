"use client";

import { useMemo, useState } from "react";
import { AuditLogView } from "./reconciliation/AuditLogView";
import { BackOfficeModuleView } from "./reconciliation/BackOfficeModuleView";
import { ExceptionsView } from "./reconciliation/ExceptionsView";
import { ImportsView } from "./reconciliation/ImportsView";
import { ExceptionDrawer, NewRunModal } from "./reconciliation/Overlays";
import { Overview } from "./reconciliation/Overview";
import { NewProfileModal } from "./reconciliation/ProfileModal";
import { ProfilesView } from "./reconciliation/ProfilesView";
import { RunsView } from "./reconciliation/RunsView";
import { Sidebar } from "./reconciliation/Sidebar";
import { Topbar } from "./reconciliation/Topbar";
import { backOfficeModules } from "./reconciliation/data";
import type { BackOfficeModuleId, ReconciliationProfile, View } from "./reconciliation/types";
import { useReconciliationWorkspace } from "./reconciliation/useReconciliationWorkspace";

export default function Home() {
  const [active, setActive] = useState<View>("Overview");
  const [moduleId, setModuleId] = useState<BackOfficeModuleId>("reconciliation");
  const [exceptionSearch, setExceptionSearch] = useState("");
  const [severity, setSeverity] = useState("All severity");
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [newRun, setNewRun] = useState(false);
  const [newProfile, setNewProfile] = useState(false);
  const [toast, setToast] = useState("");
  const api = useReconciliationWorkspace();

  const workspace = api.workspace;
  const currentProfile = workspace?.profiles.find(profile => profile.id === api.selectedProfileId);
  const profileSources = currentProfile ? workspace?.sources.filter(source => currentProfile.sourceIds.includes(source.id)) ?? [] : [];
  const filteredExceptions = useMemo(() => (workspace?.exceptions ?? []).filter(item => `${item.id} ${item.reference} ${item.type} ${item.source}`.toLowerCase().includes(exceptionSearch.toLowerCase()) && (severity === "All severity" || item.severity === severity)), [workspace, exceptionSearch, severity]);
  const selectedException = workspace?.exceptions.find(item => item.id === selectedExceptionId) ?? null;
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const openProfile = (profileId: string) => void api.selectProfile(profileId).then(() => { setActive("Overview"); setSelectedExceptionId(null); });
  const finishProfile = (profile: ReconciliationProfile) => void api.selectProfile(profile.id).then(() => { setNewProfile(false); setActive("Overview"); showToast(`${profile.name} created`); });
  const selectedModule = backOfficeModules.find(module => module.id === moduleId) ?? backOfficeModules[0];
  const changeModule = (id: BackOfficeModuleId) => { setModuleId(id); setSelectedExceptionId(null); setNewRun(false); setNewProfile(false); if (id === "reconciliation") setActive("Overview"); };

  if (!workspace) return <main className="ops-loading"><span className="ops-logo">V</span><h1>Preparing Veen operations workspace</h1><p>{api.error || "Loading the mock backend and control data…"}</p></main>;

  return <main className="ops-shell">
    <Sidebar active={active} setActive={setActive} exceptionCount={workspace.metrics.openExceptions} moduleId={moduleId} setModuleId={changeModule} />
    <section className="ops-workspace">
      {moduleId === "reconciliation" ? <><Topbar active={active} profiles={workspace.profiles} selectedProfileId={api.selectedProfileId} onSelectProfile={openProfile} onNewRun={() => setNewRun(true)} onNewProfile={() => setNewProfile(true)} />
      {active === "Overview" && currentProfile && <Overview profile={currentProfile} metrics={workspace.metrics} runs={workspace.runs} sources={profileSources} exceptions={workspace.exceptions} navigate={setActive} selectException={item => setSelectedExceptionId(item.id)} />}
      {active === "Profiles" && <ProfilesView profiles={workspace.profiles} selectedProfileId={api.selectedProfileId} openProfile={openProfile} createProfile={() => setNewProfile(true)} />}
      {active === "Imports" && <ImportsView imports={workspace.imports} sources={profileSources} busy={api.busy} onIngest={input => void api.ingestFile({ ...input, profileId: api.selectedProfileId }).then(batch => showToast(`${batch.fileName} received`))} onValidate={id => void api.validateImport(id).then(() => showToast(`${id} validated`))} onNormalize={id => void api.normalizeImport(id).then(() => showToast(`${id} ready for matching`))} />}
      {active === "Match runs" && <RunsView runs={workspace.runs} onNew={() => setNewRun(true)} />}
      {active === "Exceptions" && <ExceptionsView profile={currentProfile} items={filteredExceptions} search={exceptionSearch} setSearch={setExceptionSearch} severity={severity} setSeverity={setSeverity} resolved={workspace.exceptions.filter(item => item.status === "Resolved").map(item => item.id)} select={item => setSelectedExceptionId(item.id)} />}
      {active === "Audit log" && <AuditLogView events={workspace.auditEvents} />}</> : <BackOfficeModuleView module={selectedModule} />}
    </section>
    {moduleId === "reconciliation" && selectedException && <ExceptionDrawer item={selectedException} close={() => setSelectedExceptionId(null)} assign={owner => void api.assignException(selectedException.id, owner).then(() => showToast(`Assigned to ${owner}`))} comment={body => void api.addComment(selectedException.id, body).then(() => showToast("Investigation note added"))} resolve={reason => void api.resolveException(selectedException.id, { reason }).then(() => showToast(`${selectedException.id} resolved`))} />}
    {moduleId === "reconciliation" && newRun && currentProfile && <NewRunModal sources={profileSources} close={() => setNewRun(false)} submit={input => void api.createRun({ profileId: currentProfile.id, ...input }).then(run => { setNewRun(false); setActive("Match runs"); showToast(`${run.id} started`); })} />}
    {moduleId === "reconciliation" && newProfile && <NewProfileModal sources={workspace.sources} close={() => setNewProfile(false)} submit={input => void api.createProfile(input).then(finishProfile)} />}
    {api.busy && <div className="busy-indicator"><i />{api.busy}</div>}
    {toast && <div className="ops-toast"><span>✓</span>{toast}</div>}
  </main>;
}
