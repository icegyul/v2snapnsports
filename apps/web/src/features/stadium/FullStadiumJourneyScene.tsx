import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { CoreFormation, CoreSpatialHome, CoreStadiumHome, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumTeamMarker, type StadiumWebglRenderer } from "../../three/stadiumWebgl";
import { playStadiumAudioCue, type StadiumAudioCue } from "./stadiumAudioDirector";

interface FullStadiumJourneySceneProps {
  readonly mode: CoreVisualMode;
  readonly home: CoreStadiumHome;
  readonly formation: CoreFormation;
  readonly spatial: CoreSpatialHome;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";
type JourneyStage = "APPROACH" | "PITCH" | "PROJECTION" | "POSITION" | "FORMATION" | "SPATIAL_HOME";
type Coordinate = Readonly<{ x: number; z: number }>;

const APPROACH_END = 0.24;
const PITCH_END = 0.42;
const PROJECTION_FORWARD_END = 0.59;
const PROJECTION_END = 0.66;
const POSITION_END = 0.82;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothLocal(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function ownCoordinate(position: string): Coordinate {
  const normalized = position.trim().toUpperCase();
  if (position.includes("골키퍼")) return { x: -45, z: 0 };
  if (position.includes("왼쪽 풀백")) return { x: -28, z: -23 };
  if (position.includes("오른쪽 풀백")) return { x: -28, z: 23 };
  if (position.includes("수비형 미드필더")) return { x: -14, z: 0 };
  if (position.includes("중앙 미드필더")) return { x: 0, z: 0 };
  if (position.includes("공격형 미드필더")) return { x: 16, z: 0 };
  if (position.includes("왼쪽 윙")) return { x: 24, z: -25 };
  if (position.includes("오른쪽 윙")) return { x: 24, z: 25 };
  if (position.includes("스트라이커") || position.includes("공격수")) return { x: 38, z: 0 };
  if (position.includes("센터백") || position.includes("중앙 수비수")) return { x: -30, z: 0 };
  switch (normalized) {
    case "GK": return { x: -45, z: 0 };
    case "LB": return { x: -28, z: -23 };
    case "LCB": return { x: -30, z: -10 };
    case "CB": return { x: -30, z: 0 };
    case "RCB": return { x: -30, z: 10 };
    case "RB": return { x: -28, z: 23 };
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
  return {
    x: ((Math.min(100, Math.max(0, xPercent)) - 50) / 50) * 47,
    z: ((Math.min(100, Math.max(0, yPercent)) - 50) / 50) * 29,
  };
}

function stageForProgress(progress: number): JourneyStage {
  if (progress < APPROACH_END) return "APPROACH";
  if (progress < PITCH_END) return "PITCH";
  if (progress < PROJECTION_END) return "PROJECTION";
  if (progress < POSITION_END) return "POSITION";
  if (progress < 0.999) return "FORMATION";
  return "SPATIAL_HOME";
}

function cueForStage(stage: JourneyStage): StadiumAudioCue {
  switch (stage) {
    case "APPROACH": return "APPROACH";
    case "PITCH": return "PITCH";
    case "PROJECTION": return "PROJECTION";
    case "POSITION": return "POSITION";
    case "FORMATION": return "FORMATION";
    case "SPATIAL_HOME": return "SPATIAL_HOME";
  }
}

function stageLabel(stage: JourneyStage): string {
  switch (stage) {
    case "APPROACH": return "경기장 접근";
    case "PITCH": return "피치 진입";
    case "PROJECTION": return "디지털 프로젝션";
    case "POSITION": return "나의 포지션";
    case "FORMATION": return "팀 포메이션";
    case "SPATIAL_HOME": return "Spatial Home";
  }
}

export function FullStadiumJourneyScene({ mode, home, formation, spatial }: FullStadiumJourneySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(mode === "STATIC" ? 1 : 0);
  const renderProgressRef = useRef<((progress: number) => void) | null>(null);
  const previousAudioStageRef = useRef<JourneyStage | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);
  const [stage, setStage] = useState<JourneyStage>(mode === "STATIC" ? "SPATIAL_HOME" : "APPROACH");
  const [scoreboardLive, setScoreboardLive] = useState(false);

  const own = useMemo(() => ownCoordinate(formation.player.primaryPosition), [formation.player.primaryPosition]);
  const teammates = useMemo<readonly StadiumTeamMarker[]>(() => formation.teammates.map((teammate) => ({
    ...teammateCoordinate(teammate.x, teammate.y),
    shirtNumber: teammate.shirtNumber,
    position: teammate.position,
  })), [formation.teammates]);

  useEffect(() => {
    if (previousAudioStageRef.current === stage) return;
    previousAudioStageRef.current = stage;
    playStadiumAudioCue(cueForStage(stage));
  }, [stage]);

  useEffect(() => {
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    progressRef.current = mode === "STATIC" ? 1 : 0;
    setProgress(progressRef.current);
    setStage(mode === "STATIC" ? "SPATIAL_HOME" : "APPROACH");
    setScoreboardLive(false);
    previousAudioStageRef.current = null;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    renderProgressRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!canvas || effectiveMode === "STATIC") {
      setRenderState("FALLBACK");
      progressRef.current = 1;
      setProgress(1);
      setStage("SPATIAL_HOME");
      return;
    }

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, effectiveMode);
    } catch {
      renderer = null;
    }

    const supportsFullJourney = Boolean(
      renderer?.renderApproach
      && renderer.renderPitchEntry
      && renderer.renderDigitalProjection
      && renderer.renderPlayerPosition
      && renderer.renderTeamFormation,
    );
    if (!renderer || !supportsFullJourney) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderApproach = renderer.renderApproach!.bind(renderer);
    const renderPitchEntry = renderer.renderPitchEntry!.bind(renderer);
    const renderDigitalProjection = renderer.renderDigitalProjection!.bind(renderer);
    const renderPlayerPosition = renderer.renderPlayerPosition!.bind(renderer);
    const renderTeamFormation = renderer.renderTeamFormation!.bind(renderer);

    renderer.updateScoreboard?.({
      headline: spatial.scoreboardLabel,
      formation: formation.shapeLabel,
      training: spatial.nextTraining.label,
      match: spatial.nextMatch.label,
    });
    setScoreboardLive(Boolean(renderer.updateScoreboard));
    rendererRef.current = renderer;
    setRenderState("READY");

    const renderProgress = (progress0: number) => {
      const next = clamp01(progress0);
      const nextStage = stageForProgress(next);
      if (next < APPROACH_END) {
        renderApproach(smoothLocal(next / APPROACH_END));
      } else if (next < PITCH_END) {
        renderPitchEntry(smoothLocal((next - APPROACH_END) / (PITCH_END - APPROACH_END)));
      } else if (next < PROJECTION_FORWARD_END) {
        renderDigitalProjection(smoothLocal((next - PITCH_END) / (PROJECTION_FORWARD_END - PITCH_END)));
      } else if (next < PROJECTION_END) {
        const reverse = 1 - smoothLocal((next - PROJECTION_FORWARD_END) / (PROJECTION_END - PROJECTION_FORWARD_END));
        renderDigitalProjection(reverse);
      } else if (next < POSITION_END) {
        renderPlayerPosition(smoothLocal((next - PROJECTION_END) / (POSITION_END - PROJECTION_END)), own.x, own.z);
      } else {
        renderTeamFormation(smoothLocal((next - POSITION_END) / (1 - POSITION_END)), own.x, own.z, teammates);
      }
      progressRef.current = next;
      setStage(nextStage);
    };
    renderProgressRef.current = renderProgress;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderProgress(progressRef.current);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      rendererRef.current?.destroy();
      rendererRef.current = null;
      renderProgressRef.current = null;
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

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reducedMotion) {
      renderProgress(1);
      setProgress(1);
    } else {
      const durationMs = 6200;
      const maxFrameDeltaMs = 120;
      const targetFrameDelayMs = 30;
      let elapsedMs = 0;
      let previousFrameAt = performance.now();
      let lastPublished = -1;
      const tick = () => {
        const now = performance.now();
        const rawDelta = now - previousFrameAt;
        previousFrameAt = now;
        elapsedMs += Math.min(maxFrameDeltaMs, Math.max(0, rawDelta));
        const nextProgress = clamp01(elapsedMs / durationMs);
        renderProgress(nextProgress);
        if (nextProgress === 1 || nextProgress - lastPublished >= 0.025) {
          lastPublished = nextProgress;
          setProgress(nextProgress);
        }
        if (nextProgress < 1) {
          timerRef.current = window.setTimeout(tick, targetFrameDelayMs);
        } else {
          timerRef.current = null;
        }
      };
      timerRef.current = window.setTimeout(tick, targetFrameDelayMs);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      renderProgressRef.current = null;
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode, formation.shapeLabel, own.x, own.z, spatial.nextMatch.label, spatial.nextTraining.label, spatial.scoreboardLabel, teammates]);

  const finishImmediately = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progressRef.current = 1;
    renderProgressRef.current?.(1);
    setProgress(1);
    setStage("SPATIAL_HOME");
  };

  const spatialReady = progress >= 0.985 || effectiveMode === "STATIC";

  return (
    <section
      className={`full-journey-surface ${spatialReady ? "full-journey-spatial-ready" : ""}`}
      aria-label="연속 3D 경기장 입장"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-journey-stage={stage}
      data-journey-progress={progress.toFixed(3)}
      data-journey-complete={spatialReady ? "true" : "false"}
      data-live-scoreboard={scoreboardLive ? "true" : "false"}
      data-spatial-anchor-count={spatial.anchors.length}
      data-formation-teammate-count={formation.teammates.length}
    >
      <canvas ref={canvasRef} className={`full-journey-canvas ${renderState === "READY" ? "full-journey-canvas-ready" : ""}`} />
      {renderState === "FALLBACK" && <div className="full-journey-static-field" aria-hidden="true" />}

      <div className="full-journey-team-state" aria-label="현재 팀 상태">
        <span>{formation.shapeLabel} · #{formation.player.shirtNumber} {formation.player.primaryPosition}</span>
        <strong>{spatial.scoreboardLabel}</strong>
      </div>

      {!spatialReady && (
        <button className="full-journey-skip" type="button" onClick={finishImmediately}>
          빠른 입장
        </button>
      )}

      <nav className="full-journey-anchor-layer" aria-label="Spatial Home 바로가기">
        {spatial.anchors.map((anchor) => (
          <Link
            className={`full-journey-anchor full-journey-anchor-${anchor.kind.toLowerCase()}`}
            data-testid="full-journey-anchor"
            data-spatial-kind={anchor.kind}
            key={anchor.id}
            tabIndex={spatialReady ? 0 : -1}
            aria-hidden={spatialReady ? undefined : true}
            to={anchor.destination}
          >
            <span>{anchor.kind}</span>
            <strong>{anchor.title}</strong>
            <small>{anchor.detail}</small>
          </Link>
        ))}
      </nav>

      <div className="full-journey-hud" aria-live="polite">
        <div>
          <span>FULL ENTRY</span>
          <strong>{stageLabel(stage)}</strong>
        </div>
        <div className="full-journey-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </section>
  );
}
