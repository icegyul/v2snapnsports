import { useState } from "react";

export function TrainingDetailPage() {
  const [participation, setParticipation] = useState("GOING");
  return <main className="shell-main"><p className="eyebrow">TRAINING · FIXTURE LOCAL</p><h1>훈련 상세</h1><h2>패스 선택과 움직임</h2><p>참가 상태: {participation}</p><div><button type="button" onClick={() => setParticipation("GOING")}>참가 예정</button><button type="button" onClick={() => setParticipation("LATE")}>늦게 참여</button><button type="button" onClick={() => setParticipation("NOT_GOING")}>불참</button></div></main>;
}

export function VideoDetailPage() {
  return <main className="shell-main"><p className="eyebrow">VIDEO · FIXTURE LOCAL</p><h1>영상 상세</h1><section className="surface-card"><h2>영상을 볼 수 없습니다</h2><p>권한이 확인된 playback source만 표시합니다.</p></section></main>;
}

export function CareerSeasonPage() {
  return <main className="shell-main"><p className="eyebrow">CAREER · FIXTURE LOCAL</p><h1>시즌 기록</h1><section><h2>DEMO U17 A팀</h2><article><h3>DEMO U17 A팀 합류</h3><p>검증된 기록</p></article></section><button type="button" disabled>공유 설정</button></main>;
}
