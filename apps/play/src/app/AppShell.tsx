import { BrowserRouter, Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { CommunityComposerPage, CommunityDetailPage, CommunityFeedPage } from "../features/community/CommunityPages";
import { TacticsPage } from "../features/tactics/TacticsPage";

const NAV_ITEMS = [
  { to: "/", label: "홈" },
  { to: "/community", label: "커뮤니티" },
  { to: "/tactics", label: "전술" },
] as const;

function BottomNavigation() {
  const location = useLocation();
  return (
    <nav className="bottom-navigation" aria-label="기본 탐색">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          className={location.pathname === item.to ? "nav-active" : ""}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function LandingPage() {
  return (
    <main className="shell-main">
      <section className="landing-hero">
        <p className="eyebrow">SNAPN SPORTS PLAY</p>
        <h1>커뮤니티에서 놀고, 전술판에서 팀을 짜보세요</h1>
        <p className="meta">본편 앱이 준비되는 동안 먼저 만나는 두 가지 기능입니다.</p>
      </section>
      <div className="landing-cta-grid">
        <Link className="landing-cta-card" to="/community">
          <strong>커뮤니티 입장</strong>
          <span>팀과 리그 소식을 나누고 글을 남겨보세요.</span>
        </Link>
        <Link className="landing-cta-card" to="/tactics">
          <strong>전술 보드 열기</strong>
          <span>포메이션을 고르고 내 팀을 배치해보세요.</span>
        </Link>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/community" element={<CommunityFeedPage />} />
        <Route path="/community/post/:postId" element={<CommunityDetailPage />} />
        <Route path="/community/compose" element={<CommunityComposerPage />} />
        <Route path="/tactics" element={<TacticsPage />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
}

export function AppShell({ initialPath }: { initialPath?: string } = {}) {
  if (initialPath) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <AppRoutes />
      </MemoryRouter>
    );
  }
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
