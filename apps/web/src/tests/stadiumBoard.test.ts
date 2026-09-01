import { describe, expect, it } from "vitest";
import { buildStadiumBoard, describeSchedule } from "../features/stadium/stadiumBoardModel";

const match = {
  kind: "MATCH" as const,
  label: "다음 경기 · 데모 일정",
  startsAt: "2026-09-04T14:00:00+09:00",
  availability: "AVAILABLE" as const,
};
const training = {
  kind: "TRAINING" as const,
  label: "다음 훈련 · 데모 일정",
  startsAt: "2026-08-28T18:30:00+09:00",
  availability: "AVAILABLE" as const,
};

const now = "2026-09-01T09:00:00+09:00";

describe("describeSchedule", () => {
  it("counts down to an upcoming date", () => {
    const described = describeSchedule(match, now);
    expect(described.relation).toBe("UPCOMING");
    expect(described.dayGap).toBe(3);
    expect(described.badge).toBe("D-3");
  });

  it("calls today today", () => {
    const described = describeSchedule({ ...match, startsAt: "2026-09-01T20:00:00+09:00" }, now);
    expect(described.relation).toBe("TODAY");
    expect(described.badge).toBe("오늘");
  });

  it("says a past date is past instead of showing a negative countdown", () => {
    const described = describeSchedule(training, now);
    expect(described.relation).toBe("PAST");
    expect(described.badge).toBe("지난 일정");
    expect(described.badge).not.toContain("-");
  });

  it("keeps the schedule's own label and formats the date and time", () => {
    const described = describeSchedule(match, now);
    expect(described.label).toBe("다음 경기 · 데모 일정");
    expect(described.dateText).toBe("9월 4일");
    expect(described.timeText).toBe("14:00");
  });

  it("carries availability through so a blocked slot can be shown as such", () => {
    expect(describeSchedule({ ...match, availability: "UNAVAILABLE" }, now).available).toBe(false);
    expect(describeSchedule(match, now).available).toBe(true);
  });

  it("survives a schedule with no usable date", () => {
    const described = describeSchedule({ ...match, startsAt: "not-a-date" }, now);
    expect(described.relation).toBe("UNKNOWN");
    expect(described.badge).toBe("일정 미정");
    expect(described.dateText).toBe("");
  });
});

describe("buildStadiumBoard", () => {
  it("routes the match row to matches and the training row to training", () => {
    const board = buildStadiumBoard({ nextMatch: match, nextTraining: training }, now);
    expect(board).toHaveLength(2);
    expect(board[0].kind).toBe("MATCH");
    expect(board[0].destination).toBe("/matches");
    expect(board[1].kind).toBe("TRAINING");
    expect(board[1].destination).toBe("/training");
  });

  it("leads with the fixture, the way a scoreboard does", () => {
    const board = buildStadiumBoard({ nextMatch: match, nextTraining: training }, now);
    expect(board.map((row) => row.kind)).toEqual(["MATCH", "TRAINING"]);
  });

  it("names each row for a screen reader instead of leaving chips to speak", () => {
    const board = buildStadiumBoard({ nextMatch: match, nextTraining: training }, now);
    for (const row of board) {
      expect(row.ariaLabel).toContain(row.badge);
      expect(row.ariaLabel.length).toBeGreaterThan(8);
    }
    expect(board[0].ariaLabel).toContain("경기");
    expect(board[1].ariaLabel).toContain("훈련");
  });

  it("gives every row a short heading of its own", () => {
    const board = buildStadiumBoard({ nextMatch: match, nextTraining: training }, now);
    expect(board[0].title).toBe("다음 경기");
    expect(board[1].title).toBe("다음 훈련");
  });
});

describe("the demo schedule the board reads", () => {
  it("always sits ahead of today, so the board never opens on a stale fixture", async () => {
    const { FixtureCoreProductAdapter } = await import("../adapters/fixtureCoreProductAdapter");
    const home = await new FixtureCoreProductAdapter().getStadiumHome();
    const board = buildStadiumBoard(
      { nextMatch: home.nextMatch, nextTraining: home.nextTraining },
      new Date().toISOString(),
    );
    for (const row of board) {
      expect(["TODAY", "UPCOMING"]).toContain(row.relation);
      expect(row.badge).not.toBe("지난 일정");
    }
  });
});
