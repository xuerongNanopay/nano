import type { AuditEvent, CanonicalTransaction, ExceptionItem, ImportBatch, MatchingRule, ReconciliationProfile, ReconciliationRun, SettlementPosition, SourceMapping, WorkspaceSnapshot } from "../types";

type Unscoped<T extends { profileId: string }> = Omit<T, "profileId">;
type MockBase = Omit<WorkspaceSnapshot, "profiles" | "imports" | "transactions" | "mappings" | "runs" | "exceptions" | "rules" | "settlements" | "auditEvents"> & {
  imports: Array<Unscoped<ImportBatch>>;
  transactions: Array<Unscoped<CanonicalTransaction>>;
  mappings: Array<Unscoped<SourceMapping>>;
  runs: Array<Unscoped<ReconciliationRun>>;
  exceptions: Array<Unscoped<ExceptionItem>>;
  rules: Array<Unscoped<MatchingRule>>;
  settlements: Array<Unscoped<SettlementPosition>>;
  auditEvents: Array<Unscoped<AuditEvent>>;
};

const baseWorkspace: MockBase = {
  metrics: { processed: "2,452,309", matchRate: "98.72%", openExceptions: 31462, unresolvedValue: "$7.01M", pipeline: { ingested: "2.48M", normalized: "2.45M", matched: "2.42M", exceptions: "31,462" } },
  sources: [
    { id: "SRC-VISA", name: "Visa VSS", type: "Scheme file", transport: "SFTP", records: "824,610", sync: "2 min ago", status: "Healthy", latency: "4m 12s" },
    { id: "SRC-MC", name: "Mastercard IPM", type: "Scheme file", transport: "SFTP", records: "612,904", sync: "7 min ago", status: "Delayed", latency: "12m 48s" },
    { id: "SRC-GL", name: "Core ledger", type: "Internal ledger", transport: "Database", records: "1,402,822", sync: "1 min ago", status: "Healthy", latency: "1m 06s" },
    { id: "SRC-BANK", name: "Settlement bank", type: "MT940 statement", transport: "SFTP", records: "18,422", sync: "23 min ago", status: "Delayed", latency: "26m 15s" },
    { id: "SRC-INT", name: "Interac switch", type: "Processor feed", transport: "API", records: "506,284", sync: "3 min ago", status: "Healthy", latency: "3m 44s" },
    { id: "SRC-WALLET", name: "Wallet ledger", type: "Internal ledger", transport: "Database", records: "248,511", sync: "Failed 8:42 AM", status: "Failed", latency: "—" },
  ],
  imports: [
    { id: "IMP-240823-081", fileName: "visa_vss_20260823.csv", sourceId: "SRC-VISA", sourceName: "Visa VSS", receivedAt: "Today · 08:06", records: 824610, validRecords: 824604, duplicates: 6, status: "Normalized", checksum: "f82a…19c4", issues: ["6 duplicate records quarantined"] },
    { id: "IMP-240823-080", fileName: "mastercard_ipm_20260823.xlsx", sourceId: "SRC-MC", sourceName: "Mastercard IPM", receivedAt: "Today · 07:58", records: 612904, validRecords: 612881, duplicates: 12, status: "Validated", checksum: "b10e…8af2", issues: ["11 records missing settlement date", "12 duplicates quarantined"] },
    { id: "IMP-240823-079", fileName: "bank_mt940_20260823.txt", sourceId: "SRC-BANK", sourceName: "Settlement bank", receivedAt: "Today · 07:42", records: 18422, validRecords: 18422, duplicates: 0, status: "Normalized", checksum: "1d7c…e422", issues: [] },
    { id: "IMP-240823-078", fileName: "wallet_movements_20260823.csv", sourceId: "SRC-WALLET", sourceName: "Wallet ledger", receivedAt: "Today · 07:31", records: 248511, validRecords: 0, duplicates: 0, status: "Failed", checksum: "9a2d…0b88", issues: ["Schema version is not supported"] },
  ],
  transactions: [
    { id: "TXN-902211", source: "Visa VSS", externalTransactionId: "ARN742139840221", internalTransactionId: "GL-22014-18402", amount: 184220.14, currency: "CAD", fee: 312.24, status: "Settled", transactionTime: "2026-08-22 14:31", settlementTime: "2026-08-23 08:00", account: "Visa clearing CAD", metadata: { merchant: "M-10482", cycle: "C04" } },
    { id: "TXN-902210", source: "Mastercard IPM", externalTransactionId: "MC983441", amount: 92418, currency: "USD", fee: 160.04, status: "Cleared", transactionTime: "2026-08-22 13:44", settlementTime: "2026-08-23 09:00", account: "Mastercard clearing USD", metadata: { mti: "1240", cycle: "C03" } },
    { id: "TXN-902209", source: "Interac switch", externalTransactionId: "TRX928410553", internalTransactionId: "GL-22018-18812", amount: 8244.92, currency: "CAD", fee: 21.62, status: "Settled", transactionTime: "2026-08-22 12:07", settlementTime: "2026-08-22 23:59", account: "Interac settlement", metadata: { terminal: "T-8821", cycle: "C02" } },
    { id: "TXN-902208", source: "Wallet ledger", externalTransactionId: "WLT00218393", amount: 1840, currency: "CAD", fee: 0, status: "Pending", transactionTime: "2026-08-23 03:12", settlementTime: "2026-08-24 00:00", account: "Wallet funding", metadata: { wallet: "W-22014", rail: "EFT" } },
  ],
  mappings: [
    { sourceId: "SRC-VISA", sourceName: "Visa VSS", coverage: 100, lastUpdated: "Aug 18 · Nadia Khan", mappings: [{ sourceField: "arn", canonicalField: "externalTransactionId" }, { sourceField: "txn_amt", canonicalField: "amount", transform: "minor units ÷ 100" }, { sourceField: "settlement_ccy", canonicalField: "currency", transform: "ISO 4217" }] },
    { sourceId: "SRC-MC", sourceName: "Mastercard IPM", coverage: 96, lastUpdated: "Aug 21 · Marcus Reed", mappings: [{ sourceField: "DE37", canonicalField: "externalTransactionId" }, { sourceField: "DE5", canonicalField: "amount", transform: "minor units ÷ 100" }, { sourceField: "DE50", canonicalField: "currency", transform: "ISO numeric → alpha" }] },
    { sourceId: "SRC-BANK", sourceName: "Settlement bank", coverage: 100, lastUpdated: "Aug 12 · System", mappings: [{ sourceField: ":61:reference", canonicalField: "externalTransactionId" }, { sourceField: ":61:amount", canonicalField: "amount" }, { sourceField: ":25:account", canonicalField: "account" }] },
  ],
  runs: [
    { id: "REC-10482", name: "Visa settlement — Canada", sources: "Visa VSS ↔ Core ledger ↔ Settlement", volume: "824,610", matched: "99.42%", breaks: "4,783", value: "$1.82M", status: "Review", period: "Aug 23", ruleSet: "Card settlement — Standard" },
    { id: "REC-10481", name: "Interac daily settlement", sources: "Interac ↔ Switch ↔ GL", volume: "506,284", matched: "99.87%", breaks: "659", value: "$284K", status: "Complete", period: "Aug 23", ruleSet: "Exact reference & amount" },
    { id: "REC-10480", name: "Mastercard clearing — USD", sources: "IPM ↔ Processor ↔ Treasury", volume: "612,904", matched: "97.66%", breaks: "14,342", value: "$4.16M", status: "Review", period: "Aug 23", ruleSet: "Card settlement — Standard" },
    { id: "REC-10479", name: "Wallet funding movements", sources: "Wallet ↔ Bank ↔ Internal ledger", volume: "248,511", matched: "98.24%", breaks: "4,374", value: "$732K", status: "Running", period: "Aug 23", ruleSet: "Wallet funding fallback" },
    { id: "REC-10478", name: "Amex merchant settlement", sources: "Amex ↔ Acquirer ledger", volume: "117,438", matched: "99.71%", breaks: "340", value: "$48K", status: "Complete", period: "Aug 22", ruleSet: "Exact reference & amount" },
  ],
  exceptions: [
    { id: "EXC-88231", source: "Visa VSS", reference: "ARN 742139840221", type: "Amount mismatch", reason: "Settlement amount differs from ledger candidate by $20.00", amount: "$184,220.14", sourceAmount: "$184,220.14", candidateAmount: "$184,200.14", age: "5d 4h", owner: "Nadia Khan", severity: "Critical", status: "Investigating", priority: 1, tags: ["scheme", "month-end"], comments: [{ id: "COM-1", author: "Nadia Khan", body: "Validated source file completeness; reviewing the ledger posting.", createdAt: "Today · 09:18" }] },
    { id: "EXC-88230", source: "Mastercard IPM", reference: "MTI 1240 · 983441", type: "Missing ledger entry", reason: "No internal record found inside the two-day match window", amount: "$92,418.00", sourceAmount: "$92,418.00", candidateAmount: "—", age: "3d 7h", owner: "Unassigned", severity: "High", status: "Open", priority: 2, tags: ["missing"], comments: [] },
    { id: "EXC-88229", source: "Core ledger", reference: "GL 22014 · B-1882", type: "Currency mismatch", reason: "Source currency CAD conflicts with USD ledger posting", amount: "$47,912.66", sourceAmount: "CAD 47,912.66", candidateAmount: "USD 47,912.66", age: "2d 11h", owner: "Marcus Reed", severity: "High", status: "Investigating", priority: 2, tags: ["currency"], comments: [] },
    { id: "EXC-88228", source: "Interac", reference: "TRX 928410553", type: "Duplicate record", reason: "Same source reference and amount received twice", amount: "$8,244.92", sourceAmount: "$8,244.92", candidateAmount: "$8,244.92", age: "18h", owner: "Priya Shah", severity: "Medium", status: "Open", priority: 3, tags: ["duplicate"], comments: [] },
    { id: "EXC-88227", source: "Wallet ledger", reference: "WLT 00218393", type: "Timing difference", reason: "Bank posting is outside the current one-day window", amount: "$1,840.00", sourceAmount: "$1,840.00", candidateAmount: "$1,840.00", age: "7h", owner: "Unassigned", severity: "Low", status: "Open", priority: 4, tags: ["timing"], comments: [] },
    { id: "EXC-88226", source: "Settlement bank", reference: "STM 2308-9402", type: "Fee variance", reason: "Acquirer fee is 0.08% above configured tolerance", amount: "$620.18", sourceAmount: "$620.18", candidateAmount: "$604.68", age: "4h", owner: "Elena Park", severity: "Low", status: "Investigating", priority: 4, tags: ["fee"], comments: [] },
  ],
  rules: [
    { id: "R-104", name: "Visa ARN + amount + currency", scope: "Visa VSS ↔ Core ledger", logic: "Exact ARN · Amount ± $0.05 · Same currency", priority: 1, rate: "94.8%", active: true, matchType: "1:1" },
    { id: "R-117", name: "Settlement date tolerance", scope: "All card schemes ↔ Settlement", logic: "Reference exact · Date ± 2 days · Amount exact", priority: 2, rate: "3.7%", active: true, matchType: "1:1" },
    { id: "R-122", name: "Aggregate fee matching", scope: "Processor fees ↔ General ledger", logic: "Merchant + cycle · Aggregate amount ± 0.25%", priority: 3, rate: "1.1%", active: true, matchType: "N:1" },
    { id: "R-131", name: "Wallet fallback reference", scope: "Wallet ↔ Bank statement", logic: "Amount exact · Date ± 1 day · Fuzzy reference", priority: 4, rate: "0.2%", active: false, matchType: "1:1" },
  ],
  settlements: [
    { id: "SET-0823-VISA", source: "Visa Canada", transactionValue: "$184.22M", fees: "$312.4K", expectedSettlement: "$183.91M", bankDeposit: "$183.91M", variance: "$0.00", status: "Balanced" },
    { id: "SET-0823-MC", source: "Mastercard USD", transactionValue: "$92.42M", fees: "$160.0K", expectedSettlement: "$92.26M", bankDeposit: "$92.18M", variance: "$80.2K", status: "Review" },
    { id: "SET-0823-INT", source: "Interac Canada", transactionValue: "$71.88M", fees: "$88.1K", expectedSettlement: "$71.79M", bankDeposit: "$71.79M", variance: "$0.00", status: "Balanced" },
    { id: "SET-0823-WAL", source: "Wallet funding", transactionValue: "$24.11M", fees: "$12.4K", expectedSettlement: "$24.10M", bankDeposit: "Pending", variance: "—", status: "Pending" },
  ],
  auditEvents: [
    { id: "AUD-1", time: "10:42:18", actor: "Nadia Khan", action: "Resolved exception", target: "EXC-88214", detail: "Approved adjustment · Amount mismatch" },
    { id: "AUD-2", time: "10:38:04", actor: "System", action: "Completed reconciliation", target: "REC-10481", detail: "Interac daily settlement · 99.87% match" },
    { id: "AUD-3", time: "10:31:52", actor: "Marcus Reed", action: "Changed assignment", target: "EXC-88229", detail: "Unassigned → Marcus Reed" },
    { id: "AUD-4", time: "10:22:11", actor: "Priya Shah", action: "Updated matching rule", target: "R-117", detail: "Date tolerance changed from ±1 to ±2 days" },
    { id: "AUD-5", time: "09:58:40", actor: "System", action: "Source control failed", target: "Wallet ledger", detail: "Record count below expected threshold" },
    { id: "AUD-6", time: "09:42:26", actor: "Elena Park", action: "Exported report", target: "REP-2026-0823", detail: "Daily reconciliation position · CSV" },
  ],
};

const profiles: ReconciliationProfile[] = [
  { id: "PROF-VISA-CA", name: "Visa Canada settlement", description: "Daily three-way reconciliation across Visa VSS, the core ledger, and bank settlement.", status: "Active", owner: "Nadia Khan", currency: "CAD", timezone: "America/Toronto", schedule: "Daily · 08:15", sourceIds: ["SRC-VISA", "SRC-GL", "SRC-BANK"], lastRun: "Today · 10:38", nextRun: "Tomorrow · 08:15", matchRate: "99.42%", openExceptions: 4783, unresolvedValue: "$1.82M" },
  { id: "PROF-MC-US", name: "Mastercard USD clearing", description: "Clearing and treasury control for Mastercard processor activity in USD.", status: "Active", owner: "Marcus Reed", currency: "USD", timezone: "America/New_York", schedule: "Daily · 09:00", sourceIds: ["SRC-MC", "SRC-GL", "SRC-BANK"], lastRun: "Today · 09:12", nextRun: "Tomorrow · 09:00", matchRate: "97.66%", openExceptions: 14342, unresolvedValue: "$4.16M" },
  { id: "PROF-INT-CA", name: "Interac daily settlement", description: "Processor-to-ledger reconciliation for Canadian Interac settlement cycles.", status: "Active", owner: "Priya Shah", currency: "CAD", timezone: "America/Toronto", schedule: "Daily · 07:45", sourceIds: ["SRC-INT", "SRC-GL", "SRC-BANK"], lastRun: "Today · 08:02", nextRun: "Tomorrow · 07:45", matchRate: "99.87%", openExceptions: 659, unresolvedValue: "$284K" },
  { id: "PROF-WALLET", name: "Wallet funding movements", description: "Funding and withdrawal movements between wallets, bank accounts, and the internal ledger.", status: "Paused", owner: "Elena Park", currency: "CAD", timezone: "America/Toronto", schedule: "Every 2 hours", sourceIds: ["SRC-WALLET", "SRC-GL", "SRC-BANK"], lastRun: "Today · 08:42", nextRun: "Paused", matchRate: "98.24%", openExceptions: 4374, unresolvedValue: "$732K" },
  { id: "PROF-AMEX", name: "Amex merchant settlement", description: "Merchant settlement control between Amex clearing and the acquiring ledger.", status: "Draft", owner: "Nadia Khan", currency: "CAD", timezone: "America/Toronto", schedule: "Not scheduled", sourceIds: ["SRC-GL", "SRC-BANK"], lastRun: "Aug 22 · 18:04", nextRun: "Not scheduled", matchRate: "99.71%", openExceptions: 340, unresolvedValue: "$48K" },
];

const scope = <T extends object>(records: T[], profileIds: string[]) => records.map((record, index) => ({ ...record, profileId: profileIds[index] ?? "PROF-VISA-CA" }));

export const mockWorkspace: WorkspaceSnapshot = {
  ...baseWorkspace,
  profiles,
  imports: [...scope(baseWorkspace.imports, ["PROF-VISA-CA", "PROF-MC-US", "PROF-VISA-CA", "PROF-WALLET"]), { ...baseWorkspace.imports[0], id: "IMP-240823-INT", profileId: "PROF-INT-CA", fileName: "interac_settlement_20260823.csv", sourceId: "SRC-INT", sourceName: "Interac switch", records: 506284, validRecords: 506284, duplicates: 0 }],
  transactions: scope(baseWorkspace.transactions, ["PROF-VISA-CA", "PROF-MC-US", "PROF-INT-CA", "PROF-WALLET"]),
  mappings: [...scope(baseWorkspace.mappings, ["PROF-VISA-CA", "PROF-MC-US", "PROF-VISA-CA"]), { ...baseWorkspace.mappings[0], profileId: "PROF-INT-CA", sourceId: "SRC-INT", sourceName: "Interac switch", coverage: 100 }, { ...baseWorkspace.mappings[2], profileId: "PROF-WALLET", sourceId: "SRC-WALLET", sourceName: "Wallet ledger", coverage: 98 }],
  runs: scope(baseWorkspace.runs, ["PROF-VISA-CA", "PROF-INT-CA", "PROF-MC-US", "PROF-WALLET", "PROF-AMEX"]),
  exceptions: scope(baseWorkspace.exceptions, ["PROF-VISA-CA", "PROF-MC-US", "PROF-MC-US", "PROF-INT-CA", "PROF-WALLET", "PROF-VISA-CA"]),
  rules: [...scope(baseWorkspace.rules, ["PROF-VISA-CA", "PROF-VISA-CA", "PROF-VISA-CA", "PROF-WALLET"]), { ...baseWorkspace.rules[0], id: "R-MC-201", profileId: "PROF-MC-US", name: "Mastercard reference + amount", scope: "Mastercard IPM ↔ Core ledger", rate: "93.6%" }, { ...baseWorkspace.rules[1], id: "R-INT-301", profileId: "PROF-INT-CA", name: "Interac transaction reference", scope: "Interac switch ↔ Core ledger", rate: "99.1%" }, { ...baseWorkspace.rules[0], id: "R-AMEX-401", profileId: "PROF-AMEX", name: "Amex settlement reference", scope: "Amex ↔ Acquirer ledger", active: false, rate: "—" }],
  settlements: [...scope(baseWorkspace.settlements, ["PROF-VISA-CA", "PROF-MC-US", "PROF-INT-CA", "PROF-WALLET"]), { ...baseWorkspace.settlements[0], id: "SET-0823-AMEX", profileId: "PROF-AMEX", source: "Amex merchants", transactionValue: "$12.84M", fees: "$42.8K", expectedSettlement: "$12.80M", bankDeposit: "$12.80M" }],
  auditEvents: [...scope(baseWorkspace.auditEvents, ["PROF-VISA-CA", "PROF-INT-CA", "PROF-MC-US", "PROF-VISA-CA", "PROF-WALLET", "PROF-VISA-CA"]), { ...baseWorkspace.auditEvents[3], id: "AUD-AMEX", profileId: "PROF-AMEX", action: "Created draft rule", target: "R-AMEX-401", detail: "Initial profile configuration" }],
};
