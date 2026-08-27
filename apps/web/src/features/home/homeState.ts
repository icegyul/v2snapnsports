import type { EventKind } from "../../api/contracts";

export interface HomeStateItem { id: string; kind: EventKind; startsAt: string; }

const priority: Record<EventKind, number> = { MATCH: 0, TRAINING: 1, NOTICE: 2 };

export function selectHomeState(items: HomeStateItem[]): HomeStateItem | null {
  return [...items].sort((left, right) => priority[left.kind] - priority[right.kind] || left.startsAt.localeCompare(right.startsAt))[0] ?? null;
}
