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
              {/* Shield drawn as SVG so the same artwork survives being blown
                  up for a printed card. Ornament is our own - no club, league
                  or player likeness is reproduced. */}
              <svg className="player-card-shield" viewBox="0 0 320 470" role="img" aria-label={`${card.displayName} 카드, 종합 ${card.rating}, ${card.position}`}>
                <defs>
                  <linearGradient id="cardPlate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" className="plate-top" />
                    <stop offset="52%" className="plate-mid" />
                    <stop offset="100%" className="plate-bottom" />
                  </linearGradient>
                  <linearGradient id="cardEdge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" className="edge-a" />
                    <stop offset="50%" className="edge-b" />
                    <stop offset="100%" className="edge-a" />
                  </linearGradient>
                  <clipPath id="cardClip">
                    <path d="M24 28 C24 19 31 12 40 12 L280 12 C289 12 296 19 296 28 L296 386 C296 422 258 446 160 464 C62 446 24 422 24 386 Z" />
                  </clipPath>
                </defs>

                <path
                  className="player-card-plate"
                  d="M24 28 C24 19 31 12 40 12 L280 12 C289 12 296 19 296 28 L296 386 C296 422 258 446 160 464 C62 446 24 422 24 386 Z"
                  fill="url(#cardPlate)"
                  stroke="url(#cardEdge)"
                  strokeWidth="6"
                />

                <g clipPath="url(#cardClip)">
                  {/* Portrait silhouette: a real photo drops in here later. */}
                  <circle className="player-card-silhouette" cx="206" cy="152" r="43" />
                  <path className="player-card-silhouette" d="M206 200 C160 200 136 238 132 286 L280 286 C276 238 252 200 206 200 Z" />
                </g>

                <path className="player-card-inner-frame" d="M38 30 C38 24 42 20 48 20 L272 20 C278 20 282 24 282 30 L282 380 C282 410 250 431 160 448 C70 431 38 410 38 380 Z" />

                <text className="player-card-svg-rating player-card-rating" x="66" y="92" textAnchor="middle">{card.rating}</text>
                <text className="player-card-svg-position" x="66" y="126" textAnchor="middle">{card.positionCode}</text>
                <text className="player-card-svg-shirt" x="66" y="152" textAnchor="middle">#{card.shirtNumber}</text>

                <line className="player-card-rule" x1="66" y1="292" x2="254" y2="292" />
                <text className="player-card-svg-name" x="160" y="322" textAnchor="middle">{card.displayName}</text>
                <line className="player-card-rule" x1="66" y1="340" x2="254" y2="340" />

                {card.stats.map((stat, index) => {
                  const column = index % 2;
                  const row = Math.floor(index / 2);
                  const valueX = column === 0 ? 116 : 214;
                  const keyX = column === 0 ? 124 : 222;
                  const y = 372 + row * 30;
                  return (
                    <g key={stat.key} data-testid="player-card-stat">
                      <text className="player-card-svg-stat-value" x={valueX} y={y} textAnchor="end">{stat.value}</text>
                      <text className="player-card-svg-stat-key" x={keyX} y={y}>{stat.key}</text>
                      <title>{stat.label} {stat.value}</title>
                    </g>
                  );
                })}
                <line className="player-card-rule" x1="160" y1="352" x2="160" y2="440" />
              </svg>

              <p className="player-card-identity">
                <span className="player-card-tier">{TIER_LABEL[card.tier]}</span>
                <span>#{card.shirtNumber} · {card.position}</span>
                {card.secondaryPosition && <span className="player-card-second">· {card.secondaryPosition}</span>}
              </p>
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
