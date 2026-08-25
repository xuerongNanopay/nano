export type View =
  | "Portfolio"
  | "Profiles"
  | "Overview"
  | "Data sources"
  | "Imports"
  | "Normalization"
  | "Match runs"
  | "Exceptions"
  | "Matching rules"
  | "Settlements"
  | "Reports"
  | "Audit log";

export type NavigationItem = { label: View; icon: string };

export type BackOfficeModuleId = "reconciliation" | "dispute-resolution";

export type BackOfficeModule = {
  id: BackOfficeModuleId;
  name: string;
  description: string;
  icon: string;
  status: "Live" | "Planned";
};

export type ReconciliationProfile = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Draft" | "Paused";
  owner: string;
  currency: string;
  timezone: string;
  schedule: string;
  sourceIds: string[];
  lastRun: string;
  nextRun: string;
  matchRate: string;
  openExceptions: number;
  unresolvedValue: string;
};

export type ReconciliationRun = {
  id: string; profileId: string; name: string; sources: string; volume: string; matched: string;
  breaks: string; value: string; status: "Review" | "Complete" | "Running";
  period: string; ruleSet: string;
};

export type ExceptionComment = { id: string; author: string; body: string; createdAt: string };

export type ExceptionItem = {
  id: string; profileId: string; source: string; reference: string; type: string; reason: string;
  amount: string; sourceAmount: string; candidateAmount: string; age: string;
  owner: string; severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved"; priority: number;
  tags: string[]; comments: ExceptionComment[]; resolutionReason?: string;
};

export type MatchingRule = {
  id: string; profileId: string; name: string; scope: string; logic: string; priority: number;
  rate: string; active: boolean; matchType: "1:1" | "1:N" | "N:1";
};

export type DataSource = {
  id: string; name: string; type: string; transport: "Upload" | "SFTP" | "API" | "Database";
  records: string; sync: string; status: "Healthy" | "Delayed" | "Failed"; latency: string;
};

export type ImportBatch = {
  id: string; profileId: string; fileName: string; sourceId: string; sourceName: string; receivedAt: string;
  records: number; validRecords: number; duplicates: number;
  status: "Validating" | "Validated" | "Normalized" | "Failed";
  checksum: string; issues: string[];
};

export type CanonicalTransaction = {
  id: string; profileId: string; source: string; externalTransactionId: string; internalTransactionId?: string;
  amount: number; currency: string; fee: number; status: string; transactionTime: string;
  settlementTime: string; account: string; metadata: Record<string, string>;
};

export type SourceMapping = {
  profileId: string; sourceId: string; sourceName: string; coverage: number; lastUpdated: string;
  mappings: Array<{ sourceField: string; canonicalField: string; transform?: string }>;
};

export type SettlementPosition = {
  id: string; profileId: string; source: string; transactionValue: string; fees: string;
  expectedSettlement: string; bankDeposit: string; variance: string;
  status: "Balanced" | "Review" | "Pending";
};

export type AuditEvent = { id: string; profileId: string; time: string; actor: string; action: string; target: string; detail: string };

export type DashboardMetrics = {
  processed: string; matchRate: string; openExceptions: number; unresolvedValue: string;
  pipeline: { ingested: string; normalized: string; matched: string; exceptions: string };
};

export type WorkspaceSnapshot = {
  profiles: ReconciliationProfile[]; metrics: DashboardMetrics; sources: DataSource[]; imports: ImportBatch[];
  transactions: CanonicalTransaction[]; mappings: SourceMapping[]; runs: ReconciliationRun[];
  exceptions: ExceptionItem[]; rules: MatchingRule[]; settlements: SettlementPosition[];
  auditEvents: AuditEvent[];
};

export type CreateProfileInput = Omit<ReconciliationProfile, "id" | "lastRun" | "nextRun" | "matchRate" | "openExceptions" | "unresolvedValue">;
export type IngestFileInput = { profileId: string; fileName: string; sourceId: string; size: number };
export type CreateRunInput = { profileId: string; name: string; sourceIds: string[]; ruleSet: string };
export type CreateRuleInput = Omit<MatchingRule, "id" | "rate">;
export type ResolveExceptionInput = { reason: string; note?: string };
export type ManualMatchInput = { transactionIds: string[]; note: string };
