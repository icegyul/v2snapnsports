import { useState } from "react";
import { Link } from "react-router-dom";
import { createPack01Domain } from "../../../../../packages/pack01/domain";

const domain = createPack01Domain();
const coach = { actorUserId: "coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const };
const training = domain.createTrainingSession(coach, { teamId: "team-a", objective: "패스 선택" });
const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO B" });
const tactic = domain.createTactic(coach, { teamId: "team-a", name: "전환" }); domain.createTacticVersion(coach, tactic.id, { mode: "PLAN_TACTIC", paths: ["pass", "move"] });

const ATTENDANCE_LABEL: Record<string, string> = { GOING: "참석", LATE: "늦게 참여", ABSENT: "불참" };

function formatWhen(startAt: string): string {
  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) return startAt;
  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hours}:${minutes}`;
}

export function Pack01TrainingPage() {
  const [response, setResponse] = useState("GOING");
  const schedule = domain.getUpcomingSchedule(coach);

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">TRAINING</p>
        <h1>훈련</h1>
        <p className="screen-sub">다가오는 팀 일정과 다음 훈련의 목표를 확인하고 참가 여부를 알립니다.</p>
      </header>

      <section className="screen-section" aria-label="일정">
        <h2>다가오는 일정</h2>
        {schedule.length === 0 ? (
          <div className="screen-empty">
            <strong>예정된 일정이 없습니다</strong>
            <span>팀에 일정이 등록되면 이곳에 표시됩니다.</span>
          </div>
        ) : (
          <ul className="screen-list">
            {schedule.map((item) => (
              <li key={item.id}>
                <Link className="screen-row" to={item.targetRoute} data-kind={item.type}>
                  <span className="screen-row-title">{item.type === "TRAINING" ? "훈련" : "경기"}</span>
                  <span className="screen-pill" data-tone="MUTED">{item.type === "TRAINING" ? "팀 훈련" : "경기"}</span>
                  <span className="screen-row-meta">{formatWhen(item.startAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="screen-section">
        <h2>다음 훈련</h2>
        <article className="screen-panel">
          <p>{training.objective}</p>
          {/* One line, and it keeps the raw state: the attendance code is what
              the team's tooling shows, so the two must not drift apart. */}
          <p className="screen-status">참가 상태: {response}</p>
          <p className="screen-note">{ATTENDANCE_LABEL[response] ?? response}(으)로 표시됩니다.</p>
          <div className="screen-actions">
            <button className="screen-action" type="button" onClick={() => setResponse("LATE")}>늦게 참여</button>
            <Link className="screen-action" data-variant="quiet" to={`/training/${training.id}`}>훈련 상세</Link>
          </div>
        </article>
      </section>

      <p className="screen-note">데모 데이터 · 팀 운영 데이터 연결 전</p>
    </main>
  );
}

export function Pack01TrainingDetailPage() {
  const [state, setState] = useState(training.state);

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">TRAINING DETAIL</p>
        <h1>훈련 상세</h1>
        <p className="screen-sub">{training.objective}</p>
      </header>

      <section className="screen-panel">
        <dl className="screen-facts">
          <div className="screen-fact">
            <dt>계획 revision</dt>
            <dd>{training.plans.at(-1)?.version}</dd>
          </div>
          <div className="screen-fact">
            <dt>상태</dt>
            <dd>{state}</dd>
          </div>
        </dl>
        <div className="screen-actions">
          <button
            className="screen-action"
            type="button"
            onClick={() => setState(domain.transitionTraining(coach, training.id, "READY", training.version).state)}
          >
            준비 완료
          </button>
          <Link className="screen-action" data-variant="quiet" to="/training">훈련 목록</Link>
        </div>
      </section>
    </main>
  );
}

export function Pack01MatchPage() {
  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">MATCH</p>
        <h1>경기</h1>
        <p className="screen-sub">다음 상대와 준비 상태를 확인하고 매치 센터로 이동합니다.</p>
      </header>

      <article className="screen-panel">
        <h2>{match.opponent}전</h2>
        <dl className="screen-facts">
          <div className="screen-fact">
            <dt>준비 상태</dt>
            <dd>{match.state}</dd>
          </div>
        </dl>
        <div className="screen-actions">
          <Link className="screen-action" to={`/matches/${match.id}`}>매치 센터</Link>
        </div>
      </article>

      <p className="screen-note">데모 데이터 · 경기 운영 데이터 연결 전</p>
    </main>
  );
}

export function Pack01MatchCenterPage() {
  domain.updateRoster(coach, match.id, ["player-a"]);
  domain.updateLineup(coach, match.id, { starters: ["player-a"], substitutes: [], captain: "player-a" });

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">MATCH CENTRE</p>
        <h1>매치 센터</h1>
        <p className="screen-sub">{match.opponent}전 · 명단과 라인업, 경기 중 기록입니다.</p>
      </header>

      <section className="screen-panel">
        <dl className="screen-facts">
          <div className="screen-fact"><dt>Roster</dt><dd>1</dd></div>
          <div className="screen-fact"><dt>Lineup</dt><dd>1</dd></div>
          <div className="screen-fact"><dt>이벤트</dt><dd>{match.events.length}</dd></div>
        </dl>
        <p className="screen-note">주장 player-a</p>
      </section>

      <div className="screen-actions">
        <Link className="screen-action" data-variant="quiet" to="/matches">경기 목록</Link>
      </div>
    </main>
  );
}

export function Pack01TacticPage() {
  const playback = domain.getTacticalPlayback(coach, tactic.id);

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">TACTIC BOARD</p>
        <h1>전술 보드</h1>
        <p className="screen-sub">PLAN · 2D 편집</p>
      </header>

      <section className="screen-panel">
        <p>formation · player placement · ball · pass path · pressure zone</p>
        <dl className="screen-facts">
          <div className="screen-fact"><dt>버전</dt><dd>{playback.version?.version}</dd></div>
        </dl>
        <div className="screen-actions">
          <Link className="screen-action" to={`/tactics/${tactic.id}/playback`}>STATIC 재생</Link>
        </div>
      </section>
    </main>
  );
}

export function Pack01PlaybackPage() {
  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">TACTIC PLAYBACK</p>
        <h1>전술 재생</h1>
        <p className="screen-sub">STATIC playback · 2D tactic source</p>
      </header>

      <section className="screen-panel">
        <p>3D asset 실패에도 timeline과 path를 유지합니다.</p>
      </section>
    </main>
  );
}
