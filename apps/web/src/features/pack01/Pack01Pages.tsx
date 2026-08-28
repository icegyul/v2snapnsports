import { useState } from "react";
import { Link } from "react-router-dom";
import { createPack01Domain } from "../../../../../packages/pack01/domain";

const domain = createPack01Domain();
const coach = { actorUserId: "coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const };
const training = domain.createTrainingSession(coach, { teamId: "team-a", objective: "패스 선택" });
const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO B" });
const tactic = domain.createTactic(coach, { teamId: "team-a", name: "전환" }); domain.createTacticVersion(coach, tactic.id, { mode: "PLAN_TACTIC", paths: ["pass", "move"] });

export function Pack01TrainingPage() { const [response, setResponse] = useState("GOING"); return <main className="shell-main"><h1>훈련</h1><article><h2>다음 훈련</h2><p>{training.objective}</p><p>참가 상태: {response}</p><button onClick={() => setResponse("LATE")}>늦게 참여</button><Link to={`/training/${training.id}`}>훈련 상세</Link></article></main>; }
export function Pack01TrainingDetailPage() { const [state, setState] = useState(training.state); return <main className="shell-main"><h1>훈련 상세</h1><p>계획 revision {training.plans.at(-1)?.version}</p><p>상태: {state}</p><button onClick={() => setState(domain.transitionTraining(coach, training.id, "READY", training.version).state)}>준비 완료</button></main>; }
export function Pack01MatchPage() { return <main className="shell-main"><h1>경기</h1><article><h2>{match.opponent}전</h2><p>상태: {match.state}</p><Link to={`/matches/${match.id}`}>매치 센터</Link></article></main>; }
export function Pack01MatchCenterPage() { domain.updateRoster(coach, match.id, ["player-a"]); domain.updateLineup(coach, match.id, { starters: ["player-a"], substitutes: [], captain: "player-a" }); return <main className="shell-main"><h1>매치 센터</h1><p>Roster 1 · Lineup 1 · Captain player-a</p><p>이벤트 타임라인 {match.events.length}</p></main>; }
export function Pack01TacticPage() { const playback = domain.getTacticalPlayback(coach, tactic.id); return <main className="shell-main"><h1>전술 보드</h1><p>PLAN · 2D 편집</p><p>formation · player placement · ball · pass path · pressure zone</p><Link to={`/tactics/${tactic.id}/playback`}>STATIC 재생</Link><p>버전 {playback.version?.version}</p></main>; }
export function Pack01PlaybackPage() { return <main className="shell-main"><h1>전술 재생</h1><p>STATIC playback · 2D tactic source</p><p>3D asset 실패에도 timeline과 path를 유지합니다.</p></main>; }
