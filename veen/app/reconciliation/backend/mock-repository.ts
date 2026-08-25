import type { AuditEvent, DataSource, ExceptionItem, ImportBatch, MatchingRule, ReconciliationProfile, ReconciliationRun, WorkspaceSnapshot } from "../types";
import type { ReconciliationRepository } from "./contracts";
import { mockWorkspace } from "./mock-data";

const clone = <T,>(value: T): T => structuredClone(value);

export class MockReconciliationRepository implements ReconciliationRepository {
  private state: WorkspaceSnapshot = clone(mockWorkspace);

  async getSnapshot() { return clone(this.state); }

  async saveProfile(profile: ReconciliationProfile) {
    this.state.profiles = [profile, ...this.state.profiles.filter(item => item.id !== profile.id)];
    return clone(profile);
  }

  async saveImport(batch: ImportBatch) {
    this.state.imports = [batch, ...this.state.imports.filter(item => item.id !== batch.id)];
    return clone(batch);
  }

  async saveRun(run: ReconciliationRun) {
    this.state.runs = [run, ...this.state.runs.filter(item => item.id !== run.id)];
    return clone(run);
  }

  async saveRule(rule: MatchingRule) {
    this.state.rules = [...this.state.rules.filter(item => item.id !== rule.id), rule].sort((a, b) => a.priority - b.priority);
    return clone(rule);
  }

  async saveException(item: ExceptionItem) {
    const previous = this.state.exceptions.find(current => current.id === item.id);
    this.state.exceptions = this.state.exceptions.map(current => current.id === item.id ? item : current);
    const profile = this.state.profiles.find(current => current.id === item.profileId);
    if (profile && previous?.status !== item.status) {
      if (item.status === "Resolved") profile.openExceptions = Math.max(0, profile.openExceptions - 1);
      if (previous?.status === "Resolved") profile.openExceptions += 1;
    }
    return clone(item);
  }

  async saveSource(source: DataSource) {
    this.state.sources = this.state.sources.map(current => current.id === source.id ? source : current);
    return clone(source);
  }

  async appendAudit(event: AuditEvent) {
    this.state.auditEvents = [event, ...this.state.auditEvents];
    return clone(event);
  }
}
