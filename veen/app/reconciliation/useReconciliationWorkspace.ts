"use client";

import { useCallback, useEffect, useState } from "react";
import { reconciliationBackend } from "./backend/service";
import type { CreateProfileInput, CreateRuleInput, CreateRunInput, IngestFileInput, ResolveExceptionInput, WorkspaceSnapshot } from "./types";

const defaultProfileId = "PROF-VISA-CA";

export function useReconciliationWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState(defaultProfileId);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async (profileId = selectedProfileId) => {
    try { setWorkspace(await reconciliationBackend.getWorkspaceSnapshot(profileId)); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load reconciliation data"); }
  }, [selectedProfileId]);

  useEffect(() => {
    let active = true;
    void reconciliationBackend.getWorkspaceSnapshot(defaultProfileId).then(snapshot => {
      if (active) setWorkspace(snapshot);
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load reconciliation data");
    });
    return () => { active = false; };
  }, []);

  const perform = async <T,>(label: string, operation: () => Promise<T>, profileId = selectedProfileId) => {
    setBusy(label);
    try { const result = await operation(); await refresh(profileId); return result; }
    finally { setBusy(""); }
  };

  const selectProfile = async (profileId: string) => {
    setBusy("Opening profile");
    setSelectedProfileId(profileId);
    try { setWorkspace(await reconciliationBackend.getWorkspaceSnapshot(profileId)); }
    finally { setBusy(""); }
  };

  return {
    workspace, selectedProfileId, error, busy, selectProfile,
    createProfile: (input: CreateProfileInput) => perform("Creating profile", () => reconciliationBackend.createProfile(input)),
    ingestFile: (input: IngestFileInput) => perform("Uploading file", () => reconciliationBackend.ingestFile(input)),
    validateImport: (importId: string) => perform("Validating import", () => reconciliationBackend.validateImport(importId)),
    normalizeImport: (importId: string) => perform("Normalizing records", () => reconciliationBackend.normalizeImport(importId)),
    testSource: (sourceId: string) => perform("Testing source", () => reconciliationBackend.testDataSource(sourceId, selectedProfileId)),
    createRun: (input: CreateRunInput) => perform("Starting run", () => reconciliationBackend.createRun(input)),
    toggleRule: (ruleId: string) => perform("Updating rule", () => reconciliationBackend.toggleRule(ruleId)),
    createRule: (input: CreateRuleInput) => perform("Creating rule", () => reconciliationBackend.createRule(input)),
    assignException: (exceptionId: string, owner: string) => perform("Saving assignment", () => reconciliationBackend.assignException(exceptionId, owner)),
    addComment: (exceptionId: string, body: string) => perform("Saving note", () => reconciliationBackend.addExceptionComment(exceptionId, body)),
    manualMatch: (exceptionId: string) => perform("Linking records", () => reconciliationBackend.manuallyMatchException(exceptionId, { transactionIds: ["GL-22014-18402"], note: "Analyst-approved candidate after source evidence review." })),
    resolveException: (exceptionId: string, input: ResolveExceptionInput) => perform("Resolving exception", () => reconciliationBackend.resolveException(exceptionId, input)),
    exportReport: (period: string) => perform("Preparing export", () => reconciliationBackend.exportControlReport(selectedProfileId, period)),
  };
}
