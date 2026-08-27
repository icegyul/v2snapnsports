export interface FormationSlot { id: string; role: "GK" | "DF" | "CM" | "FW"; x: number; y: number; isMe: boolean; }

const formation433: Omit<FormationSlot, "isMe">[] = [
  { id: "gk", role: "GK", x: 50, y: 90 },
  { id: "df-1", role: "DF", x: 18, y: 72 }, { id: "df-2", role: "DF", x: 39, y: 76 }, { id: "df-3", role: "DF", x: 61, y: 76 }, { id: "df-4", role: "DF", x: 82, y: 72 },
  { id: "cm-1", role: "CM", x: 25, y: 48 }, { id: "cm-2", role: "CM", x: 50, y: 42 }, { id: "cm-3", role: "CM", x: 75, y: 48 },
  { id: "fw-1", role: "FW", x: 24, y: 20 }, { id: "fw-2", role: "FW", x: 50, y: 15 }, { id: "fw-3", role: "FW", x: 76, y: 20 }
];

export function mapFormationSlots(formation: "4-3-3", playerId: string): FormationSlot[] {
  return formation433.map((slot) => ({ ...slot, isMe: playerId === "fixture-player" && slot.id === "cm-2" }));
}
