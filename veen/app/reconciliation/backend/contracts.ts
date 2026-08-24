import type { AuditEvent, CanonicalTransaction, CreateProfileInput, CreateRuleInput, CreateRunInput, DataSource, ExceptionComment, ExceptionItem, ImportBatch, IngestFileInput, ManualMatchInput, MatchingRule, ReconciliationProfile, ReconciliationRun, ResolveExceptionInput, SettlementPosition, SourceMapping, WorkspaceSnapshot } from "../types";

/** Persistence boundary. Replace this with a database-backed repository later. */
export interface ReconciliationRepository {
  getSnapshot(): Promise<WorkspaceSnapshot>;
  saveProfile(profile: ReconciliationProfile): Promise<ReconciliationProfile>;
  saveImport(batch: ImportBatch): Promise<ImportBatch>;
  saveRun(run: ReconciliationRun): Promise<ReconciliationRun>;
  saveRule(rule: MatchingRule): Promise<MatchingRule>;
  saveException(item: ExceptionItem): Promise<ExceptionItem>;
  saveSource(source: DataSource): Promise<DataSource>;
  appendAudit(event: AuditEvent): Promise<AuditEvent>;
}

/** Application boundary consumed by React. A REST or GraphQL client can implement this unchanged. */
export interface ReconciliationBackend {
  getWorkspaceSnapshot(profileId?: string): Promise<WorkspaceSnapshot>;
  listProfiles(): Promise<ReconciliationProfile[]>;
  getProfile(profileId: string): Promise<ReconciliationProfile>;
  createProfile(input: CreateProfileInput): Promise<ReconciliationProfile>;
  listDataSources(): Promise<DataSource[]>;
  testDataSource(sourceId: string, profileId: string): Promise<DataSource>;
  listImports(profileId: string): Promise<ImportBatch[]>;
  ingestFile(input: IngestFileInput): Promise<ImportBatch>;
  validateImport(importId: string): Promise<ImportBatch>;
  normalizeImport(importId: string): Promise<ImportBatch>;
  listTransactions(profileId: string): Promise<CanonicalTransaction[]>;
  listMappings(profileId: string): Promise<SourceMapping[]>;
  listRuns(profileId: string): Promise<ReconciliationRun[]>;
  createRun(input: CreateRunInput): Promise<ReconciliationRun>;
  rerun(runId: string): Promise<ReconciliationRun>;
  listRules(profileId: string): Promise<MatchingRule[]>;
  createRule(input: CreateRuleInput): Promise<MatchingRule>;
  toggleRule(ruleId: string): Promise<MatchingRule>;
  listExceptions(profileId: string): Promise<ExceptionItem[]>;
  assignException(exceptionId: string, owner: string): Promise<ExceptionItem>;
  addExceptionComment(exceptionId: string, body: string): Promise<ExceptionComment>;
  manuallyMatchException(exceptionId: string, input: ManualMatchInput): Promise<ExceptionItem>;
  resolveException(exceptionId: string, input: ResolveExceptionInput): Promise<ExceptionItem>;
  listSettlements(profileId: string): Promise<SettlementPosition[]>;
  listAuditEvents(profileId: string): Promise<AuditEvent[]>;
  exportControlReport(profileId: string, period: string): Promise<{ fileName: string }>;
}
