import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { CoreFormation, CoreSpatialHome, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumTeamMarker, type StadiumWebglRenderer } from "../../three/stadiumWebgl";
import { playStadiumAudioCue, type StadiumAudioCue } from "./stadiumAudioDirector";
import { ownCoordinate, teammateCoordinate } from "./tacticalProjection";
import { TeamTacticsField } from "./TeamTacticsField";

interface FullStadiumJourneySceneProps {
  readonly mode: CoreVisualMode;
  readonly formation: CoreFormation;
  readonly spatial: CoreSpatialHome;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";
type JourneyStage = "APPROACH" | "PITCH" | "PROJECTION" | "POSITION" | "FORMATION" | "SPATIAL_HOME";
type EntryView = "TACTICS" | "CINEMATIC";

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

export function FullStadiumJourneyScene({ mode, formation, spatial }: FullStadiumJourneySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const renderProgressRef = useRef<((progress: number) => void) | null>(null);
  const previousAudioStageRef = useRef<JourneyStage | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  // P0-B: entry defaults to the tactical field for every mode. The cinematic
  // 6-stage journey stays available behind an explicit user action.
  const [view, setView] = useState<EntryView>("TACTICS");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<JourneyStage>("FORMATION");
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
    progressRef.current = 0;
    setProgress(0);
    setView("TACTICS");
    setStage("FORMATION");
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
      // P0-B: STATIC entry must land on the tactical field, not Spatial Home.
      setRenderState("FALLBACK");
      progressRef.current = 0;
      setProgress(0);
      setStage("FORMATION");
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

    const renderTacticsContext = () => {
      // Pitch context under the tactical layer: settled formation frame.
      renderTeamFormation(1, own.x, own.z, teammates);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      if (view === "TACTICS") {
        renderTacticsContext();
      } else {
        renderProgress(progressRef.current);
      }
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
    if (view === "TACTICS") {
      // P0-B default: immediate tactical field. No auto-run of the 6.2s
      // cinematic sequence; it stays reachable via the explicit action below.
      progressRef.current = 0;
      setStage("FORMATION");
      renderTacticsContext();
    } else if (reducedMotion) {
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
  }, [effectiveMode, formation.shapeLabel, own.x, own.z, spatial.nextMatch.label, spatial.nextTraining.label, spatial.scoreboardLabel, teammates, view]);

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

  const cinematicComplete = view === "CINEMATIC" && progress >= 0.985;
  const spatialReady = view === "TACTICS" || cinematicComplete;

  const startCinematic = () => {
    progressRef.current = 0;
    setProgress(0);
    setStage("APPROACH");
    setView("CINEMATIC");
  };

  const returnToTactics = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progressRef.current = 0;
    setProgress(0);
    setStage("FORMATION");
    setView("TACTICS");
  };

  return (
    <section
      className={`full-journey-surface ${spatialReady ? "full-journey-spatial-ready" : ""}`}
      aria-label="연속 3D 경기장 입장"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-entry-view={view}
      data-journey-stage={stage}
      data-journey-progress={progress.toFixed(3)}
      data-journey-complete={cinematicComplete ? "true" : "false"}
      data-live-scoreboard={scoreboardLive ? "true" : "false"}
      data-spatial-anchor-count={spatial.anchors.length}
      data-formation-teammate-count={formation.teammates.length}
    >
      {/* key={view}: destroy() force-loses the WebGL context, and a canvas whose
          context was lost cannot host a new renderer. A view switch therefore
          mounts a fresh canvas so the next renderer gets a live context. */}
      <canvas key={view} ref={canvasRef} className={`full-journey-canvas ${renderState === "READY" ? "full-journey-canvas-ready" : ""}`} />
      {renderState === "FALLBACK" && <div className="full-journey-static-field" aria-hidden="true" />}

      {view === "TACTICS" && <TeamTacticsField formation={formation} />}

      {view === "CINEMATIC" && (
        <div className="full-journey-team-state" aria-label="현재 팀 상태">
          <span>{formation.shapeLabel} · #{formation.player.shirtNumber} {formation.player.primaryPosition}</span>
          <strong>{spatial.scoreboardLabel}</strong>
        </div>
      )}

      {view === "TACTICS" && renderState === "READY" && (
        <button className="full-journey-cinematic" type="button" onClick={startCinematic}>
          시네마틱 입장
        </button>
      )}
      {view === "CINEMATIC" && cinematicComplete && (
        <button className="full-journey-cinematic" type="button" onClick={returnToTactics}>
          전술 필드 보기
        </button>
      )}

      {view === "CINEMATIC" && !cinematicComplete && (
        <button className="full-journey-skip" type="button" onClick={finishImmediately} disabled={renderState !== "READY"}>
          빠른 입장
        </button>
      )}

      {view === "CINEMATIC" && (
        <nav className="full-journey-anchor-layer" aria-label="Spatial Home 바로가기">
          {spatial.anchors.map((anchor) => (
            <Link
              className={`full-journey-anchor full-journey-anchor-${anchor.kind.toLowerCase()}`}
              data-testid="full-journey-anchor"
              data-spatial-kind={anchor.kind}
              key={anchor.id}
              tabIndex={cinematicComplete ? 0 : -1}
              aria-hidden={cinematicComplete ? undefined : true}
              to={anchor.destination}
            >
              <span>{anchor.kind}</span>
              <strong>{anchor.title}</strong>
              <small>{anchor.detail}</small>
            </Link>
          ))}
        </nav>
      )}

      {view === "CINEMATIC" && (
        <div className="full-journey-hud" aria-live="polite">
          <div>
            <span>FULL ENTRY</span>
            <strong>{stageLabel(stage)}</strong>
          </div>
          <div className="full-journey-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
        </div>
      )}
    </section>
  );
}
