import { createContext, lazy, Suspense, useContext, useEffect, useState, type ReactNode } from "react";
import { LazyMotion, useReducedMotion } from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import { BrowserRouter, Link, MemoryRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteStatePanel } from "../components/RouteStatePanel";
import { DigitalProjectionPage, FullStadiumJourneyPage, MyPositionPage, MyTeamFormationPage, PitchEntryPage, SpatialHomePage, StadiumApproachPage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";
import { CommunityPage, VideoPage } from "../features/product/RemainingProductPages";
import { Pack02CareerPassportPage, Pack02CareerSeasonPage, Pack02OpportunityPage, Pack02PortfolioPage, Pack02TeamCommunicationPage } from "../features/pack02/Pack02Pages";
import { AgentWorkspacePage, AnalystWorkspacePage, ClubDirectorWorkspacePage, CoachWorkspacePage, ManagerHomePage, RefereeWorkspacePage, TeamManagerWorkspacePage } from "../features/pack03/ManagerWorkspacePages";
import { AdminOverviewPage, AuditAdminPage, EarthusHealthAdminPage, JobsMediaAdminPage, MigrationAdminPage, ModerationAdminPage, PrivacyAdminPage, RoleVerificationAdminPage, SafeguardingAdminPage } from "../features/pack04/AdminOpsPages";
import { CommunityComposerPage, CommunityDetailPage } from "../features/community/CommunityInteractionPages";
import { VideoDetailPage } from "../features/product/ProductDetailPages";
import { playerNavigation } from "../routes/routePolicy";
import { Pack01MatchCenterPage, Pack01MatchPage, Pack01PlaybackPage, Pack01TacticPage, Pack01TrainingDetailPage, Pack01TrainingPage } from "../features/pack01/Pack01Pages";
import { loadStadiumMotionFeatures } from "../features/stadium/stadiumMotionLoader";
import { FixtureSessionAdapter, type SessionAdapter, type SessionUser } from "../adapters/sessionAdapter";
import { resolveRouteGuard, routeDenyMessage, routeNeedsSession } from "../routes/routeGuard";
import { readRolePreference, writeRolePreference, type RolePreference } from "../features/auth/rolePreference";
import { LoginPage } from "../features/auth/LoginPage";

const StadiumBuilderPage = lazy(() => import("../features/stadium-builder/StadiumBuilderPage")
  .then((module) => ({ default: module.StadiumBuilderPage })));

const StadiumSelectPage = lazy(() => import("../features/stadium/StadiumSelectPage")
  .then((module) => ({ default: module.StadiumSelectPage })));

const MyPlayerCardPage = lazy(() => import("../features/player/MyPlayerCardPage")
  .then((module) => ({ default: module.MyPlayerCardPage })));

function StadiumSelectRoute() {
  return <Suspense fallback={<main className="shell-main" role="status" aria-label="경기장 선택 준비"><p>경기장 선택 화면을 준비하고 있습니다.</p></main>}>
    <StadiumSelectPage />
  </Suspense>;
}

function MyPlayerCardRoute() {
  return <Suspense fallback={<main className="shell-main" role="status" aria-label="마이 카드 준비"><p>마이 카드를 준비하고 있습니다.</p></main>}>
    <MyPlayerCardPage />
  </Suspense>;
}

function StadiumBuilderRoute() {
  return <Suspense fallback={<main className="shell-main" role="status" aria-label="스타디움 설계 도구 준비"><p>스타디움 설계 도구를 준비하고 있습니다.</p></main>}>
    <StadiumBuilderPage />
  </Suspense>;
}

function BottomNavigation() {
  const location = useLocation();
  const reducedMotion = Boolean(useReducedMotion());
  return <LazyMotion features={loadStadiumMotionFeatures} strict><nav className="bottom-navigation" aria-label="플레이어 기본 탐색">
    {playerNavigation.map((item) => {
      const active = location.pathname === item.to;
      return <Link key={item.to} className={active ? "nav-active" : ""} to={item.to}>
        {item.label}
        {active && <MotionSpan
          className="stadium-nav-indicator"
          initial={reducedMotion ? false : { opacity: 0, scaleX: 0.35 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 0.72, 0, 1] }}
          aria-hidden="true"
        />}
      </Link>;
    })}
  </nav></LazyMotion>;
}

function RoleSelect() {
  const [preference, setPreference] = useState<RolePreference | null>(() => {
    try {
      return readRolePreference(window.localStorage);
    } catch {
      return null;
    }
  });

  const choose = (next: RolePreference) => {
    try {
      writeRolePreference(window.localStorage, next);
    } catch {
      // The choice still stands for this visit.
    }
    setPreference(next);
  };

  return <main className="shell-main auth-main">
    <p className="eyebrow">SNAPN SPORTS</p>
    <h1>어떻게 시작할까요?</h1>
    <p className="meta">선택은 가입 선호도이며, 매니저 권한은 별도 검증이 필요합니다.</p>
    <div className="role-grid">
      <button
        className={`role-card ${preference === "PLAYER" ? "is-chosen" : ""}`}
        type="button"
        aria-pressed={preference === "PLAYER"}
        onClick={() => choose("PLAYER")}
      >
        선수로 시작
      </button>
      <button
        className={`role-card ${preference === "MANAGER" ? "is-chosen" : ""}`}
        type="button"
        aria-pressed={preference === "MANAGER"}
        onClick={() => choose("MANAGER")}
      >
        매니저로 시작
      </button>
    </div>
    {preference && <p className="role-chosen" role="status">
      {preference === "PLAYER"
        ? "선수로 시작하도록 선택했습니다. 계정 만들기는 다음 단계입니다."
        : "매니저로 시작하도록 선택했습니다. 지도자·운영진 화면은 소속 확인이 끝난 뒤에 열립니다."}
    </p>}
    <p className="guardian-note">보호자는 선수 초대 링크로 시작합니다.</p>
    <Link className="role-continue" to="/login">계정 만들기로 이동</Link>
  </main>;
}

function GenericShell({ title }: { title: string }) { return <main className="shell-main"><p className="eyebrow">FOUNDATION ROUTE</p><h1>{title}</h1><RouteStatePanel state="EMPTY" /></main>; }

function RouteDenied({ reason }: { reason: Parameters<typeof routeDenyMessage>[0] }) {
  const message = routeDenyMessage(reason);
  return <main className="shell-main route-denied" role="alert" aria-label="접근 거부">
    <p className="eyebrow">ACCESS DENIED</p>
    <h1>{message.title}</h1>
    <p className="route-denied-detail">{message.detail}</p>
    <Link className="route-denied-home" to="/home">홈으로 돌아가기</Link>
  </main>;
}

const defaultSessionAdapter = new FixtureSessionAdapter();
const SessionAdapterContext = createContext<SessionAdapter>(defaultSessionAdapter);

/**
 * Client-side deny for screens a person should not reach by typing the
 * address. The backend remains the authority; this only stops the app from
 * rendering a manager or admin screen to someone who holds no verified grant.
 */
function RouteGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const adapter = useContext(SessionAdapterContext);
  const [user, setUser] = useState<SessionUser | null | undefined>(() => adapter.peekSession?.()?.user);

  useEffect(() => {
    let cancelled = false;
    void adapter.getSession()
      .then((snapshot) => {
        if (!cancelled) setUser(snapshot.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  if (user === undefined && routeNeedsSession(location.pathname)) {
    return <main className="shell-main" role="status" aria-label="접근 권한 확인"><p>화면을 준비하고 있습니다.</p></main>;
  }

  const guard = resolveRouteGuard(location.pathname, {
    accountType: user?.accountType ?? "PLAYER",
    verifiedGrants: user?.verifiedGrants ?? [],
  });
  if (!guard.allowed) return <RouteDenied reason={guard.reason} />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const isPublic = location.pathname === "/login" || location.pathname === "/signup/role" || location.pathname.startsWith("/invite/guardian/");
  const isStadiumBuilder = location.pathname === "/home/builder" || location.pathname === "/home/stadium";
  return <div className="app-shell"><RouteGuard><Routes>
    <Route path="/" element={<Navigate replace to="/home" />} />
    <Route path="/home" element={<StadiumExteriorPage />} />
    <Route path="/home/full" element={<FullStadiumJourneyPage />} />
    <Route path="/home/approach" element={<StadiumApproachPage />} />
    <Route path="/home/enter" element={<PitchEntryPage />} />
    <Route path="/home/projection" element={<DigitalProjectionPage />} />
    <Route path="/home/position" element={<MyPositionPage />} />
    <Route path="/home/formation" element={<MyTeamFormationPage />} />
    <Route path="/home/team" element={<SpatialHomePage />} />
    <Route path="/home/stadium" element={<StadiumSelectRoute />} />
    <Route path="/home/builder" element={<StadiumBuilderRoute />} />
    <Route path="/stadium" element={<Navigate replace to="/home" />} />
    <Route path="/signup/role" element={<RoleSelect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/invite/guardian/:inviteId" element={<GenericShell title="보호자 초대" />} />
    <Route path="/training" element={<Pack01TrainingPage />} />
    <Route path="/training/:eventId" element={<Pack01TrainingDetailPage />} />
    <Route path="/matches" element={<Pack01MatchPage />} />
    <Route path="/matches/:matchId" element={<Pack01MatchCenterPage />} />
    <Route path="/tactics/:tacticId" element={<Pack01TacticPage />} />
    <Route path="/tactics/:tacticId/playback" element={<Pack01PlaybackPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/community/post/:postId" element={<CommunityDetailPage />} />
    <Route path="/community/compose" element={<CommunityComposerPage />} />
    <Route path="/video" element={<VideoPage />} />
    <Route path="/video/:videoId" element={<VideoDetailPage />} />
    <Route path="/more" element={<GenericShell title="더보기" />} />
    <Route path="/manager" element={<ManagerHomePage />} />
    <Route path="/manager/coach" element={<CoachWorkspacePage />} />
    <Route path="/manager/team" element={<TeamManagerWorkspacePage />} />
    <Route path="/manager/club" element={<ClubDirectorWorkspacePage />} />
    <Route path="/manager/referee" element={<RefereeWorkspacePage />} />
    <Route path="/manager/agent" element={<AgentWorkspacePage />} />
    <Route path="/manager/analyst" element={<AnalystWorkspacePage />} />
    <Route path="/admin" element={<AdminOverviewPage />} />
    <Route path="/admin/role-verification" element={<RoleVerificationAdminPage />} />
    <Route path="/admin/moderation" element={<ModerationAdminPage />} />
    <Route path="/admin/safeguarding" element={<SafeguardingAdminPage />} />
    <Route path="/admin/privacy" element={<PrivacyAdminPage />} />
    <Route path="/admin/migration" element={<MigrationAdminPage />} />
    <Route path="/admin/jobs-media" element={<JobsMediaAdminPage />} />
    <Route path="/admin/audit" element={<AuditAdminPage />} />
    <Route path="/admin/earthus-health" element={<EarthusHealthAdminPage />} />
    <Route path="/communication" element={<Pack02TeamCommunicationPage />} />
    <Route path="/opportunities" element={<Pack02OpportunityPage />} />
    <Route path="/player/me/portfolio" element={<Pack02PortfolioPage />} />
    <Route path="/player/career" element={<Navigate replace to="/player/me/career" />} />
    <Route path="/player/me" element={<Pack02CareerPassportPage />} />
    <Route path="/player/me/card" element={<MyPlayerCardRoute />} />
    <Route path="/player/me/career" element={<Pack02CareerPassportPage />} />
    <Route path="/player/me/career/season/:seasonId" element={<Pack02CareerSeasonPage />} />
    <Route path="*" element={<GenericShell title="찾을 수 없는 화면" />} />
  </Routes></RouteGuard>{!isPublic && !isStadiumBuilder && <BottomNavigation />}</div>;
}

export function AppShell({ initialPath, sessionAdapter }: { initialPath?: string; sessionAdapter?: SessionAdapter }) {
  const adapter = sessionAdapter ?? defaultSessionAdapter;
  if (initialPath) {
    return <SessionAdapterContext.Provider value={adapter}>
      <MemoryRouter initialEntries={[initialPath]}><AppRoutes /></MemoryRouter>
    </SessionAdapterContext.Provider>;
  }
  return <SessionAdapterContext.Provider value={adapter}>
    <BrowserRouter basename="/v2"><AppRoutes /></BrowserRouter>
  </SessionAdapterContext.Provider>;
}
