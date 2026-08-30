import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CoreFormation, CoreSpatialHome, CoreStadiumHome } from "../../api/coreProductContracts";
import { FixtureCoreProductAdapter } from "../../adapters/fixtureCoreProductAdapter";
import { CoreStateBoundary } from "../../components/CoreStateBoundary";
import { Stadium3DScene } from "./Stadium3DScene";
import { StadiumApproachScene } from "./StadiumApproachScene";
import { PitchEntryScene } from "./PitchEntryScene";
import { PlayerPosition3DScene } from "./PlayerPosition3DScene";
import "./stadium.css";
import "./stadiumApproach.css";
import "./pitchEntry.css";
import "./playerPosition3D.css";

const adapter = new FixtureCoreProductAdapter();
const loadStadiumHome = () => adapter.getStadiumHome();
const loadFormation = () => adapter.getFormation();
const loadSpatialHome = () => adapter.getSpatialHome();

function useFixture<T>(load: () => Promise<T>) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => { void load().then(setValue); }, [load]);
  return value;
}

function StadiumExteriorContent({ home }: { home: CoreStadiumHome }) {
  const navigate = useNavigate();
  const schedule = home.nextMatch.availability === "AVAILABLE"
    ? home.nextMatch
    : home.nextTraining.availability === "AVAILABLE"
      ? home.nextTraining
      : null;

  return <main className="shell-main stadium-home-page">
    <header className="stadium-home-header">
      <div>
        <p className="stadium-home-kicker">SNAPN SPORTS · 선수 공간</p>
        <h1>나의 경기장</h1>
        <p className="stadium-home-team">{home.team.displayName}</p>
      </div>
      {home.source === "SYNTHETIC_FIXTURE" && <span className="stadium-demo-badge">데모 데이터</span>}
    </header>

    <section className="stadium-hero" aria-label="나의 경기장 3D 보기">
      <div className="stadium-state-layer" aria-label="팀 상태">
        <span className="stadium-state-label">팀 상태</span>
        <strong>{schedule?.label ?? "오늘 예정된 일정이 없습니다"}</strong>
        <span>{home.scoreboardLabel}</span>
      </div>

      <Stadium3DScene mode={home.visualMode} onEnter={() => navigate("/home/approach")} />

      <div className="stadium-identity-indicator">
        <span className="stadium-identity-number" aria-hidden="true">{home.player.shirtNumber}</span>
        <span>나의 공간 · #{home.player.shirtNumber} {home.player.primaryPosition}</span>
      </div>

      <div className="stadium-enter-cue" aria-hidden="true">
        <span className="stadium-enter-arrow">↑</span>
        <span>경기장을 눌러 입장하세요</span>
      </div>
    </section>

    <footer className="stadium-home-footer">
      <p>좌우로 둘러보고 두 손가락으로 확대할 수 있습니다. 위로 밀어도 입장합니다.</p>
      <Link className="surface-link stadium-enter-link" to="/home/approach">경기장으로 들어가기</Link>
    </footer>
  </main>;
}

export function StadiumExteriorPage() {
  const home = useFixture(loadStadiumHome);
  return <CoreStateBoundary state={home ? "READY" : "LOADING"}>{home ? <StadiumExteriorContent home={home} /> : null}</CoreStateBoundary>;
}

export function StadiumApproachPage() {
  const home = useFixture(loadStadiumHome);
  const [complete, setComplete] = useState(false);
  return <CoreStateBoundary state={home ? "READY" : "LOADING"}>{home ? <main className="shell-main stadium-approach-page">
    <header className="stadium-approach-header">
      <div>
        <p className="eyebrow">STADIUM EXPERIENCE · APPROACH</p>
        <h1>경기장으로 다가가기</h1>
      </div>
      <p className="stadium-approach-meta">{home.team.displayName} · 외곽에서 지붕 상부를 지나 실제 3D bowl 내부로 접근합니다.</p>
    </header>
    <StadiumApproachScene mode={home.visualMode} onComplete={() => setComplete(true)} />
    <footer className="stadium-approach-footer">
      <p>{complete ? "3D 카메라가 경기장 내부에 도착했습니다." : "외부 시점에서 경기장 내부로 이동 중입니다."}</p>
      <Link className="surface-link stadium-approach-enter-link" to="/home/enter">피치로 들어가기</Link>
    </footer>
  </main> : null}</CoreStateBoundary>;
}
export function PitchEntryPage() {
  const home = useFixture(loadStadiumHome);
  const [complete, setComplete] = useState(false);
  return <CoreStateBoundary state={home ? "READY" : "LOADING"}>{home ? <main className="shell-main pitch-entry-page">
    <header className="pitch-entry-header">
      <div>
        <p className="eyebrow">STADIUM EXPERIENCE · PITCH ENTRY</p>
        <h1>피치 진입</h1>
      </div>
      <p className="pitch-entry-meta">{home.team.displayName} · 상단 bowl 시점에서 터치라인을 지나 실제 피치 레벨까지 내려갑니다.</p>
    </header>
    <PitchEntryScene mode={home.visualMode} onComplete={() => setComplete(true)} />
    <footer className="pitch-entry-footer">
      <p>{complete ? "3D 카메라가 피치 레벨에 도착했습니다." : "경기장 내부에서 피치로 내려가는 중입니다."}</p>
      <Link className="surface-link" to="/home/position">나의 포지션 보기</Link>
    </footer>
  </main> : null}</CoreStateBoundary>;
}

function FormationBoard({ formation, ownOnly = false }: { formation: CoreFormation; ownOnly?: boolean }) {
  return <section className="position-pitch" aria-label="팀 포메이션 2D 보기">
    {!ownOnly && formation.teammates.map((teammate) => <span key={teammate.id} className="teammate-marker" style={{ left: `${teammate.x}%`, top: `${teammate.y}%` }} aria-label={`동료 등번호 ${teammate.shirtNumber}, ${teammate.position}`}>{teammate.shirtNumber}<br />{teammate.position}</span>)}
    <span className="player-marker" aria-label={`나의 포지션 CM, 등번호 ${formation.player.shirtNumber}`}>{formation.player.shirtNumber}<br /><small>CM · 나</small></span>
  </section>;
}

export function MyPositionPage() {
  const formation = useFixture(loadFormation);
  const home = useFixture(loadStadiumHome);
  const [complete, setComplete] = useState(false);
  const ready = Boolean(formation && home);
  return <CoreStateBoundary state={ready ? "READY" : "LOADING"}>{formation && home ? <main className="shell-main player-position-page">
    <header className="player-position-header">
      <div>
        <p className="eyebrow">MY POSITION · 3D REVEAL</p>
        <h1>나의 포지션</h1>
      </div>
      <p className="player-position-meta">{home.team.displayName} · 피치 레벨에서 #{formation.player.shirtNumber} {formation.player.primaryPosition}의 실제 공간 위치를 표시합니다.</p>
    </header>
    <PlayerPosition3DScene mode={home.visualMode} player={formation.player} onComplete={() => setComplete(true)} />
    <footer className="player-position-footer">
      <p>{complete ? `#${formation.player.shirtNumber} ${formation.player.primaryPosition} 위치 확인 완료` : "피치 위에서 나의 위치를 찾는 중입니다."}</p>
      <Link className="surface-link" to="/home/formation">나의 팀 포메이션</Link>
    </footer>
  </main> : null}</CoreStateBoundary>;
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
