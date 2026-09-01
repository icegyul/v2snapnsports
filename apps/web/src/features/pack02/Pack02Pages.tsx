import { useState } from "react";
import { Link } from "react-router-dom";
import { createPack02FootballLifeDomain } from "../../../../../packages/pack02/domain";

const domain = createPack02FootballLifeDomain();
const player = {
  actorUserId: "player-a", accountType: "PLAYER" as const, accountState: "ACTIVE" as const,
  tenantId: "tenant-a", teamIds: ["team-a"], athleteId: "athlete-a", verifiedRoleGrants: [], guardianRelations: [],
  consents: [{ purpose: "PORTFOLIO_SHARE" as const, athleteId: "athlete-a", status: "ACTIVE" as const }, { purpose: "SCOUTING" as const, athleteId: "athlete-a", status: "ACTIVE" as const }, { purpose: "COMMUNICATION" as const, athleteId: "athlete-a", status: "ACTIVE" as const }],
  safeguardingBlocked: false, feature: "CORE" as const, operation: "athlete:private-read" as const, requestId: "pack02-player"
};
const coach = { ...player, actorUserId: "coach-a", accountType: "MANAGER" as const, athleteId: undefined, verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], operation: "team:manage" as const, requestId: "pack02-coach" };
const agent = { ...player, actorUserId: "agent-a", accountType: "MANAGER" as const, athleteId: undefined, verifiedRoleGrants: [{ role: "AGENT" as const, tenantId: "tenant-a", status: "VERIFIED" as const }], operation: "athlete:private-read" as const, requestId: "pack02-agent" };

domain.registerAthlete({ athleteId: "athlete-a", tenantId: "tenant-a", teamId: "team-a", age: 16, positions: ["MF"], region: "SEOUL", minor: true });
domain.setScoutingConsent(player, "athlete-a", true);
domain.addCareerEvent(player, { athleteId: "athlete-a", seasonId: "fixture-2026", type: "TEAM_JOINED", occurredAt: "2026-03-01T00:00:00Z", title: "FIXTURE U17 A팀 합류", source: { type: "TEAM_MEMBERSHIP", id: "fixture-membership-1", version: 1, verifiedState: "VERIFIED" } });
const opportunity = domain.createOpportunity(coach, { organizerTenantId: "tenant-a", teamId: "team-a", type: "TRYOUT", ageMin: 15, ageMax: 17, positions: ["MF"], region: "SEOUL", state: "OPEN", earthusContext: "UNAVAILABLE" });
const thread = domain.createTeamThread(coach, { teamId: "team-a", context: "SCHEDULE_CHANGE", contextId: "fixture-training-1", recipientAthleteIds: ["athlete-a"] });

export function Pack02CareerPassportPage() {
  const passport = domain.getCareerPassport(player, "athlete-a");
  const records = passport.chapters.reduce((total, chapter) => total + chapter.events.length, 0);

  return (
    <main className="shell-main screen">
      <header className="screen-head">
        <p className="eyebrow">CAREER PASSPORT</p>
        <h1>커리어 패스포트</h1>
        <p className="screen-sub">지금까지 쌓인 기록입니다. 검증된 출처가 있는 항목만 남습니다.</p>
      </header>

      <dl className="screen-facts">
        <div className="screen-fact"><dt>시즌</dt><dd>{passport.chapters.length}</dd></div>
        <div className="screen-fact"><dt>기록</dt><dd>{records}</dd></div>
      </dl>

      <section className="screen-section" aria-label="커리어 타임라인">
        <h2>시즌 여정</h2>
        {passport.chapters.map((chapter) => (
          <section key={chapter.seasonId} className="screen-section">
            <h3 className="screen-row-title">{chapter.seasonId}</h3>
            <ul className="screen-list">
              {chapter.events.map((event) => (
                <li key={event.id}>
                  <article className="screen-row">
                    <span className="screen-row-title">{event.title}</span>
                    <span className="screen-pill" data-tone="GOOD">검증된 기록</span>
                    <span className="screen-row-meta">{event.occurredAt.slice(0, 10)}</span>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <nav className="screen-actions" aria-label="커리어 관련 작업">
        <Link className="screen-action" to="/player/me/card">마이 카드</Link>
        <Link className="screen-action" data-variant="quiet" to="/player/me/career/season/fixture-2026">시즌 기록</Link>
        <Link className="screen-action" data-variant="quiet" to="/player/me/portfolio">포트폴리오 공유</Link>
      </nav>

      <p className="screen-note">Legacy Wall은 이 기록의 표시용 projection입니다. 자동 평가나 프로 가능성 점수는 만들지 않습니다.</p>
    </main>
  );
}

export function Pack02CareerSeasonPage() {
  const passport = domain.getCareerPassport(player, "athlete-a");
  return <main className="shell-main"><p className="eyebrow">CAREER · FIXTURE LOCAL</p><h1>시즌 기록</h1><h2>fixture-2026</h2>{passport.chapters[0]?.events.map((event) => <article className="surface-card" key={event.id}><h3>{event.title}</h3><p>검증된 기록 · source version {event.source.version}</p></article>)}<Link to="/player/me/career">커리어 패스포트로 돌아가기</Link></main>;
}

export function Pack02TeamCommunicationPage() {
  const [status, setStatus] = useState("");
  const send = () => { domain.sendTeamMessage(coach, thread.id, { body: "훈련 집합 시간이 변경되었습니다.", idempotencyKey: "fixture-schedule-change" }); setStatus("운영 메시지가 저장되었습니다"); };
  return <main className="shell-main"><p className="eyebrow">TEAM COMMUNICATION · FIXTURE LOCAL</p><h1>팀 커뮤니케이션</h1><section className="surface-card" aria-label="운영 대화"><h2>훈련 일정 변경</h2><p>팀 운영 메시지입니다. Community 게시물과 분리되며, 알림 전송은 outbox seam으로만 남깁니다.</p><button type="button" onClick={send}>운영 메시지 보내기</button>{status && <p role="status">{status}</p>}</section><p className="meta">미성년자에 대한 외부 직접 DM은 허용되지 않습니다.</p></main>;
}

export function Pack02OpportunityPage() {
  const [status, setStatus] = useState("");
  const requestReview = () => { const action = domain.createOpportunityAction(agent, opportunity.id, { athleteId: "athlete-a", action: "INVITED" }); setStatus(action.route === "GUARDIAN_OR_CLUB_MEDIATED" ? "보호자 또는 구단 검토 경로" : "허용된 포트폴리오 경로"); };
  return <main className="shell-main"><p className="eyebrow">OPPORTUNITY · FIXTURE LOCAL</p><h1>기회</h1><section className="surface-card"><h2>지역 트라이아웃</h2><p>포지션 · MF / 지역 · SEOUL / 연령 · 15–17</p><p>Earthus 일정 맥락: 연결되지 않음 — 기회 검토에는 영향을 주지 않습니다.</p><button type="button" onClick={requestReview}>기회 검토 요청</button>{status && <p role="status">{status}</p>}</section><p className="meta">능력 랭킹, 자동 평가, 직접 연락처는 제공하지 않습니다.</p></main>;
}

export function Pack02PortfolioPage() {
  const [grantId, setGrantId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const share = () => { const grant = domain.createPortfolioShareGrant(player, { athleteId: "athlete-a", expiresAt: "2026-12-31T00:00:00Z", audience: "SCOUTING_ALLOWED", mediatedBy: "GUARDIAN" }); setGrantId(grant.id); setStatus("공유 범위가 설정되었습니다"); };
  const revoke = () => { if (!grantId) return; domain.revokePortfolioShareGrant(player, grantId); setGrantId(null); setStatus("공유가 철회되었습니다"); };
  return <main className="shell-main"><p className="eyebrow">PORTFOLIO · FIXTURE LOCAL</p><h1>포트폴리오 공유</h1><section className="surface-card"><h2>보호자 또는 구단 경유 범위</h2><p>미성년 선수의 scouting 공개는 보호자 또는 구단 정책 결과가 있을 때만 가능합니다.</p>{grantId ? <button type="button" onClick={revoke}>공유 철회</button> : <button type="button" onClick={share}>보호자 또는 구단 경유 공유 설정</button>}{status && <p role="status">{status}</p>}</section><p className="meta">직접 연락처, 건강 정보, 비공개 코치 메모는 포트폴리오에 포함하지 않습니다.</p></main>;
}
