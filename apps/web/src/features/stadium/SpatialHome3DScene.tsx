import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { CoreFormation, CoreSpatialHome, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumTeamMarker, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

type Coordinate = Readonly<{ x: number; z: number }>;

interface SpatialHome3DSceneProps {
  readonly mode: CoreVisualMode;
  readonly spatial: CoreSpatialHome;
  readonly formation: CoreFormation;
}

function ownCoordinate(position: string): Coordinate {
  const normalized = position.trim().toUpperCase();
  if (position.includes("골키퍼")) return { x: -45, z: 0 };
  if (position.includes("수비형 미드필더")) return { x: -14, z: 0 };
  if (position.includes("중앙 미드필더")) return { x: 0, z: 0 };
  if (position.includes("공격형 미드필더")) return { x: 16, z: 0 };
  if (position.includes("스트라이커") || position.includes("공격수")) return { x: 38, z: 0 };
  if (position.includes("센터백") || position.includes("중앙 수비수")) return { x: -30, z: 0 };
  switch (normalized) {
    case "GK": return { x: -45, z: 0 };
    case "LB": return { x: -28, z: -23 };
    case "RB": return { x: -28, z: 23 };
    case "CB": return { x: -30, z: 0 };
    case "CDM":
    case "DM": return { x: -14, z: 0 };
    case "CM": return { x: 0, z: 0 };
    case "CAM":
    case "AM": return { x: 16, z: 0 };
    case "LW": return { x: 24, z: -25 };
    case "RW": return { x: 24, z: 25 };
    case "CF": return { x: 31, z: 0 };
    case "ST": return { x: 38, z: 0 };
    default: return { x: 0, z: 0 };
  }
}

function teammateCoordinate(xPercent: number, yPercent: number): Coordinate {
  const x = ((Math.min(100, Math.max(0, xPercent)) - 50) / 50) * 47;
  const z = ((Math.min(100, Math.max(0, yPercent)) - 50) / 50) * 29;
  return { x, z };
}

function anchorClass(kind: CoreSpatialHome["anchors"][number]["kind"]): string {
  return `spatial-home-anchor spatial-home-anchor-${kind.toLowerCase()}`;
}

export function SpatialHome3DScene({ mode, spatial, formation }: SpatialHome3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [scoreboardLive, setScoreboardLive] = useState(false);

  const own = useMemo(() => ownCoordinate(formation.player.primaryPosition), [formation.player.primaryPosition]);
  const teammateMarkers = useMemo<readonly StadiumTeamMarker[]>(() => formation.teammates.map((teammate) => {
    const coordinate = teammateCoordinate(teammate.x, teammate.y);
    return {
      ...coordinate,
      shirtNumber: teammate.shirtNumber,
      position: teammate.position,
    };
  }), [formation.teammates]);

  useEffect(() => {
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    setScoreboardLive(false);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;

    if (!canvas || effectiveMode === "STATIC") {
      setRenderState("FALLBACK");
      return;
    }

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, effectiveMode);
    } catch {
      renderer = null;
    }

    if (!renderer || !renderer.renderTeamFormation) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderSpatialHome = renderer.renderTeamFormation.bind(renderer);
    renderer.updateScoreboard?.({
      headline: spatial.scoreboardLabel,
      formation: formation.shapeLabel,
      training: spatial.nextTraining.label,
      match: spatial.nextMatch.label,
    });
    setScoreboardLive(Boolean(renderer.updateScoreboard));
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderSpatialHome(1, own.x, own.z, teammateMarkers);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current?.destroy();
      rendererRef.current = null;
      setRenderState("INITIALIZING");
      setEffectiveMode((current) => nextStadiumMode(current));
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode, formation.shapeLabel, own.x, own.z, spatial.nextMatch.label, spatial.nextTraining.label, spatial.scoreboardLabel, teammateMarkers]);

  return (
    <section
      className="spatial-home-3d-surface"
      aria-label="3D 나의 팀 공간"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-spatial-anchor-count={spatial.anchors.length}
      data-formation-teammate-count={formation.teammates.length}
      data-live-scoreboard={scoreboardLive ? "true" : "false"}
      data-scoreboard-label={spatial.scoreboardLabel}
    >
      <canvas ref={canvasRef} className={`spatial-home-3d-canvas ${renderState === "READY" ? "spatial-home-3d-ready" : ""}`} />
      {renderState === "FALLBACK" && <div className="spatial-home-static-field" aria-hidden="true" />}

      <div className="spatial-home-scoreboard" aria-label="현재 팀 상태">
        <span>TEAM STATE</span>
        <strong>{spatial.scoreboardLabel}</strong>
        <small>{spatial.nextTraining.label}</small>
        <small>{spatial.nextMatch.label}</small>
      </div>

      <nav className="spatial-home-anchor-layer" aria-label="나의 팀 공간 바로가기">
        {spatial.anchors.map((anchor) => (
          <Link
            className={anchorClass(anchor.kind)}
            data-testid="spatial-anchor"
            data-spatial-kind={anchor.kind}
            key={anchor.id}
            to={anchor.destination}
          >
            <span>{anchor.kind}</span>
            <strong>{anchor.title}</strong>
            <small>{anchor.detail}</small>
          </Link>
        ))}
      </nav>

      <div className="spatial-home-mode-chip" aria-label={`3D 렌더 모드 ${effectiveMode}`}>
        {renderState === "READY" ? `${effectiveMode} · LIVE 3D` : `${effectiveMode} · FALLBACK`}
      </div>
    </section>
  );
}
