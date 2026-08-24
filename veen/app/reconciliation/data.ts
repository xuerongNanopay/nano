import type { BackOfficeModule, NavigationItem, View } from "./types";

export const backOfficeModules: BackOfficeModule[] = [
  { id: "reconciliation", name: "Reconciliation", description: "Payments matching and control", icon: "⇄", status: "Live" },
  { id: "dispute-resolution", name: "Dispute resolution", description: "Case and chargeback operations", icon: "◈", status: "Planned" },
];

export const portfolioNavigation: NavigationItem[] = [
  { label: "Portfolio", icon: "⌂" },
  { label: "Profiles", icon: "▦" },
];

export const primaryProfileNavigation: NavigationItem[] = [
  { label: "Overview", icon: "◉" }, { label: "Match runs", icon: "↻" },
  { label: "Exceptions", icon: "!" },
];

export const dataNavigation: NavigationItem[] = [
  { label: "Data sources", icon: "◫" }, { label: "Imports", icon: "↓" },
  { label: "Normalization", icon: "≡" },
];

export const controlNavigation: NavigationItem[] = [
  { label: "Matching rules", icon: "⌘" }, { label: "Settlements", icon: "$" },
  { label: "Reports", icon: "▥" }, { label: "Audit log", icon: "☷" },
];

export const pageTitles: Record<View, [string, string]> = {
  Portfolio: ["All profiles", "Reconciliation portfolio"],
  Profiles: ["Configuration", "Reconciliation profiles"],
  Overview: ["Live operations", "Profile overview"],
  "Data sources": ["Ingestion & connectivity", "Data sources"],
  Imports: ["Ingest", "File imports & controls"],
  Normalization: ["Normalize", "Canonical transaction model"],
  "Match runs": ["Match & detect breaks", "Reconciliation runs"],
  Exceptions: ["Investigate & resolve", "Exception management"],
  "Matching rules": ["Matching configuration", "Rules & tolerances"],
  Settlements: ["Settlement & fees", "Settlement positions"],
  Reports: ["Report & close", "Reconciliation reports"],
  "Audit log": ["Governance & control", "Audit log"],
};
