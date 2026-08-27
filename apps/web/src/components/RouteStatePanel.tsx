export type RouteState = "LOADING" | "EMPTY" | "ERROR" | "OFFLINE" | "FORBIDDEN" | "STALE";

const copy: Record<RouteState, { title: string; detail: string }> = {
  LOADING: { title: "불러오는 중", detail: "현재 상태를 준비하고 있습니다." },
  EMPTY: { title: "표시할 내용이 없습니다", detail: "새 데이터가 연결되면 이 영역에 표시됩니다." },
  ERROR: { title: "연결을 완료하지 못했습니다", detail: "다시 시도" },
  OFFLINE: { title: "오프라인", detail: "네트워크 연결 후 최신 상태를 확인합니다." },
  FORBIDDEN: { title: "접근할 수 없습니다", detail: "이 정보에 필요한 권한이 없습니다." },
  STALE: { title: "마지막 동기화", detail: "표시된 정보가 최신이 아닐 수 있습니다." }
};

export function RouteStatePanel({ state }: { state: RouteState }) {
  const value = copy[state];
  return <section className="state-panel" aria-live="polite"><strong>{value.title}</strong><span>{value.detail}</span></section>;
}
