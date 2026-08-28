import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CoreFormation, CoreSpatialHome } from "../../api/coreProductContracts";
import { FixtureCoreProductAdapter } from "../../adapters/fixtureCoreProductAdapter";
import { CoreStateBoundary } from "../../components/CoreStateBoundary";

const adapter = new FixtureCoreProductAdapter();
const loadStadiumHome = () => adapter.getStadiumHome();
const loadFormation = () => adapter.getFormation();
const loadSpatialHome = () => adapter.getSpatialHome();

function useFixture<T>(load: () => Promise<T>) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => { void load().then(setValue); }, [load]);
  return value;
}

function StaticScene({ label }: { label: string }) {
  return <section className="stadium-surface" aria-label={`${label} STATIC 2D 대체 보기`}><div className="stadium-axis" /><div className="pitch-outline"><span>STATIC · 2D</span></div></section>;
}

export function StadiumExteriorPage() {
  const home = useFixture(loadStadiumHome);
  return <CoreStateBoundary state={home ? "READY" : "LOADING"}><main className="shell-main"><p className="eyebrow">STADIUM EXTERIOR · DEVELOPMENT PREVIEW</p><h1>나의 경기장</h1><StaticScene label="나의 경기장" /><p className="meta">{home?.scoreboardLabel}</p><Link className="surface-link" to="/home/approach">경기장으로 들어가기</Link></main></CoreStateBoundary>;
}

export function StadiumApproachPage() { return <main className="shell-main"><p className="eyebrow">STADIUM EXPERIENCE · ZOOM</p><h1>경기장으로 다가가기</h1><StaticScene label="경기장 접근" /><Link className="surface-link" to="/home/enter">피치로 들어가기</Link></main>; }
export function PitchEntryPage() { return <main className="shell-main"><p className="eyebrow">STADIUM EXPERIENCE · PITCH ENTRY</p><h1>피치 진입</h1><StaticScene label="피치 진입" /><Link className="surface-link" to="/home/position">나의 포지션 보기</Link></main>; }

function FormationBoard({ formation, ownOnly = false }: { formation: CoreFormation; ownOnly?: boolean }) {
  return <section className="position-pitch" aria-label="팀 포메이션 2D 보기">
    {!ownOnly && formation.teammates.map((teammate) => <span key={teammate.id} className="teammate-marker" style={{ left: `${teammate.x}%`, top: `${teammate.y}%` }} aria-label={`동료 등번호 ${teammate.shirtNumber}, ${teammate.position}`}>{teammate.shirtNumber}<br />{teammate.position}</span>)}
    <span className="player-marker" aria-label={`나의 포지션 CM, 등번호 ${formation.player.shirtNumber}`}>{formation.player.shirtNumber}<br /><small>CM · 나</small></span>
  </section>;
}

export function MyPositionPage() {
  const formation = useFixture(loadFormation);
  return <CoreStateBoundary state={formation ? "READY" : "LOADING"}><main className="shell-main"><p className="eyebrow">MY POSITION</p><h1>나의 포지션</h1>{formation && <FormationBoard formation={formation} />}<p className="meta">본인 marker는 double ring과 라벨로 구분합니다. 동료는 등번호와 포지션만 표시합니다.</p><Link className="surface-link" to="/home/formation">나의 팀 포메이션</Link></main></CoreStateBoundary>;
}

export function MyTeamFormationPage() {
  const formation = useFixture(loadFormation);
  return <CoreStateBoundary state={formation ? "READY" : "LOADING"}><main className="shell-main"><p className="eyebrow">TEAM REVEAL · {formation?.shapeLabel ?? ""}</p><h1>나의 팀 포메이션</h1>{formation && <FormationBoard formation={formation} />}<Link className="surface-link" to="/home/team">나의 팀 공간으로</Link></main></CoreStateBoundary>;
}

export function SpatialHomePage() {
  const spatial = useFixture(loadSpatialHome);
  return <CoreStateBoundary state={spatial ? "READY" : "LOADING"}><SpatialHomeContent spatial={spatial} /></CoreStateBoundary>;
}

function SpatialHomeContent({ spatial }: { spatial: CoreSpatialHome | null }) {
  if (!spatial) return null;
  return <main className="shell-main"><p className="eyebrow">SPATIAL HOME · DEVELOPMENT PREVIEW</p><h1>나의 팀 공간</h1><p className="meta">{spatial.team.displayName} · {spatial.scoreboardLabel}</p><section className="spatial-map" aria-label="나의 팀 공간 바로가기">{spatial.anchors.map((anchor) => <Link className="spatial-anchor" data-testid="spatial-anchor" key={anchor.id} to={anchor.destination}><strong>{anchor.title}</strong><span>{anchor.detail}</span></Link>)}</section><section className="team-state-line"><span>{spatial.nextTraining.label}</span><span>{spatial.nextMatch.label}</span></section></main>;
}
