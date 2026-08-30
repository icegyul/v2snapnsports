import { Link, MemoryRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteStatePanel } from "../components/RouteStatePanel";
import { DigitalProjectionPage, MyPositionPage, MyTeamFormationPage, PitchEntryPage, SpatialHomePage, StadiumApproachPage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";
import { StadiumAudioDock } from "../features/stadium/StadiumAudioDock";
import { CommunityPage, VideoPage } from "../features/product/RemainingProductPages";
import { Pack02CareerPassportPage, Pack02CareerSeasonPage, Pack02OpportunityPage, Pack02PortfolioPage, Pack02TeamCommunicationPage } from "../features/pack02/Pack02Pages";
import { AgentWorkspacePage, AnalystWorkspacePage, ClubDirectorWorkspacePage, CoachWorkspacePage, ManagerHomePage, RefereeWorkspacePage, TeamManagerWorkspacePage } from "../features/pack03/ManagerWorkspacePages";
import { AdminOverviewPage, AuditAdminPage, EarthusHealthAdminPage, JobsMediaAdminPage, MigrationAdminPage, ModerationAdminPage, PrivacyAdminPage, RoleVerificationAdminPage, SafeguardingAdminPage } from "../features/pack04/AdminOpsPages";
import { CommunityComposerPage, CommunityDetailPage } from "../features/community/CommunityInteractionPages";
import { VideoDetailPage } from "../features/product/ProductDetailPages";
import { playerNavigation } from "../routes/routePolicy";
import { Pack01MatchCenterPage, Pack01MatchPage, Pack01PlaybackPage, Pack01TacticPage, Pack01TrainingDetailPage, Pack01TrainingPage } from "../features/pack01/Pack01Pages";

function BottomNavigation() {
  const location = useLocation();
  return <nav className="bottom-navigation" aria-label="플레이어 기본 탐색">
    {playerNavigation.map((item) => <Link key={item.to} className={location.pathname === item.to ? "nav-active" : ""} to={item.to}>{item.label}</Link>)}
  </nav>;
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
  const isStadiumExperience = !isPublic && (location.pathname === "/home" || location.pathname.startsWith("/home/"));
  return <div className="app-shell"><Routes>
    <Route path="/" element={<Navigate replace to="/home" />} />
    <Route path="/home" element={<StadiumExteriorPage />} />
    <Route path="/home/approach" element={<StadiumApproachPage />} />
    <Route path="/home/enter" element={<PitchEntryPage />} />
    <Route path="/home/projection" element={<DigitalProjectionPage />} />
    <Route path="/home/position" element={<MyPositionPage />} />
    <Route path="/home/formation" element={<MyTeamFormationPage />} />
    <Route path="/home/team" element={<SpatialHomePage />} />
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
  </Routes>{isStadiumExperience && <StadiumAudioDock />}{!isPublic && <BottomNavigation />}</div>;
}

export function AppShell({ initialPath = "/home" }: { initialPath?: string }) {
  return <MemoryRouter initialEntries={[initialPath]}><AppRoutes /></MemoryRouter>;
}
