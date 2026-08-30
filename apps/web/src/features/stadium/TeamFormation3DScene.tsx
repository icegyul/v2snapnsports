import { useEffect, useMemo, useRef, useState } from "react";
import type { CoreFormation, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface TeamFormation3DSceneProps {
  readonly mode: CoreVisualMode;
  readonly formation: CoreFormation;
  readonly onComplete?: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

type TeamMarker = Readonly<{
  x: number;
  z: number;
  shirtNumber: string;
  position: string;
}>;

function teammateToPitch(xPercent: number, yPercent: number): Readonly<{ x: number; z: number }> {
  const x = ((Math.min(100, Math.max(0, xPercent)) - 50) / 50) * 47;
  const z = ((Math.min(100, Math.max(0, yPercent)) - 50) / 50) * 29;
  return { x, z };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function TeamFormation3DScene({ mode, formation, onComplete }: TeamFormation3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);

  const markers = useMemo<readonly TeamMarker[]>(() => formation.teammates.map((teammate) => {
    const coordinate = teammateToPitch(teammate.x, teammate.y);
    return {
      ...coordinate,
      shirtNumber: teammate.shirtNumber,
      position: teammate.position,
    };
  }), [formation.teammates]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    progressRef.current = mode === "STATIC" ? 1 : 0;
    setProgress(progressRef.current);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    if (!canvas || effectiveMode === "STATIC") {
      setRenderState("FALLBACK");
      progressRef.current = 1;
      setProgress(1);
      onCompleteRef.current?.();
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

    const renderFormation = renderer.renderTeamFormation.bind(renderer);
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderFormation(progressRef.current, 0, 0, markers);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
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

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reducedMotion) {
      progressRef.current = 1;
      setProgress(1);
      renderFormation(1, 0, 0, markers);
      onCompleteRef.current?.();
    } else {
      const durationMs = 2700;
      const maxFrameDeltaMs = 120;
      const targetFrameDelayMs = 34;
      let elapsedMs = 0;
      let previousFrameAt = performance.now();
      let lastPublished = -1;
      const tick = () => {
        const now = performance.now();
        const rawDelta = now - previousFrameAt;
        previousFrameAt = now;
        elapsedMs += Math.min(maxFrameDeltaMs, Math.max(0, rawDelta));
        const nextProgress = clamp01(elapsedMs / durationMs);
        progressRef.current = nextProgress;
        renderFormation(nextProgress, 0, 0, markers);
        if (nextProgress === 1 || nextProgress - lastPublished >= 0.04) {
          lastPublished = nextProgress;
          setProgress(nextProgress);
        }
        if (nextProgress < 1) {
          timerRef.current = window.setTimeout(tick, targetFrameDelayMs);
        } else {
          timerRef.current = null;
          onCompleteRef.current?.();
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
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode, markers]);

  const revealCount = Math.min(markers.length, Math.floor(progress * (markers.length + 1)));

  return (
    <section
      className="team-formation-3d-surface"
      aria-label={`${formation.shapeLabel} 3D 팀 포메이션`}
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-formation-progress={progress.toFixed(3)}
      data-formation-complete={progress >= 1 ? "true" : "false"}
      data-teammate-count={markers.length}
    >
      <canvas ref={canvasRef} className={`team-formation-3d-canvas ${renderState === "READY" ? "team-formation-3d-ready" : ""}`} />
      <div className="team-formation-title-chip">
        <strong>{formation.shapeLabel}</strong>
        <span>연결된 동료 {markers.length}명</span>
      </div>
      <div className="team-formation-roster" aria-label="익명 포메이션 마커 목록">
        <span className="team-formation-own-chip">#{formation.player.shirtNumber} · 나</span>
        {markers.map((marker, index) => (
          <span key={`${marker.shirtNumber}-${marker.position}`} className={index < revealCount ? "is-visible" : ""} aria-label={`동료 등번호 ${marker.shirtNumber}, ${marker.position}`}>
            #{marker.shirtNumber} · {marker.position}
          </span>
        ))}
      </div>
      <div className="team-formation-hud">
        <span>{progress < 0.35 ? "나의 위치 기준 설정" : progress < 0.82 ? "동료 포지션 펼치는 중" : "현재 연결 데이터 표시 완료"}</span>
        <div><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </section>
  );
}
