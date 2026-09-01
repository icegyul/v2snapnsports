import type { CoreScheduleItem } from "../../api/coreProductContracts";

// The stadium's ribbon board: what is next, and the way into the screen that
// owns it. Dates are described relative to a caller-supplied "now" so the
// wording is testable and a past fixture never renders as a negative
// countdown.

export type ScheduleRelation = "TODAY" | "UPCOMING" | "PAST" | "UNKNOWN";

export interface DescribedSchedule {
  readonly label: string;
  readonly relation: ScheduleRelation;
  readonly dayGap: number;
  readonly badge: string;
  readonly dateText: string;
  readonly timeText: string;
  readonly available: boolean;
}

export interface StadiumBoardRow extends DescribedSchedule {
  readonly kind: "MATCH" | "TRAINING";
  readonly title: string;
  readonly destination: string;
  readonly ariaLabel: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar day in the +09:00 offset the fixtures are written in. */
function dayNumber(iso: string): number | null {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return Math.floor((time + 9 * 60 * 60 * 1000) / DAY_MS);
}

function partsOf(iso: string): { dateText: string; timeText: string } {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return { dateText: "", timeText: "" };
  const shifted = new Date(time + 9 * 60 * 60 * 1000);
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  return { dateText: `${month}월 ${day}일`, timeText: `${hours}:${minutes}` };
}

export function describeSchedule(item: CoreScheduleItem, nowIso: string): DescribedSchedule {
  const eventDay = dayNumber(item.startsAt);
  const today = dayNumber(nowIso);
  const { dateText, timeText } = partsOf(item.startsAt);
  const available = item.availability === "AVAILABLE";

  if (eventDay === null || today === null) {
    return { label: item.label, relation: "UNKNOWN", dayGap: 0, badge: "일정 미정", dateText: "", timeText: "", available };
  }

  const dayGap = eventDay - today;
  if (dayGap === 0) {
    return { label: item.label, relation: "TODAY", dayGap, badge: "오늘", dateText, timeText, available };
  }
  if (dayGap > 0) {
    return { label: item.label, relation: "UPCOMING", dayGap, badge: `D-${dayGap}`, dateText, timeText, available };
  }
  return { label: item.label, relation: "PAST", dayGap, badge: "지난 일정", dateText, timeText, available };
}

export interface StadiumBoardSource {
  readonly nextMatch: CoreScheduleItem;
  readonly nextTraining: CoreScheduleItem;
}

export function buildStadiumBoard(source: StadiumBoardSource, nowIso: string): readonly StadiumBoardRow[] {
  const rows: readonly (readonly [StadiumBoardRow["kind"], string, string, CoreScheduleItem])[] = [
    ["MATCH", "다음 경기", "/matches", source.nextMatch],
    ["TRAINING", "다음 훈련", "/training", source.nextTraining],
  ];

  return rows.map(([kind, title, destination, item]) => {
    const described = describeSchedule(item, nowIso);
    const when = described.dateText ? `${described.dateText} ${described.timeText}` : "일정 미정";
    return {
      ...described,
      kind,
      title,
      destination,
      ariaLabel: `${title}, ${when}, ${described.badge}`,
    };
  });
}
