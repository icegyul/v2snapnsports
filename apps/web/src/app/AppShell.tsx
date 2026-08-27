import { Link, MemoryRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteStatePanel } from "../components/RouteStatePanel";
import { playerNavigation } from "../routes/routePolicy";
import { resolveRenderMode } from "../three/renderMode";

function BottomNavigation() {
  const location = useLocation();
  return <nav className="bottom-navigation" aria-label="플레이어 기본 탐색">
    {playerNavigation.map((item) => <Link key={item.to} className={location.pathname === item.to ? "nav-active" : ""} to={item.to}>{item.label}</Link>)}
  </nav>;
}

function StadiumSurface({ label }: { label: string }) {
  const mode = resolveRenderMode({ requested: "FULL", assetsReady: false, production: true, webgl: true, reducedMotion: false });
  return <section className="stadium-surface" aria-label={`${label} ${mode} 2D 대체 보기`}>
    <div className="stadium-axis" />
    <div className="pitch-outline"><span>{mode} · 2D</span></div>
  </section>;
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

function Home() {
  return <main className="shell-main">
    <p className="eyebrow">MY FOOTBALL WORLD · DEVELOPMENT PREVIEW</p>
    <h1>나의 경기장</h1>
    <p className="meta">실제 운영 데이터는 연결하지 않았습니다.</p>
    <StadiumSurface label="나의 경기장" />
    <section className="surface-card"><span className="meta">다음 일정</span><strong>연결된 일정이 없습니다</strong><span>데이터가 연결되면 훈련 또는 경기 정보가 표시됩니다.</span></section>
    <Link className="surface-link" to="/home/enter">피치로 들어가기</Link>
    <Link className="surface-link" to="/player/career">커리어 패스포트</Link>
  </main>;
}

function PitchEntry() {
  return <main className="shell-main">
    <p className="eyebrow">STADIUM EXPERIENCE · ENTRY</p>
    <h1>피치 진입</h1>
    <StadiumSurface label="피치 진입" />
    <p className="meta">3D 자산이 준비되기 전까지 접근 가능한 2D 안내를 사용합니다.</p>
    <Link className="surface-link" to="/home/position">나의 포지션 보기</Link>
  </main>;
}

function MyPosition() {
  return <main className="shell-main">
    <p className="eyebrow">STADIUM EXPERIENCE · POSITION</p>
    <h1>나의 포지션</h1>
    <section className="position-pitch" aria-label="팀 포메이션 2D 보기">
      <span className="teammate-marker teammate-left" aria-label="동료 등번호 4, DF">4<br />DF</span>
      <span className="teammate-marker teammate-right" aria-label="동료 등번호 11, FW">11<br />FW</span>
      <span className="player-marker" aria-label="나의 포지션 CM, 등번호 8">8<br /><small>CM · 나</small></span>
    </section>
    <p className="meta">동료는 등번호와 포지션만 표시합니다.</p>
    <Link className="surface-link" to="/home/team">나의 팀 공간</Link>
  </main>;
}

const spatialAnchors = ["나", "훈련", "팀", "커리어", "영상"] as const;
function SpatialHome() {
  return <main className="shell-main">
    <p className="eyebrow">SPATIAL HOME · DEVELOPMENT PREVIEW</p>
    <h1>나의 팀 공간</h1>
    <section className="anchor-grid" aria-label="나의 팀 공간 바로가기">
      {spatialAnchors.map((anchor) => <span className="spatial-anchor" key={anchor}>{anchor}</span>)}
    </section>
    <p className="meta">팀 데이터와 미디어는 아직 연결되지 않았습니다.</p>
    <Link className="surface-link" to="/player/career">커리어 패스포트</Link>
  </main>;
}

function CommunityBoundary() {
  return <main className="shell-main"><p className="eyebrow">COMMUNITY BOUNDARY</p><h1>커뮤니티</h1><RouteStatePanel state="FORBIDDEN" /><p className="meta">F0에서는 Legacy Community 쓰기 소유권을 유지합니다.</p></main>;
}
function GenericShell({ title }: { title: string }) { return <main className="shell-main"><p className="eyebrow">FOUNDATION ROUTE</p><h1>{title}</h1><RouteStatePanel state="EMPTY" /></main>; }

function AppRoutes() {
  const location = useLocation();
  const isPublic = location.pathname === "/login" || location.pathname === "/signup/role" || location.pathname.startsWith("/invite/guardian/");
  return <div className="app-shell"><Routes>
    <Route path="/" element={<Navigate replace to="/home" />} />
    <Route path="/home" element={<Home />} />
    <Route path="/home/enter" element={<PitchEntry />} />
    <Route path="/home/position" element={<MyPosition />} />
    <Route path="/home/team" element={<SpatialHome />} />
    <Route path="/stadium" element={<Navigate replace to="/home" />} />
    <Route path="/signup/role" element={<RoleSelect />} />
    <Route path="/login" element={<GenericShell title="로그인" />} />
    <Route path="/invite/guardian/:inviteId" element={<GenericShell title="보호자 초대" />} />
    <Route path="/training" element={<GenericShell title="훈련" />} />
    <Route path="/community" element={<CommunityBoundary />} />
    <Route path="/video" element={<GenericShell title="영상" />} />
    <Route path="/more" element={<GenericShell title="더보기" />} />
    <Route path="/player/career" element={<GenericShell title="커리어 패스포트" />} />
    <Route path="*" element={<GenericShell title="찾을 수 없는 화면" />} />
  </Routes>{!isPublic && <BottomNavigation />}</div>;
}

export function AppShell({ initialPath = "/home" }: { initialPath?: string }) {
  return <MemoryRouter initialEntries={[initialPath]}><AppRoutes /></MemoryRouter>;
}
