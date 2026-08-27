import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { FixtureLegacyAdapter } from "../adapters/legacyAdapters";
import { mapFormationSlots } from "../features/formation/formation";
import { selectHomeState } from "../features/home/homeState";
import { playerNavigation } from "../routes/routePolicy";
import { resolveRenderMode } from "../three/renderMode";
import { RouteStatePanel } from "../components/RouteStatePanel";

function BottomNavigation() {
  const location = useLocation();
  return <nav className="bottom-navigation" aria-label="플레이어 기본 탐색">{playerNavigation.map((item) => <Link key={item.to} className={location.pathname === item.to ? "nav-active" : ""} to={item.to}>{item.label}</Link>)}</nav>;
}

function Home() {
  const adapter = new FixtureLegacyAdapter();
  const schedule = [
    { id: "fixture-training-01", kind: "TRAINING" as const, startsAt: "2026-08-28T18:00:00+09:00" },
    { id: "fixture-match-01", kind: "MATCH" as const, startsAt: "2026-08-29T15:00:00+09:00" }
  ];
  const primary = selectHomeState(schedule);
  const mode = resolveRenderMode({ requested: "FULL", assetsReady: false, production: true, webgl: true, reducedMotion: false });
  void adapter;
  return <main className="shell-main">
    <p className="eyebrow">MY FOOTBALL WORLD · FOUNDATION</p>
    <h1>Fixture Player 08</h1>
    <section className="stadium-surface" aria-label="Static stadium fallback">
      <div className="stadium-axis" />
      <div className="pitch-outline"><span>STATIC · {mode}</span></div>
    </section>
    <section className="surface-card"><span className="meta">PRIMARY ACTION</span><strong>{primary?.kind === "MATCH" ? "다음 경기 준비" : "다음 훈련 준비"}</strong></section>
    <Link className="surface-link" to="/stadium">Stadium Experience 구조 보기</Link>
    <Link className="surface-link" to="/player/me">My Player · Career</Link>
  </main>;
}

function Stadium() {
  const slots = mapFormationSlots("4-3-3", "fixture-player");
  return <main className="shell-main"><p className="eyebrow">STADIUM EXPERIENCE STATE</p><h1>Spatial foundation</h1><section className="surface-card"><strong>EXTERIOR → APPROACH → PITCH ENTRY → MY POSITION → TEAM REVEAL → SPATIAL HOME</strong><span className="meta">Final visual assets are intentionally not rendered in F0.</span></section><section className="formation-grid" aria-label="Fixture 4-3-3 formation">{slots.map((slot) => <span key={slot.id} className={slot.isMe ? "formation-slot formation-me" : "formation-slot"}>{slot.role}</span>)}</section></main>;
}

function CommunityBoundary() { return <main className="shell-main"><p className="eyebrow">COMMUNITY CONTRACT</p><RouteStatePanel state="FORBIDDEN" /><p className="meta">F0 keeps Legacy Community write ownership. Feed Intelligence remains off.</p></main>; }
function GenericShell({ title }: { title: string }) { return <main className="shell-main"><p className="eyebrow">FOUNDATION ROUTE</p><h1>{title}</h1><RouteStatePanel state="EMPTY" /></main>; }

function ShellRoutes() {
  return <div className="app-shell"><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    <Route path="/login" element={<GenericShell title="Login shell" />} />
    <Route path="/training" element={<GenericShell title="Training foundation" />} />
    <Route path="/community" element={<CommunityBoundary />} />
    <Route path="/video" element={<GenericShell title="Video boundary" />} />
    <Route path="/more" element={<GenericShell title="More" />} />
    <Route path="/player/me" element={<GenericShell title="My Player · Career" />} />
    <Route path="/stadium" element={<Stadium />} />
    <Route path="*" element={<GenericShell title="Not found" />} />
  </Routes><BottomNavigation /></div>;
}

export function AppShell({ initialPath = "/home" }: { initialPath?: string }) {
  return <MemoryRouter initialEntries={[initialPath]}><ShellRoutes /></MemoryRouter>;
}
