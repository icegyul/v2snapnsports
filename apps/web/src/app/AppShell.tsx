import { lazy, Suspense } from "react";
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

const StadiumBuilderPage = lazy(() => import("../features/stadium-builder/StadiumBuilderPage")
  .then((module) => ({ default: module.StadiumBuilderPage })));

const StadiumSelectPage = lazy(() => import("../features/stadium/StadiumSelectPage")
  .then((module) => ({ default: module.StadiumSelectPage })));

function StadiumSelectRoute() {
  return <Suspense fallback={<main className="shell-main" role="status" aria-label="경기장 선택 준비"><p>경기장 선택 화면을 준비하고 있습니다.</p></main>}>
    <StadiumSelectPage />
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
  return <main className="shell-main auth-main">
    <p className="eyebrow">SNAPN SPORTS</p>
    <h1>어떻게 시작할까요?</h1>
    <p className="meta">선택은 가입 선호도이며, 매니저 권한은 별도 검증이 필요합니다.</p>
    <div className="role-grid">
      <button className="role-card" type="button">선수로 시작</button>
      <button className="role-card" type="button">매니저로 시작</button>
    </div>
    <p className="guardian-note">보호자는 선수 초대 링크로 시작합니다.</p>
  </main>;
}

function GenericShell({ title }: { title: string }) { return <main className="shell-main"><p className="eyebrow">FOUNDATION ROUTE</p><h1>{title}</h1><RouteStatePanel state="EMPTY" /></main>; }

function AppRoutes() {
  const location = useLocation();
  const isPublic = location.pathname === "/login" || location.pathname === "/signup/role" || location.pathname.startsWith("/invite/guardian/");
  const isStadiumBuilder = location.pathname === "/home/builder" || location.pathname === "/home/stadium";
  return <div className="app-shell"><Routes>
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
    <Route path="/login" element={<GenericShell title="로그인" />} />
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
    <Route path="/player/me/career" element={<Pack02CareerPassportPage />} />
    <Route path="/player/me/career/season/:seasonId" element={<Pack02CareerSeasonPage />} />
    <Route path="*" element={<GenericShell title="찾을 수 없는 화면" />} />
  </Routes>{!isPublic && !isStadiumBuilder && <BottomNavigation />}</div>;
}

export function AppShell({ initialPath }: { initialPath?: string }) {
  if (initialPath) return <MemoryRouter initialEntries={[initialPath]}><AppRoutes /></MemoryRouter>;
  return <BrowserRouter basename="/v2"><AppRoutes /></BrowserRouter>;
}
