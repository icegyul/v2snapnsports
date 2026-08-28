export type ApiDecision =
  | "EXISTING_OPENAPI"
  | "EXISTING_LOGICAL_CONTRACT"
  | "OPENAPI_PROMOTION"
  | "PATH_RECONCILIATION"
  | "INTERNAL_USE_CASE_ONLY"
  | "ADMIN_PROJECTION_ONLY"
  | "REAL_API_EXTENSION"
  | "DEFERRED"
  | "REJECTED";

export interface ReconciledOperation {
  readonly id: string;
  readonly pack: "PACK 01" | "PACK 02" | "PACK 03" | "PACK 04";
  readonly domain: string;
  readonly method: string;
  readonly path: string;
  readonly operationId: string;
  readonly decision: string;
}

export const API_CANDIDATE_COUNT = 101 as const;
export const OPENAPI_PATCH_OPERATION_COUNT = 43 as const;
export const REAL_API_EXTENSION_COUNT = 5 as const;

export const REAL_API_EXTENSIONS = [
  {
    "id": "PAE-01",
    "pack": "PACK 02",
    "domain": "Portfolio",
    "method": "POST",
    "path": "/v2/athletes/{athlete_id}/portfolio/share-grants",
    "operationId": "createPortfolioShareGrant",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "PAE-02",
    "pack": "PACK 02",
    "domain": "Portfolio",
    "method": "POST",
    "path": "/v2/athletes/{athlete_id}/portfolio/share-grants/{grant_id}/revoke",
    "operationId": "revokePortfolioShareGrant",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "PAE-03",
    "pack": "PACK 02",
    "domain": "Communication",
    "method": "POST",
    "path": "/v2/communication/threads/{thread_id}/read",
    "operationId": "markCommunicationThreadRead",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "P4-API-09",
    "pack": "PACK 04",
    "domain": "Verification",
    "method": "POST",
    "path": "/v2/admin/role-verifications/{verification_id}/decision",
    "operationId": "adminDecideRoleVerification",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "P4-API-11",
    "pack": "PACK 04",
    "domain": "Verification",
    "method": "POST",
    "path": "/v2/admin/role-grants/{grant_id}/state-transitions",
    "operationId": "adminTransitionRoleGrantState",
    "decision": "REAL_API_EXTENSION"
  }
] as const satisfies readonly ReconciledOperation[];

export const RECONCILED_PATCH_OPERATIONS = [
  {
    "id": "OPG-001",
    "pack": "PACK 01",
    "domain": "Training",
    "method": "GET",
    "path": "/v2/training-sessions/{session_id}",
    "operationId": "getTrainingSession",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-002",
    "pack": "PACK 01",
    "domain": "Attendance",
    "method": "POST",
    "path": "/v2/training-sessions/{session_id}/attendance",
    "operationId": "updateTrainingAttendance",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-003",
    "pack": "PACK 01",
    "domain": "Plan",
    "method": "GET",
    "path": "/v2/training-plans/{plan_id}",
    "operationId": "getTrainingPlan",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-004",
    "pack": "PACK 01",
    "domain": "Plan",
    "method": "PUT",
    "path": "/v2/training-plans/{plan_id}",
    "operationId": "updateTrainingPlan",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-005",
    "pack": "PACK 01",
    "domain": "Tactics",
    "method": "POST",
    "path": "/v2/tactics",
    "operationId": "createTactic",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-006",
    "pack": "PACK 01",
    "domain": "Tactics",
    "method": "PUT",
    "path": "/v2/tactics/{tactic_id}",
    "operationId": "updateTactic",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-007",
    "pack": "PACK 01",
    "domain": "Tactics",
    "method": "GET",
    "path": "/v2/tactics/{tactic_id}/render",
    "operationId": "getTacticRender",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-008",
    "pack": "PACK 01",
    "domain": "Competition",
    "method": "GET",
    "path": "/v2/competitions",
    "operationId": "listCompetitions",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-009",
    "pack": "PACK 01",
    "domain": "Match",
    "method": "GET",
    "path": "/v2/matches/{match_id}",
    "operationId": "getMatch",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-010",
    "pack": "PACK 01",
    "domain": "Roster",
    "method": "PUT",
    "path": "/v2/matches/{match_id}/roster",
    "operationId": "updateMatchRoster",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-011",
    "pack": "PACK 01",
    "domain": "Lineup",
    "method": "PUT",
    "path": "/v2/matches/{match_id}/lineup",
    "operationId": "updateMatchLineup",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-012",
    "pack": "PACK 01",
    "domain": "Match",
    "method": "POST",
    "path": "/v2/matches/{match_id}/state-transitions",
    "operationId": "transitionMatchState",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-013",
    "pack": "PACK 01",
    "domain": "Match Report",
    "method": "POST",
    "path": "/v2/matches/{match_id}/reports",
    "operationId": "createMatchReport",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-014",
    "pack": "PACK 01",
    "domain": "Match Correction",
    "method": "POST",
    "path": "/v2/matches/{match_id}/corrections",
    "operationId": "createMatchCorrection",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-015",
    "pack": "PACK 01",
    "domain": "Notification",
    "method": "GET",
    "path": "/v2/notifications",
    "operationId": "listNotifications",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-016",
    "pack": "PACK 01",
    "domain": "Notification",
    "method": "POST",
    "path": "/v2/notifications/{notification_id}/read",
    "operationId": "markNotificationRead",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "OPG-017",
    "pack": "PACK 01",
    "domain": "Notification",
    "method": "POST",
    "path": "/v2/threads/{thread_id}/response",
    "operationId": "respondThread",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-001",
    "pack": "PACK 02",
    "domain": "Career",
    "method": "GET",
    "path": "/v2/athletes/{athlete_id}/career/events",
    "operationId": "getCareerEvents",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-002",
    "pack": "PACK 02",
    "domain": "Career",
    "method": "GET",
    "path": "/v2/athletes/{athlete_id}/career/highlights",
    "operationId": "getCareerHighlights",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-003",
    "pack": "PACK 02",
    "domain": "Career",
    "method": "POST",
    "path": "/v2/athletes/{athlete_id}/career/highlights",
    "operationId": "setCareerHighlights",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-004",
    "pack": "PACK 02",
    "domain": "Career",
    "method": "PATCH",
    "path": "/v2/athletes/{athlete_id}/career/visibility",
    "operationId": "updateCareerVisibility",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-005",
    "pack": "PACK 02",
    "domain": "Scouting",
    "method": "GET",
    "path": "/v2/scouting/preferences",
    "operationId": "getScoutingPreferences",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-006",
    "pack": "PACK 02",
    "domain": "Scouting",
    "method": "PATCH",
    "path": "/v2/scouting/preferences",
    "operationId": "updateScoutingPreferences",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-007",
    "pack": "PACK 02",
    "domain": "Opportunity",
    "method": "POST",
    "path": "/v2/opportunities/{opportunity_id}/actions",
    "operationId": "createOpportunityAction",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-008",
    "pack": "PACK 02",
    "domain": "Communication",
    "method": "GET",
    "path": "/v2/communication/threads",
    "operationId": "listCommunicationThreads",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-009",
    "pack": "PACK 02",
    "domain": "Communication",
    "method": "GET",
    "path": "/v2/communication/threads/{thread_id}/messages",
    "operationId": "listCommunicationMessages",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-010",
    "pack": "PACK 02",
    "domain": "Portfolio",
    "method": "GET",
    "path": "/v2/athletes/{athlete_id}/portfolio",
    "operationId": "getAthletePortfolio",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-011",
    "pack": "PACK 02",
    "domain": "Consent",
    "method": "GET",
    "path": "/v2/consents",
    "operationId": "listConsents",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-012",
    "pack": "PACK 02",
    "domain": "Consent",
    "method": "POST",
    "path": "/v2/consents",
    "operationId": "createConsent",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-013",
    "pack": "PACK 02",
    "domain": "Consent",
    "method": "POST",
    "path": "/v2/consents/{consent_id}/revoke",
    "operationId": "revokeConsent",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P2-OPG-014",
    "pack": "PACK 02",
    "domain": "Media",
    "method": "POST",
    "path": "/v2/videos/{video_id}/share",
    "operationId": "shareVideo",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "PAE-01",
    "pack": "PACK 02",
    "domain": "Portfolio",
    "method": "POST",
    "path": "/v2/athletes/{athlete_id}/portfolio/share-grants",
    "operationId": "createPortfolioShareGrant",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "PAE-02",
    "pack": "PACK 02",
    "domain": "Portfolio",
    "method": "POST",
    "path": "/v2/athletes/{athlete_id}/portfolio/share-grants/{grant_id}/revoke",
    "operationId": "revokePortfolioShareGrant",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "PAE-03",
    "pack": "PACK 02",
    "domain": "Communication",
    "method": "POST",
    "path": "/v2/communication/threads/{thread_id}/read",
    "operationId": "markCommunicationThreadRead",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "P4-API-07",
    "pack": "PACK 04",
    "domain": "Verification",
    "method": "GET",
    "path": "/v2/role-verifications/{verification_id}",
    "operationId": "getRoleVerification",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-09",
    "pack": "PACK 04",
    "domain": "Verification",
    "method": "POST",
    "path": "/v2/admin/role-verifications/{verification_id}/decision",
    "operationId": "adminDecideRoleVerification",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "P4-API-11",
    "pack": "PACK 04",
    "domain": "Verification",
    "method": "POST",
    "path": "/v2/admin/role-grants/{grant_id}/state-transitions",
    "operationId": "adminTransitionRoleGrantState",
    "decision": "REAL_API_EXTENSION"
  },
  {
    "id": "P4-API-21",
    "pack": "PACK 04",
    "domain": "Safeguarding",
    "method": "POST",
    "path": "/v2/safety/reports",
    "operationId": "createSafetyReport",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-22",
    "pack": "PACK 04",
    "domain": "Safeguarding",
    "method": "GET",
    "path": "/v2/safety/incidents/{incident_id}",
    "operationId": "getSafetyIncident",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-24",
    "pack": "PACK 04",
    "domain": "Safeguarding",
    "method": "POST",
    "path": "/v2/safety/incidents/{incident_id}/actions",
    "operationId": "createSafetyIncidentAction",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-27",
    "pack": "PACK 04",
    "domain": "Privacy",
    "method": "GET",
    "path": "/v2/privacy/requests/{request_id}",
    "operationId": "getPrivacyRequest",
    "decision": "OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-26",
    "pack": "PACK 04",
    "domain": "Privacy",
    "method": "POST",
    "path": "/v2/privacy/exports",
    "operationId": "createPrivacyExportRequest",
    "decision": "PATH_RECONCILIATION+OPENAPI_PROMOTION"
  },
  {
    "id": "P4-API-26",
    "pack": "PACK 04",
    "domain": "Privacy",
    "method": "POST",
    "path": "/v2/privacy/deletions",
    "operationId": "createPrivacyDeletionRequest",
    "decision": "PATH_RECONCILIATION+OPENAPI_PROMOTION"
  }
] as const satisfies readonly ReconciledOperation[];
