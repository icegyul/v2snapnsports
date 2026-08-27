import type { UserProfile } from "../api/contracts";

export interface FoundationSession { user: UserProfile | null; staleAt: string | null; }

export const initialFoundationSession: FoundationSession = { user: null, staleAt: null };
