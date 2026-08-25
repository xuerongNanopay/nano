import type { ReconciliationBackend, ReconciliationRepository } from "./contracts";
import type { AuditEvent, ExceptionItem, ReconciliationProfile, WorkspaceSnapshot } from "../types";
import { MockReconciliationRepository } from "./mock-repository";

const id = (prefix: string) => `${prefix}-${Date.now().toString().slice(-6)}`;
const now = () => "Today · Just now";
const numberFrom = (value: string) => Number(value.replaceAll(",", "")) || 0;

function profileMetrics(profile: ReconciliationProfile, snapshot: WorkspaceSnapshot) {
  const imports = snapshot.imports.filter(item => item.profileId === profile.id);
  const runs = snapshot.runs.filter(item => item.profileId === profile.id);
  const records = imports.reduce((total, item) => total + item.records, 0) || runs.reduce((total, run) => total + numberFrom(run.volume), 0);
  const normalized = imports.filter(item => item.status === "Normalized").reduce((total, item) => total + item.validRecords, 0);
  const matchRate = Number(profile.matchRate.replace("%", "")) || 0;
  const matched = Math.round(records * (matchRate / 100));
  return {
    processed: records.toLocaleString(),
    matchRate: profile.matchRate,
    openExceptions: profile.openExceptions,
    unresolvedValue: profile.unresolvedValue,
    pipeline: {
      ingested: records.toLocaleString(),
      normalized: (normalized || records).toLocaleString(),
      matched: matched.toLocaleString(),
      exceptions: profile.openExceptions.toLocaleString(),
    },
  };
}

function scopeSnapshot(snapshot: WorkspaceSnapshot, profileId?: string): WorkspaceSnapshot {
  if (!profileId) return snapshot;
  const profile = snapshot.profiles.find(item => item.id === profileId);
  if (!profile) throw new Error(`Profile ${profileId} was not found`);
  const belongs = <T extends { profileId: string }>(items: T[]) => items.filter(item => item.profileId === profileId);
  return {
    ...snapshot,
    metrics: profileMetrics(profile, snapshot),
    imports: belongs(snapshot.imports),
    transactions: belongs(snapshot.transactions),
    mappings: belongs(snapshot.mappings),
    runs: belongs(snapshot.runs),
    exceptions: belongs(snapshot.exceptions),
    rules: belongs(snapshot.rules),
    settlements: belongs(snapshot.settlements),
    auditEvents: belongs(snapshot.auditEvents),
  };
}

export function createReconciliationBackend(repository: ReconciliationRepository): ReconciliationBackend {
  const audit = (profileId: string, action: string, target: string, detail: string): Promise<AuditEvent> => repository.appendAudit({ id: id("AUD"), profileId, time: new Date().toLocaleTimeString("en-CA", { hour12: false }), actor: "Nadia Khan", action, target, detail });
  const exception = async (exceptionId: string): Promise<ExceptionItem> => {
    const item = (await repository.getSnapshot()).exceptions.find(current => current.id === exceptionId);
    if (!item) throw new Error(`Exception ${exceptionId} was not found`);
    return item;
  };

  return {
    getWorkspaceSnapshot: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId),
    listProfiles: async () => (await repository.getSnapshot()).profiles,
    getProfile: async profileId => {
      const profile = (await repository.getSnapshot()).profiles.find(item => item.id === profileId);
      if (!profile) throw new Error(`Profile ${profileId} was not found`);
      return profile;
    },
    createProfile: async input => {
      const profile = await repository.saveProfile({ ...input, id: id("PROF"), lastRun: "Never", nextRun: input.status === "Active" ? input.schedule : "Not scheduled", matchRate: "—", openExceptions: 0, unresolvedValue: "$0" });
      await audit(profile.id, "Created reconciliation profile", profile.id, profile.name);
      return profile;
    },
    listDataSources: async () => (await repository.getSnapshot()).sources,
    testDataSource: async (sourceId, profileId) => {
      const source = (await repository.getSnapshot()).sources.find(item => item.id === sourceId);
      if (!source) throw new Error(`Source ${sourceId} was not found`);
      const saved = await repository.saveSource({ ...source, status: "Healthy", sync: "Just now", latency: "2m 18s" });
      await audit(profileId, "Tested data source", saved.name, "Connection and completeness controls passed");
      return saved;
    },
    listImports: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).imports,
    ingestFile: async input => {
      const snapshot = await repository.getSnapshot();
      const source = snapshot.sources.find(item => item.id === input.sourceId) ?? snapshot.sources[0];
      const batch = await repository.saveImport({ id: id("IMP"), profileId: input.profileId, fileName: input.fileName, sourceId: source.id, sourceName: source.name, receivedAt: now(), records: Math.max(1, Math.round(input.size / 76)), validRecords: 0, duplicates: 0, status: "Validating", checksum: `${Math.random().toString(16).slice(2, 6)}…mock`, issues: [] });
      await audit(input.profileId, "Ingested file", batch.id, `${batch.fileName} from ${batch.sourceName}`);
      return batch;
    },
    validateImport: async importId => {
      const batch = (await repository.getSnapshot()).imports.find(item => item.id === importId);
      if (!batch) throw new Error(`Import ${importId} was not found`);
      const saved = await repository.saveImport({ ...batch, validRecords: batch.records, status: "Validated", issues: [] });
      await audit(batch.profileId, "Validated import", saved.id, `${saved.records.toLocaleString()} records passed controls`);
      return saved;
    },
    normalizeImport: async importId => {
      const batch = (await repository.getSnapshot()).imports.find(item => item.id === importId);
      if (!batch) throw new Error(`Import ${importId} was not found`);
      const saved = await repository.saveImport({ ...batch, validRecords: batch.validRecords || batch.records, status: "Normalized" });
      await audit(batch.profileId, "Normalized import", saved.id, `${saved.validRecords.toLocaleString()} records mapped to canonical model`);
      return saved;
    },
    listTransactions: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).transactions,
    listMappings: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).mappings,
    listRuns: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).runs,
    createRun: async input => {
      const snapshot = await repository.getSnapshot();
      const names = input.sourceIds.map(sourceId => snapshot.sources.find(source => source.id === sourceId)?.name).filter(Boolean).join(" ↔ ");
      const run = await repository.saveRun({ id: id("REC"), profileId: input.profileId, name: input.name, sources: names || "Configured sources", volume: "0", matched: "Processing", breaks: "—", value: "—", status: "Running", period: "Aug 24", ruleSet: input.ruleSet });
      await audit(input.profileId, "Created reconciliation", run.id, `${run.name} · ${run.ruleSet}`);
      return run;
    },
    rerun: async runId => {
      const run = (await repository.getSnapshot()).runs.find(item => item.id === runId);
      if (!run) throw new Error(`Run ${runId} was not found`);
      const saved = await repository.saveRun({ ...run, status: "Running" });
      await audit(run.profileId, "Re-ran reconciliation", saved.id, saved.name);
      return saved;
    },
    listRules: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).rules,
    createRule: async input => {
      const rule = await repository.saveRule({ ...input, id: id("R"), rate: "—" });
      await audit(input.profileId, "Created matching rule", rule.id, `${rule.name} · ${rule.matchType}`);
      return rule;
    },
    toggleRule: async ruleId => {
      const rule = (await repository.getSnapshot()).rules.find(item => item.id === ruleId);
      if (!rule) throw new Error(`Rule ${ruleId} was not found`);
      const saved = await repository.saveRule({ ...rule, active: !rule.active });
      await audit(rule.profileId, saved.active ? "Activated matching rule" : "Paused matching rule", saved.id, saved.name);
      return saved;
    },
    listExceptions: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).exceptions,
    assignException: async (exceptionId, owner) => {
      const current = await exception(exceptionId);
      const saved = await repository.saveException({ ...current, owner, status: "Investigating" });
      await audit(current.profileId, "Changed assignment", saved.id, `${current.owner} → ${owner}`);
      return saved;
    },
    addExceptionComment: async (exceptionId, body) => {
      const current = await exception(exceptionId);
      const comment = { id: id("COM"), author: "Nadia Khan", body, createdAt: now() };
      await repository.saveException({ ...current, comments: [...current.comments, comment] });
      await audit(current.profileId, "Added investigation note", current.id, body);
      return comment;
    },
    manuallyMatchException: async (exceptionId, input) => {
      const current = await exception(exceptionId);
      const saved = await repository.saveException({ ...current, status: "Resolved", resolutionReason: "Manual match", comments: [...current.comments, { id: id("COM"), author: "Nadia Khan", body: input.note, createdAt: now() }] });
      await audit(current.profileId, "Manually matched exception", saved.id, `Linked ${input.transactionIds.join(", ")}`);
      return saved;
    },
    resolveException: async (exceptionId, input) => {
      const current = await exception(exceptionId);
      const saved = await repository.saveException({ ...current, status: "Resolved", resolutionReason: input.reason, comments: input.note ? [...current.comments, { id: id("COM"), author: "Nadia Khan", body: input.note, createdAt: now() }] : current.comments });
      await audit(current.profileId, "Resolved exception", saved.id, input.reason);
      return saved;
    },
    listSettlements: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).settlements,
    listAuditEvents: async profileId => scopeSnapshot(await repository.getSnapshot(), profileId).auditEvents,
    exportControlReport: async (profileId, period) => {
      const fileName = `reconciliation-control-${profileId.toLowerCase()}-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
      await audit(profileId, "Exported control report", fileName, period);
      return { fileName };
    },
  };
}

export const reconciliationBackend = createReconciliationBackend(new MockReconciliationRepository());
