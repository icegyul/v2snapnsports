import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPack02FootballLifeDomain } from "../../../../../packages/pack02/domain";
import type { CoreStadiumHome } from "../../api/coreProductContracts";
import { FixtureCoreProductAdapter } from "../../adapters/fixtureCoreProductAdapter";
import { buildPlayerCardFace, summarizeCareer, type PlayerCardTier } from "./playerCardModel";
import "./playerCard.css";

const TIER_LABEL: Record<PlayerCardTier, string> = {
  GOLD: "골드",
  SILVER: "실버",
  BRONZE: "브론즈",
};

// Career records come from the Pack02 football-life domain, the same fixture
// the career passport reads, so the card and the passport never disagree.
const careerDomain = createPack02FootballLifeDomain();
const careerActor = {
  actorUserId: "player-a",
  accountType: "PLAYER" as const,
  accountState: "ACTIVE" as const,
  tenantId: "tenant-a",
  teamIds: ["team-a"],
  athleteId: "athlete-a",
  verifiedRoleGrants: [],
  guardianRelations: [],
  consents: [{ purpose: "PORTFOLIO_SHARE" as const, athleteId: "athlete-a", status: "ACTIVE" as const }],
  safeguardingBlocked: false,
  feature: "CORE" as const,
  operation: "athlete:private-read" as const,
  requestId: "player-card",
};

careerDomain.registerAthlete({
  athleteId: "athlete-a",
  tenantId: "tenant-a",
  teamId: "team-a",
  age: 16,
  positions: ["MF"],
  region: "SEOUL",
  minor: true,
});
careerDomain.addCareerEvent(careerActor, {
  athleteId: "athlete-a",
  seasonId: "fixture-2026",
  type: "TEAM_JOINED",
  occurredAt: "2026-03-01T00:00:00Z",
  title: "FIXTURE U17 A팀 합류",
  source: { type: "TEAM_MEMBERSHIP", id: "fixture-membership-1", version: 1, verifiedState: "VERIFIED" },
});

const productAdapter = new FixtureCoreProductAdapter();

export function MyPlayerCardPage() {
  const [face, setFace] = useState<"FRONT" | "BACK">("FRONT");
  const [home, setHome] = useState<CoreStadiumHome | null>(null);
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    void productAdapter.getStadiumHome().then(setHome);
  }, []);

  const career = useMemo(
    () => summarizeCareer(careerDomain.getCareerPassport(careerActor, "athlete-a").chapters),
    [],
  );

  if (!home) {
    return (
      <main className="shell-main player-card-page">
        <p className="eyebrow">MY CARD</p>
        <p role="status">카드를 불러오는 중입니다.</p>
      </main>
    );
  }

  const card = buildPlayerCardFace({
    displayName: home.player.displayName,
    shirtNumber: home.player.shirtNumber,
    primaryPosition: home.player.primaryPosition,
    secondaryPosition: home.player.secondaryPosition,
  });

  const flip = face === "FRONT" ? "BACK" : "FRONT";
  const flipLabel = face === "FRONT" ? "커리어 기록 보기" : "카드 앞면 보기";
  const transition = reducedMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 0.72, 0, 1] as const };

  return (
    <main className="shell-main player-card-page">
      <header className="player-card-head">
        <p className="eyebrow">MY CARD</p>
        <h1>마이 카드</h1>
        <p className="player-card-sub">내 포지션과 능력치, 그리고 지금까지 쌓인 커리어 기록.</p>
      </header>

      <section
        className="player-card"
        aria-label="내 선수 카드"
        data-card-face={face}
        data-card-tier={card.tier}
      >
        <AnimatePresence initial={false} mode="wait">
          {face === "FRONT" ? (
            <motion.div
              key="front"
              className="player-card-front"
              initial={reducedMotion ? false : { opacity: 0, rotateY: -12 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: 12 }}
              transition={transition}
            >
              <div className="player-card-top">
                <span className="player-card-rating">{card.rating}</span>
                <span className="player-card-tier">{TIER_LABEL[card.tier]}</span>
                <span className="player-card-role" data-role={card.role}>{card.role}</span>
              </div>
              <div className="player-card-portrait" aria-hidden="true">{card.shirtNumber}</div>
              <p className="player-card-name">{card.displayName}</p>
              <p className="player-card-position">
                #{card.shirtNumber} · {card.position}
                {card.secondaryPosition && <span> · {card.secondaryPosition}</span>}
              </p>
              <dl className="player-card-stats">
                {card.stats.map((stat) => (
                  <div key={stat.key} className="player-card-stat" data-testid="player-card-stat">
                    <dt>{stat.label}</dt>
                    <dd>
                      <span className="player-card-bar" aria-hidden="true">
                        <span
                          style={{ width: `${Math.round((stat.value / 135) * 100)}%` }}
                          data-strong={stat.value >= 110 ? "true" : "false"}
                        />
                      </span>
                      <span className="player-card-stat-value">{stat.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="player-card-note">데모 능력치 · 훈련 기록 연동 전</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="player-card-back"
              aria-label="커리어 기록"
              data-records={career.records}
              initial={reducedMotion ? false : { opacity: 0, rotateY: 12 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: -12 }}
              transition={transition}
            >
              <div className="player-card-tallies">
                <div><b>{career.seasons}</b><span>시즌</span></div>
                <div><b>{career.records}</b><span>기록</span></div>
                <div><b>{career.verified}</b><span>검증됨</span></div>
              </div>
              <ol className="player-card-timeline">
                {career.highlights.map((highlight) => (
                  <li key={highlight.id}>
                    <span className="player-card-timeline-date">{highlight.date}</span>
                    <span className="player-card-timeline-title">{highlight.title}</span>
                    <span className={`player-card-timeline-state ${highlight.verified ? "is-verified" : ""}`}>
                      {highlight.verified ? "검증됨" : "확인 전"}
                    </span>
                  </li>
                ))}
                {career.highlights.length === 0 && <li className="player-card-empty">아직 기록이 없습니다.</li>}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="player-card-actions">
        <button type="button" className="player-card-flip" onClick={() => setFace(flip)}>
          {flipLabel}
        </button>
        <Link className="player-card-link" to="/player/me/career">커리어 패스포트 전체 보기</Link>
      </div>
    </main>
  );
}
