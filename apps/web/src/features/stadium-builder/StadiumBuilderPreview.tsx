import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebglV14";
import { stadiumBuilderDraftToRecipe, type StadiumBuilderDraft, type StadiumBuilderStep } from "./stadiumBuilderModel";
import { getStadiumBuilderMotionProfile } from "./stadiumBuilderMotion";

interface StadiumBuilderPreviewProps {
  readonly draft: StadiumBuilderDraft;
  readonly reducedMotion?: boolean;
  readonly activeStep?: StadiumBuilderStep;
}

type PreviewState = "INITIALIZING" | "READY" | "FALLBACK";

export function StadiumBuilderPreview({ draft, reducedMotion = false, activeStep = "STYLE" }: StadiumBuilderPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const showcaseAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>("INITIALIZING");
  const [interactive, setInteractive] = useState(false);
  const [renderDraft, setRenderDraft] = useState<StadiumBuilderDraft>(draft);
  const [renderRevision, setRenderRevision] = useState(0);
  const [orbit, setOrbit] = useState(0);
  const orbitRef = useRef(0);
  const currentZoomRef = useRef(1);
  const dragStartRef = useRef<number | null>(null);
  const orbitStartRef = useRef(0);
  const focusZoom = activeStep === "SEAT"
    ? 1.65
    : activeStep === "FACADE_LIGHT"
      ? 1.22
      : activeStep === "BOWL" || activeStep === "ROOF" || activeStep === "STAND"
        ? 1.12
        : 1;
  const focusZoomRef = useRef(focusZoom);
  const focusInitializedRef = useRef(false);
  focusZoomRef.current = focusZoom;

  useEffect(() => {
    const timer = window.setTimeout(() => setRenderDraft(draft), 180);
    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    showcaseAnimationRef.current?.cancel();
    showcaseAnimationRef.current = null;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    setPreviewState("INITIALIZING");
    if (!canvas) return;
    setRenderRevision((current) => current + 1);

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, "FULL", stadiumBuilderDraftToRecipe(renderDraft));
    } catch (error) {
      console.error("Stadium Builder preview renderer failed", error);
      renderer = null;
    }
    if (!renderer) {
      setPreviewState("FALLBACK");
      return;
    }

    rendererRef.current = renderer;
    setPreviewState("READY");
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderer?.render(orbitRef.current, 1);
    };
    resize();

    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    const motion = getStadiumBuilderMotionProfile(reducedMotion).preview;
    if (motion.enabled) {
      const showcase = { orbit: motion.fromOrbit, zoom: motion.fromZoom * focusZoomRef.current };
      showcaseAnimationRef.current = animate(showcase, {
        orbit: motion.toOrbit,
        zoom: motion.toZoom * focusZoomRef.current,
        duration: motion.duration,
        ease: "out(3)",
        onUpdate: () => {
          currentZoomRef.current = showcase.zoom;
          renderer?.render(showcase.orbit, showcase.zoom);
        },
      });
    } else {
      currentZoomRef.current = focusZoomRef.current;
      renderer.render(0, focusZoomRef.current);
    }

    return () => {
      showcaseAnimationRef.current?.cancel();
      showcaseAnimationRef.current = null;
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [reducedMotion, renderDraft]);

  useEffect(() => {
    orbitRef.current = orbit;
    rendererRef.current?.render(orbit, currentZoomRef.current);
  }, [orbit]);

  useEffect(() => {
    if (!focusInitializedRef.current) {
      focusInitializedRef.current = true;
      return;
    }
    const renderer = rendererRef.current;
    if (!renderer) return;
    showcaseAnimationRef.current?.cancel();
    showcaseAnimationRef.current = null;
    if (reducedMotion) {
      currentZoomRef.current = focusZoom;
      renderer.render(orbitRef.current, focusZoom);
      return;
    }
    const focus = { zoom: currentZoomRef.current };
    showcaseAnimationRef.current = animate(focus, {
      zoom: focusZoom,
      duration: 620,
      ease: "out(3)",
      onUpdate: () => {
        currentZoomRef.current = focus.zoom;
        renderer.render(orbitRef.current, focus.zoom);
      },
    });
  }, [focusZoom, reducedMotion]);

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setInteractive(true);
    showcaseAnimationRef.current?.cancel();
    showcaseAnimationRef.current = null;
    dragStartRef.current = event.clientX;
    orbitStartRef.current = orbitRef.current;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    setOrbit(orbitStartRef.current + (event.clientX - dragStartRef.current) * 0.42);
  };

  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  return (
    <section
      className="stadium-builder-preview-panel"
      aria-label="경기장 Builder 3D 미리보기"
      data-rendered-preset={renderDraft.selectedPresetId}
      data-seat-pattern={renderDraft.seat.pattern}
      data-facade-profile={renderDraft.facadeLight.facade}
      data-lighting-profile={renderDraft.facadeLight.lighting}
      data-environment-profile={renderDraft.environment.profile}
      data-render-revision={renderRevision}
      data-triangle-count={rendererRef.current?.triangleCount ?? 0}
      data-preview-state={previewState}
    >
      <div className="stadium-builder-preview-head">
        <div>
          <span>LIVE PREVIEW</span>
          <strong>{draft.selectedPresetId}</strong>
        </div>
        <span className="stadium-builder-preview-state" data-preview-state={previewState}>{previewState === "READY" ? "FULL 3D" : previewState}</span>
      </div>
      <div
        className="stadium-builder-preview-stage"
        aria-label="3D 프리뷰 회전"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <canvas ref={canvasRef} className={`stadium-builder-preview-canvas ${previewState === "READY" ? "is-ready" : ""}`} />
        {previewState === "READY" && (
          <div className={`stadium-builder-preview-poster ${interactive ? "is-hidden" : ""}`} aria-hidden="true" />
        )}
        {previewState === "READY" && !interactive && (
          <button
            type="button"
            className="stadium-builder-preview-enter"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setInteractive(true)}
          >
            3D로 둘러보기 <span aria-hidden="true">→</span>
          </button>
        )}
        {previewState === "FALLBACK" && (
          <div className="stadium-builder-preview-fallback" aria-label="경기장 포스터 미리보기" />
        )}
        {previewState === "INITIALIZING" && <div className="stadium-builder-preview-loading">3D 미리보기 업데이트 중</div>}
        <div className="stadium-builder-preview-hint">드래그해서 경기장을 둘러보세요</div>
      </div>
      <dl className="stadium-builder-preview-meta">
        <div><dt>BOWL</dt><dd>{draft.bowl.tierCount}단 · {draft.bowl.profile}</dd></div>
        <div><dt>ROOF</dt><dd>{Math.round(draft.roof.coverage * 100)}% · {draft.roof.profile}</dd></div>
        <div><dt>SEAT</dt><dd>{draft.seat.pattern} · {Math.round(draft.seat.fillDensity * 100)}%</dd></div>
        <div><dt>ENV</dt><dd>{draft.environment.profile}</dd></div>
      </dl>
    </section>
  );
}
