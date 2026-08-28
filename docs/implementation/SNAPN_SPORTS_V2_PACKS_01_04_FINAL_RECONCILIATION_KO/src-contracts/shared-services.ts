export interface SharedServiceContract {
  readonly service: string;
  readonly canonicalOwner: string;
  readonly consumers: readonly string[];
  readonly hardRules: readonly string[];
}

export const SHARED_SERVICES: readonly SharedServiceContract[] = [
  {
    service: "Authorization",
    canonicalOwner: "SHARED/SECURITY",
    consumers: ["PACK 01","PACK 02","PACK 03","PACK 04"],
    hardRules: ["default-deny","server-authoritative","tenant-before-resource","consent-and-safeguarding-before-sensitive-data"]
  },
  {
    service: "RoleGrant",
    canonicalOwner: "SHARED/ROLE",
    consumers: ["PACK 01","PACK 02","PACK 03","PACK 04"],
    hardRules: ["RolePreference-is-not-permission","active-role-switch-by-role_grant_id","self-grant-denied"]
  },
  {
    service: "GuardianConsent",
    canonicalOwner: "SHARED/GUARDIAN",
    consumers: ["PACK 01","PACK 02","PACK 03","PACK 04"],
    hardRules: ["minor-first","versioned-consent","revocation-immediately-denies-new-access"]
  },
  {
    service: "Safeguarding",
    canonicalOwner: "SHARED/SAFETY",
    consumers: ["PACK 01","PACK 02","PACK 03","PACK 04"],
    hardRules: ["blocked-relation-hard-deny","minor-direct-contact-mediated","no-role-bypass"]
  },
  {
    service: "Audit",
    canonicalOwner: "SHARED/OPS",
    consumers: ["PACK 01","PACK 02","PACK 03","PACK 04"],
    hardRules: ["all-admin-mutations-audited","sensitive-denies-observable","no-secret-payload-copy"]
  },
  {
    service: "EarthusContext",
    canonicalOwner: "SHARED/EARTHUS",
    consumers: ["PACK 01","PACK 03","PACK 04"],
    hardRules: ["soft-dependency","last-good-cache-may-be-stale","failure-never-blocks-core-training-match"]
  }
] as const;
