"use client";

import { useMemo, useState } from "react";
import { AuditLogView } from "./reconciliation/AuditLogView";
import { BackOfficeModuleView } from "./reconciliation/BackOfficeModuleView";
import { ExceptionsView } from "./reconciliation/ExceptionsView";
import { ImportsView } from "./reconciliation/ImportsView";
import { NormalizationView } from "./reconciliation/NormalizationView";
import { ExceptionDrawer, NewRuleModal, NewRunModal } from "./reconciliation/Overlays";
import { Overview } from "./reconciliation/Overview";
import { PortfolioView } from "./reconciliation/PortfolioView";
import { NewProfileModal } from "./reconciliation/ProfileModal";
import { ProfilesView } from "./reconciliation/ProfilesView";
import { ReportsView } from "./reconciliation/ReportsView";
import { RulesView } from "./reconciliation/RulesView";
import { RunsView } from "./reconciliation/RunsView";
import { SettlementsView } from "./reconciliation/SettlementsView";
import { Sidebar } from "./reconciliation/Sidebar";
import { SourcesView } from "./reconciliation/SourcesView";
import { Topbar } from "./reconciliation/Topbar";
import { backOfficeModules } from "./reconciliation/data";
import type { BackOfficeModuleId, ReconciliationProfile, View } from "./reconciliation/types";
import { useReconciliationWorkspace } from "./reconciliation/useReconciliationWorkspace";

export default function Home() {
  const [active, setActive] = useState<View>("Portfolio");
  const [moduleId, setModuleId] = useState<BackOfficeModuleId>("reconciliation");
  const [exceptionSearch, setExceptionSearch] = useState("");
  const [severity, setSeverity] = useState("All severity");
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [newRun, setNewRun] = useState(false);
  const [newRule, setNewRule] = useState(false);
  const [newProfile, setNewProfile] = useState(false);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(false);
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
  const changeModule = (id: BackOfficeModuleId) => { setModuleId(id); setSelectedExceptionId(null); setNewRun(false); setNewRule(false); setNewProfile(false); };

  if (!workspace) return <main className="ops-loading"><span className="ops-logo">V</span><h1>Preparing Veen operations workspace</h1><p>{api.error || "Loading the mock backend and control data…"}</p></main>;

  return <main className="ops-shell">
    <Sidebar active={active} setActive={setActive} exceptionCount={workspace.metrics.openExceptions} profiles={workspace.profiles} moduleId={moduleId} setModuleId={changeModule} selectedProfileId={api.selectedProfileId} selectProfile={openProfile} />
    <section className="ops-workspace">
      {moduleId === "reconciliation" ? <><Topbar active={active} profile={currentProfile} notifications={notifications} setNotifications={setNotifications} onExport={() => void api.exportReport("Current snapshot").then(result => showToast(`${result.fileName} prepared`))} onNewRun={() => setNewRun(true)} onNewProfile={() => setNewProfile(true)} onProfiles={() => setActive("Profiles")} />
      {active === "Portfolio" && <PortfolioView profiles={workspace.profiles} openProfile={openProfile} createProfile={() => setNewProfile(true)} />}
      {active === "Profiles" && <ProfilesView profiles={workspace.profiles} selectedProfileId={api.selectedProfileId} openProfile={openProfile} createProfile={() => setNewProfile(true)} />}
      {active === "Overview" && <Overview metrics={workspace.metrics} runs={workspace.runs} sources={profileSources} navigate={setActive} />}
      {active === "Data sources" && <SourcesView sources={profileSources} retry={id => void api.testSource(id).then(source => showToast(`${source.name} connection healthy`))} />}
      {active === "Imports" && <ImportsView imports={workspace.imports} sources={profileSources} busy={api.busy} onIngest={input => void api.ingestFile({ ...input, profileId: api.selectedProfileId }).then(batch => showToast(`${batch.fileName} received`))} onValidate={id => void api.validateImport(id).then(() => showToast(`${id} passed file controls`))} onNormalize={id => void api.normalizeImport(id).then(() => showToast(`${id} normalized`))} />}
      {active === "Normalization" && <NormalizationView mappings={workspace.mappings} transactions={workspace.transactions} imports={workspace.imports} onNormalize={id => void api.normalizeImport(id).then(() => showToast(`${id} normalized to canonical model`))} />}
      {active === "Match runs" && <RunsView runs={workspace.runs} onNew={() => setNewRun(true)} />}
      {active === "Exceptions" && <ExceptionsView profile={currentProfile} items={filteredExceptions} search={exceptionSearch} setSearch={setExceptionSearch} severity={severity} setSeverity={setSeverity} resolved={workspace.exceptions.filter(item => item.status === "Resolved").map(item => item.id)} select={item => setSelectedExceptionId(item.id)} />}
      {active === "Matching rules" && <RulesView rules={workspace.rules} toggleRule={id => void api.toggleRule(id).then(rule => showToast(`${rule.name} ${rule.active ? "activated" : "paused"}`))} onNew={() => setNewRule(true)} />}
      {active === "Settlements" && <SettlementsView positions={workspace.settlements} />}
      {active === "Reports" && <ReportsView profile={currentProfile} exportReport={period => void api.exportReport(period).then(result => showToast(`${result.fileName} prepared`))} />}
      {active === "Audit log" && <AuditLogView events={workspace.auditEvents} />}</> : <BackOfficeModuleView module={selectedModule} />}
    </section>
    {moduleId === "reconciliation" && selectedException && <ExceptionDrawer item={selectedException} close={() => setSelectedExceptionId(null)} assign={owner => void api.assignException(selectedException.id, owner).then(() => showToast(`Assigned to ${owner}`))} comment={body => void api.addComment(selectedException.id, body).then(() => showToast("Investigation note added"))} manualMatch={() => void api.manualMatch(selectedException.id).then(() => showToast(`${selectedException.id} manually matched`))} resolve={reason => void api.resolveException(selectedException.id, { reason }).then(() => showToast(`${selectedException.id} resolved`))} />}
    {moduleId === "reconciliation" && newRun && currentProfile && <NewRunModal sources={profileSources} close={() => setNewRun(false)} submit={input => void api.createRun({ profileId: currentProfile.id, ...input }).then(run => { setNewRun(false); setActive("Match runs"); showToast(`${run.id} started`); })} />}
    {moduleId === "reconciliation" && newRule && currentProfile && <NewRuleModal sources={profileSources} close={() => setNewRule(false)} submit={input => void api.createRule({ profileId: currentProfile.id, ...input, priority: workspace.rules.length + 1, active: false }).then(rule => { setNewRule(false); showToast(`${rule.id} saved as draft`); })} />}
    {moduleId === "reconciliation" && newProfile && <NewProfileModal sources={workspace.sources} close={() => setNewProfile(false)} submit={input => void api.createProfile(input).then(finishProfile)} />}
    {api.busy && <div className="busy-indicator"><i />{api.busy}</div>}
    {toast && <div className="ops-toast"><span>✓</span>{toast}</div>}
  </main>;
}
