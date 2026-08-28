import { Link, MemoryRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteStatePanel } from "../components/RouteStatePanel";
import { MyPositionPage, MyTeamFormationPage, PitchEntryPage, SpatialHomePage, StadiumApproachPage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";
import { CareerPassportPage, CommunityPage, TrainingPage, VideoPage } from "../features/product/RemainingProductPages";
import { CommunityComposerPage, CommunityDetailPage } from "../features/community/CommunityInteractionPages";
import { CareerSeasonPage, TrainingDetailPage, VideoDetailPage } from "../features/product/ProductDetailPages";
import { playerNavigation } from "../routes/routePolicy";

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
  return <div className="app-shell"><Routes>
    <Route path="/" element={<Navigate replace to="/home" />} />
    <Route path="/home" element={<StadiumExteriorPage />} />
    <Route path="/home/approach" element={<StadiumApproachPage />} />
    <Route path="/home/enter" element={<PitchEntryPage />} />
    <Route path="/home/position" element={<MyPositionPage />} />
    <Route path="/home/formation" element={<MyTeamFormationPage />} />
    <Route path="/home/team" element={<SpatialHomePage />} />
    <Route path="/stadium" element={<Navigate replace to="/home" />} />
    <Route path="/signup/role" element={<RoleSelect />} />
    <Route path="/login" element={<GenericShell title="로그인" />} />
    <Route path="/invite/guardian/:inviteId" element={<GenericShell title="보호자 초대" />} />
    <Route path="/training" element={<TrainingPage />} />
    <Route path="/training/:eventId" element={<TrainingDetailPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/community/post/:postId" element={<CommunityDetailPage />} />
    <Route path="/community/compose" element={<CommunityComposerPage />} />
    <Route path="/video" element={<VideoPage />} />
    <Route path="/video/:videoId" element={<VideoDetailPage />} />
    <Route path="/more" element={<GenericShell title="더보기" />} />
    <Route path="/player/career" element={<Navigate replace to="/player/me/career" />} />
    <Route path="/player/me" element={<CareerPassportPage />} />
    <Route path="/player/me/career" element={<CareerPassportPage />} />
    <Route path="/player/me/career/season/:seasonId" element={<CareerSeasonPage />} />
    <Route path="*" element={<GenericShell title="찾을 수 없는 화면" />} />
  </Routes>{!isPublic && <BottomNavigation />}</div>;
}

export function AppShell({ initialPath = "/home" }: { initialPath?: string }) {
  return <MemoryRouter initialEntries={[initialPath]}><AppRoutes /></MemoryRouter>;
}
