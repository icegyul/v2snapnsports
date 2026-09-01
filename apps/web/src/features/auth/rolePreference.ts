// What a person said they want to sign up as. This is a preference and
// nothing more: it grants no role, opens no manager screen, and is never read
// by the guard. Verified grants come from the server once a club or coach
// confirms the person, and only those decide permission.
//
// Guardians are deliberately absent — a guardian arrives through a player's
// invitation, never through public sign-up.

export const ROLE_PREFERENCE_STORAGE_KEY = "snapn:v2:role-preference";

export const ROLE_PREFERENCES = ["PLAYER", "MANAGER"] as const;

export type RolePreference = (typeof ROLE_PREFERENCES)[number];

export interface RolePreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function isRolePreference(value: string): value is RolePreference {
  return (ROLE_PREFERENCES as readonly string[]).includes(value);
}

export function readRolePreference(storage: RolePreferenceStorage): RolePreference | null {
  try {
    const stored = storage.getItem(ROLE_PREFERENCE_STORAGE_KEY);
    return stored && isRolePreference(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeRolePreference(storage: RolePreferenceStorage, preference: RolePreference): boolean {
  if (!isRolePreference(preference)) return false;
  try {
    storage.setItem(ROLE_PREFERENCE_STORAGE_KEY, preference);
    return true;
  } catch {
    return false;
  }
}

export function clearRolePreference(storage: RolePreferenceStorage): void {
  try {
    storage.removeItem(ROLE_PREFERENCE_STORAGE_KEY);
  } catch {
    // Nothing stored to clear.
  }
}
