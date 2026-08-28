export interface PackDependency {
  readonly source: string;
  readonly target: string;
}
export const PACK_DEPENDENCIES = [
  {
    "source": "PACK01.Training",
    "target": "PACK02.CareerPassport"
  },
  {
    "source": "PACK01.Match",
    "target": "PACK02.CareerPassport"
  },
  {
    "source": "PACK01.Tactics",
    "target": "PACK03.CoachAnalystProjection"
  },
  {
    "source": "PACK01.Training",
    "target": "PACK03.CoachWorkspace"
  },
  {
    "source": "PACK01.Match",
    "target": "PACK03.RefereeWorkspace"
  },
  {
    "source": "PACK02.Communication",
    "target": "PACK03.TeamManagerWorkspace"
  },
  {
    "source": "PACK02.Opportunity",
    "target": "PACK03.AgentWorkspace"
  },
  {
    "source": "PACK02.Opportunity",
    "target": "SHARED.GuardianClubConsent"
  },
  {
    "source": "PACK04.RoleVerification",
    "target": "SHARED.RoleGrant"
  },
  {
    "source": "Community.Report",
    "target": "PACK04.Moderation"
  },
  {
    "source": "SHARED.Safeguarding",
    "target": "PACK02.CommunicationScouting"
  },
  {
    "source": "SHARED.Safeguarding",
    "target": "Community"
  },
  {
    "source": "SHARED.Earthus",
    "target": "PACK01.ScheduleTrainingMatch"
  }
] as const satisfies readonly PackDependency[];

export const REAL_SCHEMA_EXTENSION_COUNT = 4 as const;
export const REAL_SCHEMA_EXTENSION_IDS = ["PSE-001","PSE-002","P2-PSE-002","P2-PSE-003"] as const;
