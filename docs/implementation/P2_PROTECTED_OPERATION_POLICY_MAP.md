# P2 protected operation policy map

Generated from the P1 reconciled physical OpenAPI successor. Interface-only bindings do not activate handlers.

| operationId | method/path | domain | access | gates | backend | audit | policy seam |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `acceptGuardianInvite` | `POST /v2/guardian-invites/{token}/accept` | guardian-invites | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `addCommunityComment` | `POST /v2/community/posts/{post_id}/comments` | community | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | CommunityPolicy |
| `adminDecideRoleVerification` | `POST /v2/admin/role-verifications/{verification_id}/decision` | admin | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `adminListRoleVerifications` | `GET /v2/admin/role-verifications` | admin | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `adminTransitionRoleGrantState` | `POST /v2/admin/role-grants/{grant_id}/state-transitions` | admin | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `adminUpdateFeatureFlag` | `PATCH /v2/admin/feature-flags/{flag_key}` | admin | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE, FEATURE_GATE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `appendMatchEvent` | `POST /v2/matches/{match_id}/events` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `appendTrainingEvent` | `POST /v2/training-sessions/{session_id}/events` | training-sessions | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | TrainingPolicy |
| `createCommunicationThread` | `POST /v2/communication/threads` | communication | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CommunicationPolicy |
| `createCommunityPost` | `POST /v2/community/posts` | community | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | CommunityPolicy |
| `createConsent` | `POST /v2/consents` | consents | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `createGuardianInvite` | `POST /v2/guardian-invites` | guardian-invites | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `createMatchCorrection` | `POST /v2/matches/{match_id}/corrections` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `createMatchReport` | `POST /v2/matches/{match_id}/reports` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `createMediaUpload` | `POST /v2/media/uploads` | media | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | MediaPolicy |
| `createOpportunity` | `POST /v2/opportunities` | opportunities | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | ScoutingPolicy |
| `createOpportunityAction` | `POST /v2/opportunities/{opportunity_id}/actions` | opportunities | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | ScoutingPolicy |
| `createPortfolioShareGrant` | `POST /v2/athletes/{athlete_id}/portfolio/share-grants` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CareerPolicy |
| `createPrivacyDeletionRequest` | `POST /v2/privacy/deletions` | privacy | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `createPrivacyExportRequest` | `POST /v2/privacy/exports` | privacy | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `createRoleVerification` | `POST /v2/role-verifications` | role-verifications | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `createSafetyIncidentAction` | `POST /v2/safety/incidents/{incident_id}/actions` | safety | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `createSafetyReport` | `POST /v2/safety/reports` | safety | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `createTactic` | `POST /v2/tactics` | tactics | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `createTrainingSession` | `POST /v2/training-sessions` | training-sessions | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | TrainingPolicy |
| `getAthletePortfolio` | `GET /v2/athletes/{athlete_id}/portfolio` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CareerPolicy |
| `getCareerEvents` | `GET /v2/athletes/{athlete_id}/career/events` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CareerPolicy |
| `getCareerHighlights` | `GET /v2/athletes/{athlete_id}/career/highlights` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CareerPolicy |
| `getCareerPassport` | `GET /v2/athletes/{athlete_id}/career` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CareerPolicy |
| `getCommunityFeed` | `GET /v2/community/feed` | community | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CommunityPolicy |
| `getFeatures` | `GET /v2/features` | features | PUBLIC | FEATURE_GATE | NOT_REQUIRED | NO_SECURITY_AUDIT_REQUIRED | AuthorizationPolicy |
| `getMatch` | `GET /v2/matches/{match_id}` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | MatchPolicy |
| `getMe` | `GET /v2/me` | me | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `getPrivacyRequest` | `GET /v2/privacy/requests/{request_id}` | privacy | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `getRoleVerification` | `GET /v2/role-verifications/{verification_id}` | role-verifications | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `getSafetyIncident` | `GET /v2/safety/incidents/{incident_id}` | safety | PROTECTED | IDENTITY, ACCOUNT_STATE, ADMIN_SCOPE | INTERFACE_ONLY | AUDIT_REQUIRED | AdminPolicy |
| `getScoutingPreferences` | `GET /v2/scouting/preferences` | scouting | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | ScoutingPolicy |
| `getSquad` | `GET /v2/teams/{team_id}/squad` | teams | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `getStadiumHome` | `GET /v2/stadium/home` | stadium | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `getTacticRender` | `GET /v2/tactics/{tactic_id}/render` | tactics | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | MatchPolicy |
| `getTrainingPlan` | `GET /v2/training-plans/{plan_id}` | training-plans | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | TrainingPolicy |
| `getTrainingSession` | `GET /v2/training-sessions/{session_id}` | training-sessions | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | TrainingPolicy |
| `listCommunicationMessages` | `GET /v2/communication/threads/{thread_id}/messages` | communication | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CommunicationPolicy |
| `listCommunicationThreads` | `GET /v2/communication/threads` | communication | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | CommunicationPolicy |
| `listCompetitions` | `GET /v2/competitions` | competitions | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `listConsents` | `GET /v2/consents` | consents | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `listEvents` | `GET /v2/events` | events | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `listMatches` | `GET /v2/matches` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | MatchPolicy |
| `listNotifications` | `GET /v2/notifications` | notifications | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `listOpportunities` | `GET /v2/opportunities` | opportunities | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `listVisibleTeams` | `GET /v2/teams` | teams | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `markCommunicationThreadRead` | `POST /v2/communication/threads/{thread_id}/read` | communication | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CommunicationPolicy |
| `markNotificationRead` | `POST /v2/notifications/{notification_id}/read` | notifications | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `respondThread` | `POST /v2/threads/{thread_id}/response` | threads | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `revokeConsent` | `POST /v2/consents/{consent_id}/revoke` | consents | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `revokePortfolioShareGrant` | `POST /v2/athletes/{athlete_id}/portfolio/share-grants/{grant_id}/revoke` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CareerPolicy |
| `saveStadiumRecipe` | `PUT /v2/stadium/recipe` | stadium | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `search` | `GET /v2/search` | search | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | SECURITY_LOG_ON_DENY | AuthorizationPolicy |
| `sendCommunicationMessage` | `POST /v2/communication/threads/{thread_id}/messages` | communication | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CommunicationPolicy |
| `setCareerHighlights` | `POST /v2/athletes/{athlete_id}/career/highlights` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CareerPolicy |
| `shareVideo` | `POST /v2/videos/{video_id}/share` | videos | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | MediaPolicy |
| `signup` | `POST /v2/signup` | signup | PUBLIC |  | NOT_REQUIRED | NO_SECURITY_AUDIT_REQUIRED | AuthorizationPolicy |
| `switchManagerRole` | `POST /v2/manager/switch-role` | manager | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `syncBatch` | `POST /v2/sync/batch` | sync | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `transitionMatchState` | `POST /v2/matches/{match_id}/state-transitions` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `updateCareerVisibility` | `PATCH /v2/athletes/{athlete_id}/career/visibility` | athletes | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | CareerPolicy |
| `updateMatchLineup` | `PUT /v2/matches/{match_id}/lineup` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `updateMatchRoster` | `PUT /v2/matches/{match_id}/roster` | matches | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `updateRolePreferences` | `PATCH /v2/me/role-preferences` | me | AUTHENTICATED | IDENTITY, ACCOUNT_STATE | INTERFACE_ONLY | AUDIT_ON_MUTATION | AuthorizationPolicy |
| `updateScoutingPreferences` | `PATCH /v2/scouting/preferences` | scouting | PROTECTED | IDENTITY, ACCOUNT_STATE, SELF_SCOPE, CONSENT_SCOPE, SAFEGUARDING | INTERFACE_ONLY | AUDIT_ON_MUTATION | ScoutingPolicy |
| `updateTactic` | `PUT /v2/tactics/{tactic_id}` | tactics | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | MatchPolicy |
| `updateTrainingAttendance` | `POST /v2/training-sessions/{session_id}/attendance` | training-sessions | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | TrainingPolicy |
| `updateTrainingPlan` | `PUT /v2/training-plans/{plan_id}` | training-plans | PROTECTED | IDENTITY, ACCOUNT_STATE, VERIFIED_ROLE_GRANT, TENANT_SCOPE, TEAM_SCOPE | INTERFACE_ONLY | AUDIT_ON_MUTATION | TrainingPolicy |

TOTAL OPERATIONS: 73

ACCOUNTED OPERATIONS: 73

UNCLASSIFIED: 0
